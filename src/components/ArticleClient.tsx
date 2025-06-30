'use client';

import { Post } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import Note from '@/components/Note';
import TableOfContents from '@/components/TableOfContents';
import Pre from '@/components/Pre';
import ViewCounter from '@/components/ViewCounter';
import AiAssistant from '@/components/AiAssistant';
import { useState } from 'react';
import { useChat } from 'ai/react';
import { Bot } from 'lucide-react';

interface ArticleClientProps {
  post: Post;
  headings: { level: number; text: string; slug: string }[];
}

export default function ArticleClient({ post, headings }: ArticleClientProps) {
  const [isAiAssistantOpen, setAiAssistantOpen] = useState(false);
  const chat = useChat({
    body: {
      articleContent: post.body.raw,
    },
    api: '/api/chat',
    initialMessages: [
      {
        id: 'initial-message',
        role: 'assistant',
        content:
          '你好！我是您的文章 AI 助理，可以幫您快速總結這篇文章的重點，或回答任何相關問題。',
      },
    ],
  });

  const MDXContent = useMDXComponent(post.body.code);
  const components = { Note, pre: Pre };

  const handleSummary = () => {
    setAiAssistantOpen(true);
    const hasSummary = chat.messages.some(m => m.content.includes("以下是這篇文章的摘要"));
    if (!hasSummary) {
        chat.append({
            role: 'user',
            content: '一鍵生成摘要',
        });
    }
  };

  const handleAsk = () => {
    setAiAssistantOpen(true);
  };

  return (
    <div className="relative">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:flex lg:space-x-8">
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
      {isAiAssistantOpen && (
        <AiAssistant chat={chat} onClose={() => setAiAssistantOpen(false)} />
      )}
      {!isAiAssistantOpen && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={handleAsk}
            className="rounded-full bg-blue-600 p-4 text-white shadow-lg transition-transform hover:scale-110"
            aria-label="Open AI Assistant"
          >
            <Bot className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
} 