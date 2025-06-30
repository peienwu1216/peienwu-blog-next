"use client"; // 標記為客戶端元件

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 引入 usePathname
import { useState, useEffect, useRef } from 'react';
import SearchButton from './SearchButton';
import SearchModal from './SearchModal'; // 引入 SearchModal
import { ThemeToggleButton } from './ThemeToggleButton';

// SVG 圖示元件
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function SiteHeader() {
  const [isStuck, setIsStuck] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 新增 SearchModal 狀態
  const pathname = usePathname(); // 獲取當前路徑
  const sentinelRef = useRef<HTMLDivElement>(null);

  // --- 新增: 處理 Cmd+K 開啟 SearchModal ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 使用 IntersectionObserver 取代 scroll 事件，避免臨界點震盪
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 當 sentinel 離開視窗頂端，就代表 Header 已「貼附」
        setIsStuck(!entry.isIntersecting);
      },
      {
        rootMargin: '-1px 0px 0px 0px', // 提前 1px 觸發
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  
  // 當行動版選單開啟時，禁止背景滾動
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto'; // 元件卸載時恢復
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: '首頁' },
    { href: '/about', label: '關於我' },
    { href: '/projects', label: '專案' },
    { href: '/categories', label: '分類' },
    { href: '/tags', label: '標籤' },
    { href: '/posts', label: '所有文章' },
  ];

  return (
    <>
      {/* 觀察用的 sentinel 必須置於 Header 前 */}
      <div ref={sentinelRef} className="absolute top-0 h-px w-full" />

      <header
        className={`
          sticky top-0 z-50 w-full backdrop-blur-md
          transition-colors duration-300 ease-in-out
          ${isStuck ? 'shadow-md bg-white/80 dark:bg-slate-900/80' : 'bg-transparent'}
        `}
      >
        <div
          className={`
            container mx-auto flex items-center justify-between px-4 sm:px-6
            transition-all duration-300 ease-in-out py-4
          `}
        >
          <div className="flex flex-col">
            <Link href="/" className="text-xl font-bold text-slate-900 dark:text-slate-50" onClick={() => setIsMenuOpen(false)}>
              Peienwu's Code Lab
            </Link>
            <p
              className={`
                text-slate-600 dark:text-slate-400
                transition-all duration-300 ease-in-out
                ${isStuck ? 'text-xs' : 'text-sm'}
              `}
            >
              這裡沒有魔法，只有還沒讀懂的 Source Code
            </p>
          </div>

          {/* 桌面導覽列和搜尋 */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <SearchButton onClick={() => setIsSearchOpen(true)} />
              <ThemeToggleButton />
            </div>
          </div>

          {/* 手機版：搜尋按鈕和漢堡選單 */}
          <div className="md:hidden flex items-center gap-2">
            <SearchButton onClick={() => setIsSearchOpen(true)} />
            <button onClick={() => setIsMenuOpen(true)} className="text-slate-700 dark:text-slate-300" aria-label="開啟選單">
              <MenuIcon className="h-7 w-7" />
            </button>
          </div>
        </div>
      </header>

      {/* --- 行動版側滑選單 --- */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* 背景遮罩 */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        {/* 選單面板 */}
        <div
          className={`absolute top-0 right-0 h-full w-3/4 max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="flex justify-between items-center p-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <ThemeToggleButton size="base" />
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-600 dark:text-slate-400" aria-label="關閉選單">
              <CloseIcon className="h-7 w-7" />
            </button>
          </div>
          <nav className="flex flex-col p-4 pt-2 space-y-1">
            {navLinks.map((link) => {
              const isActive = (pathname === link.href) || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    text-base tracking-wide text-slate-700 dark:text-slate-300
                    py-2.5 px-4 rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-green-100 dark:bg-green-900/50 font-semibold text-green-700 dark:text-green-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* --- 全域 SearchModal --- */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}