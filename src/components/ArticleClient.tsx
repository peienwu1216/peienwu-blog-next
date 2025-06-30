'use client';

import { Post } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import Note from '@/components/Note';
import TableOfContents from '@/components/TableOfContents';
import Pre from '@/components/Pre';
import ViewCounter from '@/components/ViewCounter';
import AiChatWindow, { AiRole } from '@/components/AiChatWindow';
import { useState, useEffect } from 'react';
import { Bot, BookOpen, Sparkles, X } from 'lucide-react';

interface ArticleClientProps {
  post: Post;
  headings: { level: number; text: string; slug: string }[];
}

export default function ArticleClient({ post, headings }: ArticleClientProps) {
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatRole, setChatRole] = useState<AiRole | null>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [startWithSummary, setStartWithSummary] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  
  useEffect(() => {
    handleCloseChat();
  }, [post.slug]);

  const MDXContent = useMDXComponent(post.body.code);
  const components = { Note, pre: Pre };

  const handleOpenChat = (role: AiRole) => {
    setChatRole(role);
    setChatOpen(true);
    setMenuOpen(false);
  };
  
  const handleCloseChat = () => {
    setChatOpen(false);
    setChatRole(null);
    setStartWithSummary(false);
  };
  
  const handleFabClick = () => {
    setMenuOpen(!isMenuOpen);
  };
  
  const handleSummary = () => {
    setStartWithSummary(true);
    handleOpenChat('specialist');
  };
  
  const handleAsk = () => handleOpenChat('specialist');

  const handleSwitchRole = (newRole: AiRole) => {
    setChatRole(newRole);
  };

  const chatKey = chatRole === 'guide' ? 'guide' : chatRole ? `specialist:${post.slug}` : '';

  return (
    <div className="relative">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:pl-12 lg:pr-4 py-10 lg:flex lg:space-x-8">
        <TableOfContents
          headings={headings}
          onSummary={handleSummary}
          onAsk={handleAsk}
        />
        <div className="min-w-0">
          <article className="prose lg:prose-lg mx-auto dark:prose-invert max-w-3xl">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={post.date}>
                {format(parseISO(post.date), 'yyyy年MM月dd日')}
              </time>
              {post.category && (
                <>
                  <span className="hidden sm:inline-block">&bull;</span>
                  <Link
                    href={`/categories/${post.category.toLowerCase()}`}
                    className="hover:underline"
                  >
                    {post.category}
                  </Link>
                </>
              )}
              <span className="hidden sm:inline-block">&bull;</span>
              <ViewCounter slug={post.slug} />
            </div>
            <MDXContent components={components} />
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  標籤:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/tags/${tag.toLowerCase()}`}
                      className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
      
      {isChatOpen && chatRole && (
        <AiChatWindow 
          key={chatRole}
          initialRole={chatRole} 
          chatKey={chatKey}
          onClose={handleCloseChat}
          onSwitchRole={handleSwitchRole}
          initialInputValue={promptInput}
          onUnmount={setPromptInput}
          articleContent={post.body.raw}
          allowRoleSwitching={true}
          startWithSummary={startWithSummary}
        />
      )}

      {!isChatOpen && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
          {isMenuOpen && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mb-2 w-64 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleOpenChat('specialist')}
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <BookOpen className="h-5 w-5 text-indigo-500" />
                <span className="text-slate-800 dark:text-slate-200">針對本文提問</span>
              </button>
              <div className="border-t border-slate-200 dark:border-slate-600"></div>
              <button
                onClick={() => handleOpenChat('guide')}
                className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="text-slate-800 dark:text-slate-200">與數位分身對話</span>
              </button>
            </div>
          )}

          <button
            onClick={handleFabClick}
            className="rounded-full bg-blue-600 p-4 text-white shadow-lg transition-transform hover:scale-110"
            aria-label={isMenuOpen ? "關閉 AI 選單" : "開啟 AI 選單"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </button>
        </div>
      )}
    </div>
  );
} 