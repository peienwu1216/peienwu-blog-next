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

// --- Start of new icons and components ---
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

const CircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
        <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
        <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"></path>
    </svg>
);
  
const InProgressIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
        <path d="M8 16a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.5-11.5a.5.5 0 0 0-1 0V8h-2a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5v-4Z"></path>
    </svg>
);

const IssueIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
        <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm-1.5 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Zm.5 2.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1h-.5a.5.5 0 0 1-.5-.5Z"></path>
    </svg>
);

const DevPlanIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

// --- End of new icons and components ---

// --- Type Definitions Update ---
type View = 'main' | 'github';

interface Command {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action: () => void;
  section: '導航' | '命令' | '外部連結';
  data?: any;
}

interface GitHubIssue {
    title: string;
    url: string;
    number: number;
    repository: {
        name: string;
    };
}

interface GitHubProjectData {
    todo: GitHubIssue[];
    inProgress: GitHubIssue[];
}

type GitHubViewItem = 
    | { type: 'back'; name: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; action: () => void; }
    | (GitHubIssue & { type: 'issue'; status: 'Todo' | 'In Progress'; });


interface GitHubIssuesViewProps {
    onBack: () => void;
    onClose: () => void;
    setParentIndex: (index: number) => void;
}

// --- GitHub Issues Sub-component ---
const GitHubIssuesView: React.FC<GitHubIssuesViewProps> = ({ onBack, onClose, setParentIndex }) => {
    const [issues, setIssues] = useState<GitHubProjectData>({ todo: [], inProgress: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await fetch('/api/github-issues');
                if (res.ok) {
                    const data = await res.json();
                    setIssues(data);
                }
            } catch (error) {
                console.error("Failed to fetch GitHub issues", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const allItems: GitHubViewItem[] = [
        { type: 'back', name: '返回', icon: ArrowLeftIcon, action: onBack },
        ...issues.inProgress.map(issue => ({ ...issue, type: 'issue' as const, status: 'In Progress' as const })),
        ...issues.todo.map(issue => ({ ...issue, type: 'issue' as const, status: 'Todo' as const })),
    ];
    
    useEffect(() => {
        setParentIndex(selectedIndex);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = allItems[selectedIndex];
                if (item.type === 'back') {
                    item.action();
                } else if (item.type === 'issue') {
                    window.open(item.url, '_blank');
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, allItems, onClose, onBack, setParentIndex]);

    const renderItem = (item: GitHubViewItem, index: number) => {
        const isSelected = selectedIndex === index;
        const baseClasses = "flex items-center gap-4 px-4 py-3 text-sm cursor-pointer";
        const selectedClasses = "bg-slate-100 dark:bg-slate-700/50";
        const textClasses = isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300";
        const iconClasses = isSelected ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400";

        if (item.type === 'back') {
            return (
                <div key="back" className={`${baseClasses} ${isSelected ? selectedClasses : ''}`} onClick={item.action}>
                    <item.icon className={`w-5 h-5 ${iconClasses}`} />
                    <span className={textClasses}>{item.name}</span>
                </div>
            );
        }
        
        const statusIcon = item.status === 'In Progress' 
            ? <InProgressIcon className="w-5 h-5 text-yellow-500" /> 
            : <CircleIcon className="w-5 h-5 text-green-500" />;

        return (
            <div 
                key={`${item.repository.name}#${item.number}`} 
                className={`${baseClasses} ${isSelected ? selectedClasses : ''}`}
                onClick={() => { window.open(item.url, '_blank'); onClose(); }}
                onMouseMove={() => setSelectedIndex(index)}
            >
                {statusIcon}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <span className={`truncate font-medium ${textClasses}`}>{item.title}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {item.repository.name}#{item.number}
                    </span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <div className="p-6 text-center text-slate-500">正在讀取開發計畫...</div>;
    }

    const inProgressItems = allItems.filter(it => it.type === 'issue' && it.status === 'In Progress');
    const todoItems = allItems.filter(it => it.type === 'issue' && it.status === 'Todo');

    return (
        <div>
            {inProgressItems.length > 0 && <div className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500">進行中</div>}
            {inProgressItems.map(item => renderItem(item, allItems.indexOf(item)))}
            
            {todoItems.length > 0 && <div className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 dark:text-slate-500">待辦</div>}
            {todoItems.map(item => renderItem(item, allItems.indexOf(item)))}
            
            <div className="border-t border-slate-200 dark:border-slate-700 mt-2">
                {renderItem(allItems[0], 0)}
            </div>
        </div>
    );
};
// --- End of GitHub Issues Sub-component ---

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
  const [view, setView] = useState<View>('main');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const allCommands = React.useMemo(() => {
    const staticCommands: Command[] = [
        { name: '首頁', icon: HomeIcon, action: () => router.push('/'), section: '導航' },
        { name: '關於我', icon: DocumentIcon, action: () => router.push('/about'), section: '導航' },
        { name: '所有標籤', icon: TagIcon, action: () => router.push('/tags'), section: '導航' },
        { name: '專案儀表板', icon: ProjectIcon, action: () => router.push('/projects'), section: '導航' },
        { name: '切換主題', icon: theme === 'dark' ? SunIcon : MoonIcon, action: toggleTheme, section: '命令' },
        { name: '查看開發計畫...', icon: DevPlanIcon, action: () => setView('github'), section: '命令' },
        { name: '複製網址', icon: LinkIcon, action: () => navigator.clipboard.writeText(window.location.href), section: '命令' },
        { name: '查看原始碼', icon: GithubIcon, action: () => window.open('https://github.com/peienwu1216/peienwu-blog-next', '_blank'), section: '外部連結' },
      ];
      return staticCommands;
  }, [theme, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
      setQuery('');
      setSelectedIndex(-1);
      if (isOpen && view === 'main') {
        inputRef.current?.focus();
      }
  }, [view, isOpen]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const searchResults = searchPosts(searchQuery, 10);
      setResults(searchResults);
      setSelectedIndex(-1);
      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    if (view === 'main') {
        const timeoutId = setTimeout(() => {
            performSearch(query);
        }, 300);
        return () => clearTimeout(timeoutId);
    }
  }, [query, performSearch, view]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (view !== 'main') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const isCommandView = query.trim() === '';
      const list = isCommandView ? allCommands : results;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, list.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (isCommandView) {
            const command = allCommands[selectedIndex];
            command.action();
            if (command.name !== '查看開發計畫...') {
                onClose();
            }
        } else {
            const result = results[selectedIndex];
            window.location.href = result.post.url || `/posts/${result.post.slug}`;
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, results, query, allCommands, view]);

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

  const resetView = () => {
    setView('main');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-0 sm:pt-20" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg animate-in fade-in" />
      <div 
        className="relative flex flex-col w-full h-full overflow-hidden bg-white shadow-2xl dark:bg-slate-900 sm:h-auto sm:max-w-2xl sm:rounded-xl animate-in fade-in zoom-in-95 duration-300 sm:max-h-[calc(100vh-12rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <SearchIcon className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={view === 'main' ? "搜尋文章..." : "開發計畫"}
            className="flex-1 text-lg bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            disabled={view !== 'main'}
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

        <div ref={resultsRef} className="flex-1 overflow-y-auto">
          {view === 'main' ? (
            query.trim() === '' ? (
              // Command List
              <div className="py-2">
                {Object.entries(
                  allCommands.reduce((acc, command) => {
                    const section = command.section;
                    if (!acc[section]) acc[section] = [];
                    acc[section].push(command);
                    return acc;
                  }, {} as Record<string, Command[]>)
                ).map(([section, commands]) => (
                  <div key={section} className="mt-2">
                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {section}
                    </div>
                    {commands.map((command) => {
                      const overallIndex = allCommands.findIndex(c => c.name === command.name);
                      const isSelected = selectedIndex === overallIndex;
                      return (
                        <div 
                          key={command.name}
                          className={`flex items-center gap-4 px-4 py-3 cursor-pointer ${isSelected ? 'bg-slate-100 dark:bg-slate-700/50' : ''}`}
                          onClick={() => {
                            command.action();
                            if (command.name !== '查看開發計畫...') {
                                onClose();
                            }
                          }}
                          onMouseMove={() => setSelectedIndex(overallIndex)}
                        >
                          <command.icon className={`w-5 h-5 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                          <span className={`font-medium ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{command.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              // Search Results
              <div className="py-2">
                {isLoading && <div className="p-4 text-center text-slate-500">搜尋中...</div>}
                {!isLoading && results.length === 0 && (
                  <div className="p-4 text-center text-slate-500">找不到與 "{query}" 相關的文章。</div>
                )}
                {results.map((result, index) => (
                    <Link
                      key={result.post._id}
                      href={result.post.url || `/posts/${result.post.slug}`}
                      onClick={onClose}
                      onMouseMove={() => setSelectedIndex(index)}
                      className={`block px-4 py-3 mx-2 my-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${index === selectedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
                        }`}
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-100" dangerouslySetInnerHTML={{ __html: highlightText(result.post.title, result.matches.title ? query : '') }} />
                      <div className="mt-1 text-slate-500 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: extractExcerpt(result.post.body.raw, query) || '' }} />
                    </Link>
                ))}
              </div>
            )
          ) : (
            <GitHubIssuesView onBack={resetView} onClose={onClose} setParentIndex={setSelectedIndex}/>
          )}
        </div>

        {query.trim() === '' && view === 'main' && (
          <div className="flex items-center justify-between gap-4 p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">熱門搜尋:</span>
              {suggestions.slice(0, 3).map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-2 py-1 text-xs text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return isMounted ? createPortal(modalContent, document.body) : null;
} 