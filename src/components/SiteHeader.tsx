"use client"; // 標記為客戶端元件

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // 捲動超過 50px 時觸發
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isScrolled ? 'shadow-md bg-white/80 dark:bg-slate-900/80' : 'bg-transparent'}
      `}
    >
      <div
        className={`
          container mx-auto flex items-center justify-between
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'py-2' : 'py-6'}
        `}
      >
        <div className="flex flex-col">
          <Link href="/" className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Peienwu's Code Lab
          </Link>
          <p
            className={`
              text-slate-600 dark:text-slate-400
              transition-all duration-300 ease-in-out
              ${isScrolled ? 'text-xs' : 'text-sm'}
            `}
          >
            這裡沒有魔法，只有還沒讀懂的 Source Code
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-50">首頁</Link>
          <Link href="/about" className="hover:text-slate-900 dark:hover:text-slate-50">關於我</Link>
          <Link href="/categories" className="hover:text-slate-900 dark:hover:text-slate-50">分類</Link>
          <Link href="/tags" className="hover:text-slate-900 dark:hover:text-slate-50">標籤</Link>
          <Link href="/posts" className="hover:text-slate-900 dark:hover:text-slate-50">所有文章</Link>
        </nav>
      </div>
    </header>
  );
}