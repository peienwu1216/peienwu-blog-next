'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Music2, Play } from 'lucide-react';
import AnthemCard from './AnthemCard';
import { usePathname } from 'next/navigation';

export default function FloatingAnthemButton() {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAboutPage = pathname === '/about';

  // 點擊外部自動關閉
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <>
      {/* 懸浮徽章 - 重新設計 */}
      <div className="fixed z-50 bottom-28 right-8 md:bottom-24 md:right-8 lg:bottom-28 lg:right-8">
        {/* 背景光暈效果 */}
        {!isAboutPage && (
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isHovered 
                ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20 blur-xl scale-125' 
                : 'bg-gradient-to-r from-sky-400/10 to-blue-500/10 blur-lg scale-100'
            }`}
          />
        )}
        
        {/* 主按鈕 - 與 AI 按鈕保持一致 */}
        <button
          ref={buttonRef}
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative rounded-full 
            bg-gradient-to-br from-sky-500 to-blue-600
            p-5 text-white shadow-2xl 
            ring-4 ring-sky-300 dark:ring-sky-800
            transition-transform focus:outline-none
            transform active:scale-95
            ${open ? 'ring-sky-400/50 shadow-sky-500/30' : ''}
            ${!isAboutPage ? 'hover:scale-110' : ''}
          `}
          title="我的主題曲"
          aria-label="我的主題曲"
        >
          {/* 圖標容器 */}
          <div className="relative z-10 flex items-center justify-center">
            {open ? (
              <Play className="h-7 w-7 transition-all duration-300 transform rotate-0" />
            ) : (
              <Music2 className="h-7 w-7 transition-all duration-300" />
            )}
          </div>
          
          {/* 脈動效果 */}
          {!isAboutPage && isHovered && (
            <div className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping" />
          )}
        </button>
      </div>

      {/* Popover 卡片 - 調整位置適應右側 */}
      {open && (
        <div
          ref={popoverRef}
          className="fixed z-50 bottom-36 right-8 md:bottom-48 md:right-8 lg:bottom-52 lg:right-8"
        >
          {/* 箭頭 - 調整方向適應右側 */}
          <div className="flex justify-end pr-6 mb-1">
            <div className="relative">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/80 dark:border-b-slate-800/80 backdrop-blur-sm" />
              <div className="absolute top-0 left-0 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-sky-500/20" />
            </div>
          </div>
          
          {/* 卡片容器 */}
          <div className="animate-fade-in-scale">
            <AnthemCard className="w-[340px] max-w-[90vw] shadow-2xl" />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in-scale {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
} 