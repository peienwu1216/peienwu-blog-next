'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Music2, Play } from 'lucide-react';
import AnthemCard from './AnthemCard';

export default function FloatingAnthemButton() {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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
      <div className="fixed z-50 bottom-28 right-6 md:bottom-32 md:right-10">
        {/* 背景光暈效果 */}
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            isHovered 
              ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20 blur-xl scale-125' 
              : 'bg-gradient-to-r from-sky-400/10 to-blue-500/10 blur-lg scale-100'
          }`}
        />
        
        {/* 主按鈕 */}
        <button
          ref={buttonRef}
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative w-14 h-14 rounded-full 
            bg-gradient-to-br from-sky-500 via-blue-500 to-sky-600
            hover:from-sky-400 hover:via-blue-400 hover:to-sky-500
            backdrop-blur-sm border border-white/20 dark:border-slate-700/30
            shadow-2xl hover:shadow-sky-500/25
            flex items-center justify-center text-white
            transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
            transform hover:scale-110 active:scale-95
            ${open ? 'ring-2 ring-sky-400/50 shadow-sky-500/30' : ''}
          `}
          title="我的主題曲"
          aria-label="我的主題曲"
        >
          {/* 內部光暈 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          
          {/* 圖標容器 */}
          <div className="relative z-10 flex items-center justify-center">
            {open ? (
              <Play className="w-6 h-6 transition-all duration-300 transform rotate-0" />
            ) : (
              <Music2 className="w-6 h-6 transition-all duration-300" />
            )}
          </div>
          
          {/* 脈動效果 */}
          {isHovered && (
            <div className="absolute inset-0 rounded-full bg-sky-400/30 animate-ping" />
          )}
        </button>
        
        {/* 標籤提示 */}
        {isHovered && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm border border-white/20 dark:border-slate-700/30 shadow-lg">
            我的主題曲
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-b-4 border-t-4 border-l-slate-900/90 dark:border-l-slate-100/90 border-r-transparent border-b-transparent border-t-transparent" />
          </div>
        )}
      </div>

      {/* Popover 卡片 - 增強動畫 */}
      {open && (
        <div
          ref={popoverRef}
          className="fixed z-50 bottom-52 right-6 md:bottom-56 md:right-10"
        >
          {/* 箭頭 - 重新設計 */}
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