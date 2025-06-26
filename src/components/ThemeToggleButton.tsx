'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M17.99 17.99l1.77 1.77M2 12h2.5M19.5 12H22M4.22 19.78l1.77-1.77M17.99 6.01l1.77-1.77" />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
);

interface ThemeToggleButtonProps {
  size?: 'sm' | 'base';
}

export function ThemeToggleButton({ size = 'sm' }: ThemeToggleButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 為了避免 hydration mismatch，在客戶端渲染前先渲染一個佔位符
    const placeholderSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    return <div className={placeholderSize} />;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  const buttonPaddingClass = size === 'sm' ? 'p-1' : 'p-2';

  return (
    <button
      onClick={toggleTheme}
      className={`${buttonPaddingClass} rounded-full text-slate-600/60 dark:text-slate-300/60 hover:text-slate-800/90 dark:hover:text-slate-100/90 hover:bg-slate-200/40 dark:hover:bg-slate-700/40 transition-colors`}
      aria-label="切換佈景主題"
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className={iconSizeClass} />
      ) : (
        <MoonIcon className={iconSizeClass} />
      )}
    </button>
  );
} 