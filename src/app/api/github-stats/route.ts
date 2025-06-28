import { Octokit } from 'octokit';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Vercel Edge Functions are great for this
export const revalidate = 3600; // 1 hour in seconds

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

// Define the repositories to track
const repositories = [
  'peienwu1216/oop-2025-proj-pycade',
  'peienwu1216/peienwu-blog-next',
  'peienwu1216/CrazyArcade-CPP-Game',
  'peienwu1216/peienwu-blog',
];

// Helper function to get deployment status
async function getDeploymentStatus(owner: string, repo: string) {
  try {
    const deployments = await octokit.request('GET /repos/{owner}/{repo}/deployments', {
      owner,
      repo,
      per_page: 1, // We only need the latest one
    });
    if (deployments.data.length === 0) return 'inactive';

    const latestDeployment = deployments.data[0];
    const statuses = await octokit.request('GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
      owner,
      repo,
      deployment_id: latestDeployment.id,
      per_page: 1,
    });
    return statuses.data.length > 0 ? statuses.data[0].state : 'pending';
  } catch (error) {
    console.error(`Failed to get deployment status for ${owner}/${repo}:`, error);
    return 'error';
  }
}

export async function GET() {
  try {
    const statsPromises = repositories.map(async (repo) => {
      const [owner, repoName] = repo.split('/');
      
      // Fetch main repository data and deployment status in parallel
      const [repoDetails, deploymentStatus, commits] = await Promise.all([
        octokit.request('GET /repos/{owner}/{repo}', {
            owner: owner,
            repo: repoName,
        }),
        getDeploymentStatus(owner, repoName),
        octokit.request('GET /repos/{owner}/{repo}/commits', {
          owner,
          repo: repoName,
          per_page: 1,
        }),
      ]);

      // Derive total commits via Link header if present
      let commitCount = 0;
      const linkHeader = commits.headers.link as string | undefined;
      if (linkHeader) {
        // Example: <https://api.github.com/repositories/123/commits?per_page=1&page=257>; rel="last"
        const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
        if (match) commitCount = parseInt(match[1], 10);
      } else {
        // Fallback: if no link header (≤1 page), commits.data length is total
        commitCount = Array.isArray(commits.data) ? commits.data.length : 0;
      }

      return {
        name: repoName,
        url: repoDetails.data.html_url,
        stars: repoDetails.data.stargazers_count,
        forks: repoDetails.data.forks_count,
        issues: repoDetails.data.open_issues_count,
        commits: commitCount,
        status: deploymentStatus,
      };
    });

    const stats = await Promise.all(statsPromises);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch GitHub stats' }), 
      { status: 500 }
    );
  }
} 