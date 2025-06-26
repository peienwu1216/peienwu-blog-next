"use client";

import { createPortal } from 'react-dom';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { searchPosts, getSearchSuggestions, highlightText, extractExcerpt, SearchResult } from '@/lib/search';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

// SVG 圖示元件
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CommandIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
  </svg>
);

// --- 新增的圖示 ---
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21c3.978 0 7.443-2.31 9.002-5.498Z" />
  </svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
    </svg>
);

const CodeBracketIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V5.75A2.25 2.25 0 0 0 18 3.5H6A2.25 2.25 0 0 0 3.75 5.75v12.5A2.25 2.25 0 0 0 6 20.25Z" />
    </svg>
);

const ProjectIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6.75h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M12.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

// --- 命令項目類型定義 ---
interface Command {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action: () => void;
  section: '導航' | '命令' | '外部連結';
  // for dynamic items, we add the data here
  data?: any;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions] = useState(() => getSearchSuggestions());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Memoize commands to prevent re-calculation on every render
  const allCommands = React.useMemo(() => {
    const staticCommands: Command[] = [
        { name: '首頁', icon: HomeIcon, action: () => router.push('/'), section: '導航' },
        { name: '關於我', icon: DocumentIcon, action: () => router.push('/about'), section: '導航' },
        { name: '所有標籤', icon: TagIcon, action: () => router.push('/tags'), section: '導航' },
        { name: '專案儀表板', icon: ProjectIcon, action: () => router.push('/projects'), section: '導航' },
        { name: '切換主題', icon: theme === 'dark' ? SunIcon : MoonIcon, action: toggleTheme, section: '命令' },
        { name: '複製網址', icon: LinkIcon, action: () => navigator.clipboard.writeText(window.location.href), section: '命令' },
        { name: '查看原始碼', icon: GithubIcon, action: () => window.open('https://github.com/peienwu1216/peienwu-blog-next', '_blank'), section: '外部連結' },
      ];

      return staticCommands;
  }, [theme, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 搜尋邏輯
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      const searchResults = searchPosts(searchQuery, 10);
      setResults(searchResults);
      setSelectedIndex(-1);
      setIsLoading(false);
    },
    []
  );

  // 防抖搜尋
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // 當模態開啟時聚焦到輸入框
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // 鍵盤導航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const isCommandView = query.trim() === '';
      const activeListLength = isCommandView ? allCommands.length : results.length;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < activeListLength - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex < 0) return;
          
          if (isCommandView) {
            allCommands[selectedIndex].action();
            onClose();
          } else {
            if (results[selectedIndex]) {
              window.location.href = results[selectedIndex].post.url || `/posts/${results[selectedIndex].post.slug}`;
            }
          }
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, results, query, allCommands]);

  // 阻止背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-0 sm:pt-20"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg animate-in fade-in" />
      
      <div 
        className="relative flex flex-col w-full h-full overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-w-2xl sm:rounded-xl animate-in fade-in zoom-in-95 duration-300 sm:max-h-[calc(100vh-12rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header Section --- */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <SearchIcon className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋文章..."
            className="flex-1 text-lg bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
          />
          <div className="hidden sm:flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 rounded border">ESC</kbd>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="關閉搜尋"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors sm:hidden"
            aria-label="關閉搜尋"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* --- Results Section (Scrollable) --- */}
        <div ref={resultsRef} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-slate-600 dark:text-slate-400">搜尋中...</span>
            </div>
          ) : query ? (
            results.length > 0 ? (
              <div className="py-2">
                <h4 className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">文章</h4>
                {results.map((result, index) => (
                  <Link
                    key={result.post._id}
                    href={result.post.url || `/posts/${result.post.slug}`}
                    onClick={onClose}
                    className={`block px-4 py-3 mx-2 my-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                      index === selectedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <h3 
                        className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: highlightText(result.post.title, query) }}
                      />
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{format(parseISO(result.post.date), 'yyyy/MM/dd')}</span>
                        {result.post.category && (
                          <>
                            <span>•</span>
                            <span dangerouslySetInnerHTML={{ __html: highlightText(result.post.category, query) }} />
                          </>
                        )}
                        <div className="flex gap-1 ml-auto">
                          {result.matches.title && <span className="px-1 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">標題</span>}
                          {result.matches.category && <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">分類</span>}
                          {result.matches.tags && <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">標籤</span>}
                          {result.matches.content && <span className="px-1 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">內容</span>}
                        </div>
                      </div>
                      {result.matches.content && (
                        <p 
                          className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: highlightText(extractExcerpt(result.post.body?.raw || '', query), query) }}
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">找不到結果</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">試試其他關鍵字</p>
              </div>
            )
          ) : (
            <div className="py-2">
              {/* --- 靜態命令 --- */}
              {['導航', '命令', '外部連結'].map(section => (
                <div key={section} className="mb-2">
                  <h4 className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{section}</h4>
                  {allCommands.filter(cmd => cmd.section === section).map((command) => {
                    const globalIndex = allCommands.findIndex(c => c.name === command.name);
                    return (
                      <button
                        key={command.name}
                        onClick={() => { command.action(); onClose(); }}
                        className={`flex items-center gap-3 w-full text-left px-4 py-2.5 mx-2 my-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                          globalIndex === selectedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                      >
                        <command.icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        <span className="text-slate-900 dark:text-slate-100 flex-1">{command.name}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMounted) {
    return createPortal(modalContent, document.body);
  }

  return null;
} 