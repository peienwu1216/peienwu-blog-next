"use client"; // 標記為客戶端元件

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function SiteHeader() {
  const blogTitle = "Peienwu's Code Lab";
  const blogSubtitle = "這裡沒有魔法，只有還沒讀懂的 Source Code";
  
  const [isVisible, setIsVisible] = useState(true); // 控制 Header 是否可見
  const [isScrolled, setIsScrolled] = useState(false); // 控制是否已經向下捲動過
  const lastScrollY = useRef(0); // 記錄上一次的捲動位置
  const headerRef = useRef<HTMLElement>(null); // 用來獲取 Header 的實際高度

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 70; // 預設一個高度以防剛載入時取不到

      if (currentScrollY > headerHeight) { // 只有當捲動超過 Header 高度時才觸發隱藏/顯示邏輯
        setIsScrolled(true); // 標記已經捲動
        if (currentScrollY > lastScrollY.current) { // 向下捲動
          setIsVisible(false);
        } else { // 向上捲動
          setIsVisible(true);
        }
      } else { // 在 Header 可見範圍內或回到最頂部
        setIsScrolled(false);
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 調整樣式使 Header 更窄
  // py-4 (上下 padding 變小)
  // h1: text-3xl (標題字體變小)
  // p: mt-1 text-base (副標題上邊距和字體變小)
  // nav: mt-3 text-sm (導覽列上邊距和字體變小)
  return (
    <header 
      ref={headerRef}
      className={`bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 py-4' : '-translate-y-full py-2' // 可見時正常 padding，隱藏時減少 padding (可選)
      } ${
        isScrolled && isVisible ? 'shadow-lg' : 'shadow-md' // 捲動時且可見時，陰影可以更明顯
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-90 opacity-0'}`}> {/* 隱藏時縮小淡出 */}
          <Link href="/" className="hover:opacity-80 transition-opacity">{blogTitle}</Link>
        </h1>
        <p className={`mt-1 text-base sm:text-lg text-slate-600 dark:text-slate-400 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}> {/* 隱藏時淡出且不佔空間 */}
          {blogSubtitle}
        </p>
        <nav className={`mt-3 space-x-3 sm:space-x-4 text-sm sm:text-base transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}> {/* 隱藏時淡出 */}
          <Link href="/" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">首頁</Link>
          <Link href="/about" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">關於我</Link>
          <Link href="/categories" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">分類</Link>
          <Link href="/tags" className="font-medium text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">標籤</Link>
        </nav>
      </div>
    </header>
  );
}