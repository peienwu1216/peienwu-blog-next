"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { searchPosts, getSearchSuggestions, highlightText, extractExcerpt, SearchResult } from '@/lib/search';

// SVG 圖示組件
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const NoResultsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
  </svg>
);

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState(() => getSearchSuggestions());

  // 從 URL 參數獲取搜尋關鍵字
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) {
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // 模擬搜尋延遲
    const searchResults = searchPosts(searchQuery, 50);
    setResults(searchResults);
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(query.trim())}`;
      window.history.pushState({}, '', newUrl);
      performSearch(query);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 搜尋標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          搜尋文章
        </h1>
        
        {/* 搜尋表單 */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜尋文章、分類、標籤..."
                className="w-full pl-10 pr-4 py-3 text-lg border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              搜尋
            </button>
          </div>
        </form>
      </div>

      {/* 搜尋結果 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">搜尋中...</span>
        </div>
      ) : query && results.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              搜尋結果
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              找到 {results.length} 篇相關文章
            </span>
          </div>
          
          <div className="space-y-6">
            {results.map((result) => (
              <article key={result.post._id} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-semibold">
                    <Link 
                      href={result.post.url || `/posts/${result.post.slug}`}
                      className="text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.post.title, query) 
                      }}
                    />
                  </h3>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>{format(parseISO(result.post.date), 'yyyy年MM月dd日')}</span>
                    {result.post.category && (
                      <>
                        <span>•</span>
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(result.post.category, query) 
                          }}
                        />
                      </>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {result.matches.title && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">標題</span>}
                      {result.matches.category && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">分類</span>}
                      {result.matches.tags && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">標籤</span>}
                      {result.matches.content && <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs">內容</span>}
                    </div>
                  </div>
                  
                  {result.matches.content && (
                    <p 
                      className="text-slate-600 dark:text-slate-300 line-clamp-3"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(
                          extractExcerpt((result.post as any).plainText || '', query, 200),
                          query
                        )
                      }}
                    />
                  )}
                  
                  {result.post.tags && result.post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {result.post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                          className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          dangerouslySetInnerHTML={{ 
                            __html: '#' + highlightText(tag, query) 
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : query && results.length === 0 ? (
        <div className="text-center py-12">
          <NoResultsIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            找不到相關文章
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            抱歉，沒有找到包含「{query}」的文章
          </p>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">您可以試試：</p>
            <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
              <li>• 檢查拼字是否正確</li>
              <li>• 嘗試使用不同的關鍵字</li>
              <li>• 使用更一般性的搜尋詞</li>
              <li>• 瀏覽所有文章或分類</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            熱門搜尋
          </h2>
          <div className="flex flex-wrap gap-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  performSearch(suggestion);
                  const newUrl = `/search?q=${encodeURIComponent(suggestion)}`;
                  window.history.pushState({}, '', newUrl);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              href="/posts" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              瀏覽所有文章
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
} 