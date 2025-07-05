'use client';

import React, { useRef, useEffect, memo } from 'react';
import { BookOpen, Sparkles, X, MoreHorizontal, Send, RefreshCw, AlertTriangle, FileText, Eraser, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from 'ai';
import { AiRole, roleConfig } from '@/hooks/useAiChat';

interface ChatViewProps {
  // State
  messages: Message[];
  input: string;
  currentRole: AiRole;
  isLoading: boolean;
  showSummaryButton: boolean;
  otherRole: AiRole;
  isVisible: boolean;
  
  // Modal states
  isSwitchMenuOpen: boolean;
  isConfirmModalOpen: boolean;
  isClearConfirmOpen: boolean;
  
  // Handlers
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleGenerateSummary: () => void;
  handleClearChat: () => void;
  handleClose: () => void;
  handleSwitchRole: (role: AiRole) => void;
  
  // Modal handlers
  setSwitchMenuOpen: (open: boolean) => void;
  setConfirmModalOpen: (open: boolean) => void;
  setClearConfirmOpen: (open: boolean) => void;
  confirmSwitch: () => void;
  
  // Options
  allowRoleSwitching: boolean;
}

// --- 程式碼高亮自訂元件 ---
const CodeBlock = memo(({ node, inline, className, children, ...props }: any) => {
  const codeString = String(children).replace(/\n$/, '');

  // 處理行內程式碼
  if (inline || (!codeString.includes('\n') && !(className || '').includes('language-'))) {
    return (
      <code className="bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 font-mono text-sm text-pink-600 dark:text-pink-400 whitespace-pre">
        {codeString}
      </code>
    );
  }

  // 處理區塊程式碼
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : undefined;

  return (
    <SyntaxHighlighter
      language={lang}
      style={oneDark}
      PreTag={(preProps) => <pre className="not-prose" {...preProps} />}
      customStyle={{
        background: 'transparent',
        margin: 0,
        padding: 0,
        border: 'none',
      }}
      codeTagProps={{
        style: {
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          padding: '1rem',
          display: 'block',
          width: '100%',
          overflowX: 'auto',
        }
      }}
      {...props}
    >
      {codeString}
    </SyntaxHighlighter>
  );
});

export default function ChatView({
  messages,
  input,
  currentRole,
  isLoading,
  showSummaryButton,
  otherRole,
  isVisible,
  isSwitchMenuOpen,
  isConfirmModalOpen,
  isClearConfirmOpen,
  handleInputChange,
  handleFormSubmit,
  handleGenerateSummary,
  handleClearChat,
  handleClose,
  handleSwitchRole,
  setSwitchMenuOpen,
  setConfirmModalOpen,
  setClearConfirmOpen,
  confirmSwitch,
  allowRoleSwitching,
}: ChatViewProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const switchMenuRef = useRef<HTMLDivElement>(null);

  const { title, placeholder } = roleConfig[currentRole];

  // 自動捲動至最新訊息
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const isAtBottom = chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop <= chatContainerRef.current.clientHeight + 1;
    const lastMessage = messages[messages.length - 1];
    
    // 條件 1: AI 剛開始回覆 (前一則是 user，現在是 assistant)
    const isAiStartingToReply = messages.length > 1 && messages[messages.length - 2].role === 'user' && lastMessage.role === 'assistant';

    if (isAiStartingToReply) {
      const userMessageId = `message-${messages[messages.length - 2].id}`;
      const userMessageElement = chatContainerRef.current.querySelector(`#${userMessageId}`);
      if (userMessageElement) {
        userMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // 條件 2: 使用者自己捲動到底部時，或自己發出訊息時，保持在底部
    if (isAtBottom || lastMessage.role === 'user') {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 點擊外部關閉切換菜單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switchMenuRef.current && !switchMenuRef.current.contains(event.target as Node)) {
        setSwitchMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setSwitchMenuOpen]);

  return (
    <>
      {/* 清除確認 Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 m-4 max-w-sm text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">清除對話紀錄</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              您確定要清除目前的對話紀錄嗎？這個操作無法復原。
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setClearConfirmOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
                取消
              </button>
              <button 
                onClick={handleClearChat}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700">
                確認清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 切換確認 Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 m-4 max-w-sm text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">切換 AI 角色</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              我們將為新角色開啟全新的對話；先前對話會保留，稍後仍可返回瀏覽。
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600">
                取消
              </button>
              <button 
                onClick={confirmSwitch}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                確認切換
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div className={`fixed inset-x-0 top-16 bottom-0 sm:top-auto sm:inset-x-auto sm:right-4 sm:bottom-4 z-50 w-full sm:max-w-md transform-gpu transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col h-full sm:h-[80vh] sm:max-h-[800px] sm:border border-slate-200 dark:border-slate-700">
          {/* 標頭 */}
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-3">
              {currentRole === 'guide' ? (
                <Sparkles className="h-6 w-6 text-amber-500" />
              ) : (
                <BookOpen className="h-6 w-6 text-indigo-500" />
              )}
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
            </div>
            <div className="flex items-center gap-1 relative">
              {/* 條件渲染切換按鈕 */}
              {allowRoleSwitching && (
                <div ref={switchMenuRef}>
                  <button 
                    onClick={() => setSwitchMenuOpen(!isSwitchMenuOpen)}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {isSwitchMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                      <button
                        onClick={() => handleSwitchRole(otherRole)}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <RefreshCw className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <div className="text-slate-800 dark:text-slate-200">
                          切換到 <span className="font-semibold">{roleConfig[otherRole].title}</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setClearConfirmOpen(true)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="清除對話紀錄"
              >
                <Eraser className="h-5 w-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="關閉聊天視窗"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* 對話區域 */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLastInSequence = !messages[index + 1] || messages[index + 1].role !== msg.role;
              const isFirstInSequence = !messages[index - 1] || messages[index - 1].role !== msg.role;

              return (
                <div 
                  key={msg.id} 
                  id={`message-${msg.id}`}
                  className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''} ${isFirstInSequence ? 'mt-4' : 'mt-1'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      {isLastInSequence ? (
                         currentRole === 'guide' ? (
                          <img src="/images/avatar.jpeg" alt="Peien Wu" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center ring-1 ring-inset ring-indigo-200 dark:ring-indigo-800">
                            <BookOpen className="h-5 w-5 text-indigo-500" />
                          </div>
                        )
                      ) : (
                        <div className="w-8"></div>
                      )}
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isUser ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700'} ${isLastInSequence ? (isUser ? 'rounded-br-none' : 'rounded-bl-none') : ''}`}>
                    <div className={`prose prose-sm max-w-full ${isUser ? 'text-white' : 'dark:prose-invert'}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath] as any}
                          rehypePlugins={[rehypeKatex] as any}
                          components={{
                            code: CodeBlock,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* 摘要按鈕 */}
            {showSummaryButton && (
              <div className="flex justify-center my-4">
                <button
                  onClick={handleGenerateSummary}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  一鍵生成本文摘要
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-6 w-6 text-slate-400 animate-spin" />
                <p className="ml-2 text-sm text-slate-500">處理中...</p>
              </div>
            )}
          </div>

          {/* 輸入框 */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={!input.trim()}
                aria-label="傳送訊息"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 