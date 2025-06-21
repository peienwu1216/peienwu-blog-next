"use client";

import { createPortal } from 'react-dom';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { searchPosts, getSearchSuggestions, highlightText, extractExcerpt, SearchResult } from '@/lib/search';

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
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            window.location.href = results[selectedIndex].post.url || `/posts/${results[selectedIndex].post.slug}`;
          }
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, results]);

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
        className="relative flex flex-col w-full h-full overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-w-2xl sm:rounded-xl animate-in fade-in zoom-in-95 duration-300"
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
          ) : query && results.length > 0 ? (
            <div className="py-2">
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
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">找不到相關文章</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">試試其他關鍵字或瀏覽所有文章</p>
            </div>
          ) : (
            <div className="py-4">
              <div className="px-4 mb-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">搜尋建議</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CommandIcon className="w-3 h-3" />
                      <span>選擇</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">↑↓</kbd>
                      <span>導航</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs">ESC</kbd>
                      <span>關閉</span>
                    </span>
                  </div>
                </div>
              </div>
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