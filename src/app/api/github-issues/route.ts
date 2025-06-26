import { Octokit } from "@octokit/core";
import { NextResponse } from "next/server";

export const revalidate = 60; // Cache this route for 60 seconds

const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_PROJECT_ID = process.env.GITHUB_PROJECT_ID;

const octokit = GITHUB_PAT ? new Octokit({ auth: GITHUB_PAT }) : null;

// Type definitions for the GraphQL response
interface ProjectItem {
  content: {
    title: string;
    url: string;
    number: number;
    repository: {
      name: string;
    };
  };
  fieldValues: {
    nodes: {
      field?: { name: string };
      name?: string; // For single select fields like 'Status'
    }[];
  };
}

export async function GET() {
  if (!octokit || !GITHUB_USERNAME || !GITHUB_PROJECT_ID) {
    return NextResponse.json(
      { error: "GitHub environment variables are not configured correctly on the server." },
      { status: 500 }
    );
  }

  try {
    const response: any = await octokit.graphql(
      `
      query getProjectWithItems($login: String!, $projectNumber: Int!) {
        user(login: $login) {
          projectV2(number: $projectNumber) {
            items(first: 100, orderBy: {field: POSITION, direction: ASC}) {
              nodes {
                content {
                  ... on Issue {
                    title
                    url
                    number
                    repository {
                      name
                    }
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
      {
        login: GITHUB_USERNAME,
        projectNumber: parseInt(GITHUB_PROJECT_ID),
      }
    );

    const items: ProjectItem[] = response.user.projectV2.items.nodes.filter(
      (item: any) => item.content
    );

    const todoIssues = [];
    const inProgressIssues = [];

    for (const item of items) {
      const statusFieldValue = item.fieldValues.nodes.find(
        (fv: any) => fv.field?.name === "Status"
      );

      if (statusFieldValue) {
        const status = statusFieldValue.name;
        if (status === "Todo") {
          todoIssues.push(item.content);
        } else if (status === "In Progress") {
          inProgressIssues.push(item.content);
        }
      }
    }

    return NextResponse.json({
      todo: todoIssues,
      inProgress: inProgressIssues,
    });
  } catch (error) {
    console.error("Error fetching GitHub project issues:", error);
    // Provide a more informative error response
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub project issues.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 