'use client';

import { type Message, type UseChatHelpers } from 'ai/react';
import { cn } from '@/lib/utils';
import { Bot, SendHorizonal, Trash, User, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AiAssistantProps {
  chat: UseChatHelpers;
  onClose: () => void;
}

export default function AiAssistant({ chat, onClose }: AiAssistantProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
    append,
  } = chat;

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const isConversationStarted = messages.length > 1;

  // 自動捲動到最新的訊息
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 處理初始摘要請求
  const handleGenerateSummary = () => {
    append({
      role: 'user',
      content: '一鍵生成摘要',
    });
  };

  // 清除對話
  const handleClearChat = () => {
    setMessages([
      {
        id: 'initial-message',
        role: 'assistant',
        content: '好的，我們重新開始。有什麼我可以幫您的嗎？',
      },
    ]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-xl border-t border-gray-200 bg-white/80 shadow-xl backdrop-blur-lg dark:border-gray-700 dark:bg-gray-800/80 md:bottom-4 md:right-4 md:left-auto md:max-w-lg md:rounded-xl md:border">
      <div className="flex h-[80vh] flex-col md:h-[60vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Peien's AI Assistant
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isConversationStarted && (
              <button
                onClick={handleClearChat}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                aria-label="Clear chat"
              >
                <Trash className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Close chat"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {error && (
            <ChatMessage
              message={{
                id: 'error-message',
                role: 'assistant',
                content: `抱歉，發生錯誤: ${error.message}`,
              }}
            />
          )}
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 animate-pulse rounded-full bg-gray-200 p-1.5 text-gray-700 dark:bg-gray-600 dark:text-gray-300" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI 正在思考中...
              </p>
            </div>
          )}

          {!isConversationStarted && !isLoading && (
             <div className="flex justify-center">
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isLoading ? '生成中...' : '一鍵生成摘要'}
              </button>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <form
            onSubmit={e => {
              if (!input.trim()) return;
              handleSubmit(e);
            }}
            className="flex items-center gap-3 rounded-full bg-gray-100 px-4 py-2 shadow-inner dark:bg-gray-900"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="提出一個問題..."
              className="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="rounded-full p-2 text-blue-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300 dark:hover:bg-gray-700 dark:disabled:text-gray-600"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <SendHorizonal className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 可複用的訊息元件
function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isAssistant ? 'justify-start' : 'justify-end',
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200">
          <Bot className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isAssistant
            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            : 'bg-blue-600 text-white',
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-current">
          <ReactMarkdown
            components={{
              pre: ({ children }) => <>{children}</>,
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={match[1]}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
       {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-200 dark:bg-gray-200 dark:text-gray-700">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
} 