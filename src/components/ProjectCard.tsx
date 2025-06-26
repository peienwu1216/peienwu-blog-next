'use client';

import React from 'react';
import { Project } from '@/lib/projects-data';

// --- Icon Imports (assuming these are defined elsewhere or passed as props) ---
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 13.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.192L.818 6.56a.75.75 0 0 1 .416-1.28l4.21-.61L7.327.668A.75.75 0 0 1 8 .25Z" /></svg>;
const ForkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5H5.75A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.5 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0ZM5 12.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" /></svg>;
const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
  </svg>
);

const CommitIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 5.5a4.5 4.5 0 0 0-1 8.894V17a1 1 0 1 0 2 0v-2.606A4.5 4.5 0 0 0 10 5.5Zm-3 4.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" clipRule="evenodd"/></svg>
);

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="flex flex-col rounded-lg bg-white dark:bg-slate-800 shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
          >
            {project.title}
          </a>
        </h3>
        <div className="prose prose-slate dark:prose-invert max-w-none mb-4 text-sm">
          {project.description.map((paragraph, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, index) => (
            <span key={index} className="inline-block bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 text-xs font-semibold px-2.5 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{project.category}</span>
        
        <div className="flex items-center gap-4">
          {project.stars !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <StarIcon className="w-4 h-4 text-yellow-500" />
              <span>{project.stars}</span>
            </div>
          )}
          {project.forks !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <ForkIcon className="w-4 h-4" />
              <span>{project.forks}</span>
            </div>
          )}
          {project.commits !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
              <CommitIcon className="w-4 h-4" />
              <span>{project.commits}</span>
            </div>
          )}

          {/* Vertical divider */}
          {(project.stars !== undefined || project.forks !== undefined || project.commits !== undefined) && 
           (project.repoUrl || project.liveDemoUrl) && 
           <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>}

          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            <GithubIcon className="w-5 h-5" />
          </a>
          {project.liveDemoUrl && (
            <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              <ExternalLinkIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 