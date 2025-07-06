'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Music2 } from 'lucide-react';
import AnthemCard from './AnthemCard';

export default function FloatingAnthemButton() {
  const [open, setOpen] = useState(false);
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
      {/* 懸浮徽章 */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-28 right-6 md:bottom-32 md:right-10 w-12 h-12 rounded-full bg-sky-600 hover:bg-sky-700 shadow-xl flex items-center justify-center text-white text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
        title="我的主題曲"
        aria-label="我的主題曲"
        style={{ boxShadow: '0 4px 24px 0 rgba(0, 120, 255, 0.15)' }}
      >
        <Music2 className="w-7 h-7" />
      </button>
      {/* Popover 卡片 */}
      {open && (
        <div
          ref={popoverRef}
          className="fixed z-50 bottom-44 right-6 md:bottom-48 md:right-10 animate-fade-in"
        >
          {/* 箭頭 */}
          <div className="flex justify-end pr-6">
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-slate-800" />
          </div>
          <AnthemCard className="w-[340px] max-w-[90vw]" />
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </>
  );
} 