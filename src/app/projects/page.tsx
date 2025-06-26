import React from 'react';
import ProjectsGrid from '../../components/ProjectsGrid';

export const metadata = {
  title: '專案儀表板 | Peien Wu',
  description: '探索 Peien Wu 的精選專案，涵蓋軟體工程、遊戲開發與現代網頁技術。',
};

export default function ProjectsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          專案儀表板
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          此頁面透過 GitHub API 即時取得星標、提交數等最新資訊，呈現我持續迭代的專案成果。
        </p>
      </header>

      <main>
        <ProjectsGrid />
      </main>
    </div>
  );
} 