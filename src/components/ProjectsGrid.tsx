"use client";

import React, { useEffect, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { projectsData as staticData, Project } from '@/lib/projects-data';

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>(staticData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/github-stats');
        const stats = await res.json();
        const updated = staticData.map((proj) => {
          const repoName = proj.repoUrl.split('/').pop();
          const stat = stats.find((s: any) => s.name === repoName);
          return stat
            ? { ...proj, stars: stat.stars, forks: stat.forks, commits: stat.commits }
            : proj;
        });
        setProjects(updated);
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-center text-slate-500 dark:text-slate-400">載入 GitHub 即時資訊中...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {projects.map((project, index) => (
        <ProjectCard key={index} project={project} />
      ))}
    </div>
  );
} 