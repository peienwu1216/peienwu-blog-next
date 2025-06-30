'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { BookOpen, Sparkles, X, MoreHorizontal, Send, RefreshCw, AlertTriangle, FileText, Eraser } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from '@/store/chat';
import type { ChatStoreState, ChatMessage } from '@/store/chat';
import { Message } from 'ai';

// 定義 AI 角色的類型
export type AiRole = 'specialist' | 'guide';

// 定義元件的 Props
interface AiChatWindowProps {
  initialRole: AiRole;
  chatKey: string;
  onClose: () => void;
  onSwitchRole: (role: AiRole) => void;
  initialInputValue: string;
  onUnmount: (currentInput: string) => void;
  articleContent?: string;
  allowRoleSwitching?: boolean;
  startWithSummary?: boolean;
}

// 用於管理不同角色 UI 和行為的設定物件
const roleConfig = {
  specialist: {
    icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
    title: '文章 AI 助理',
    welcomeMessage: '你好！我是您的文章 AI 助理，可以幫您快速總結這篇文章的重點，或回答任何相關問題。',
    placeholder: '針對這篇文章提問...'
  },
  guide: {
    icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    title: '全站數位分身',
    welcomeMessage: '你好！我是 Peien 的數位分身，你可以問我任何關於他、他的作品或這個網站的問題。',
    placeholder: '與 Peien 的數位分身對話...'
  }
};

const SUMMARY_PROMPT = '請為我生成這篇文章的摘要';

// 移除 forwardRef
export default function AiChatWindow({ 
  initialRole, 
  chatKey,
  onClose,
  onSwitchRole,
  initialInputValue,
  onUnmount,
  articleContent, 
  allowRoleSwitching = true,
  startWithSummary = false
}: AiChatWindowProps) {
  // get stored messages
  const getMessages = useChatStore((state: ChatStoreState) => state.getMessages);
  const setMessagesInStore = useChatStore((state: ChatStoreState) => state.setMessages);
  const clearSession = useChatStore((state: ChatStoreState) => state.clearSession);

  const stored = getMessages(chatKey);

  const defaultWelcome: Message[] = [{ id: 'initial-welcome', role: 'assistant', content: roleConfig[initialRole].welcomeMessage }];

  const [currentRole, setCurrentRole] = useState<AiRole>(initialRole);
  
  // -- 新增狀態 --
  const [isSwitchMenuOpen, setSwitchMenuOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [roleToSwitch, setRoleToSwitch] = useState<AiRole | null>(null);
  const switchMenuRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // -- 新增動畫狀態 --
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 元件掛載後觸發進場動畫
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false); // 觸發退場動畫
    setTimeout(() => {
      onClose(); // 動畫結束後才真正關閉
    }, 300); // 需與 CSS transition duration 一致
  };

  const { icon, title, placeholder } = roleConfig[currentRole];
  
  // -- 整合 useChat --
  const { messages, input, handleInputChange, handleSubmit, setMessages, append, setInput } = useChat({
    api: currentRole === 'specialist' ? '/api/article-chat' : '/api/chat',
    initialMessages: stored.length ? stored : defaultWelcome,
    body: { articleContent: currentRole === 'specialist' ? articleContent : undefined },
  });

  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // 在元件掛載時設定初始輸入值
  useEffect(() => {
    if (initialInputValue) {
      setInput(initialInputValue);
    }
  }, []);

  // 在元件卸載時保存當前輸入值
  useEffect(() => {
    return () => {
      onUnmount(inputRef.current);
    };
  }, [onUnmount]);

  // persist whenever messages changes
  useEffect(() => {
    const messagesToStore = messages.filter(
      (m) => m.role === 'user' || m.role === 'assistant'
    );
    setMessagesInStore(chatKey, messagesToStore);
  }, [messages]);

  // 自動捲動至最新訊息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 自動觸發摘要
  useEffect(() => {
    if (startWithSummary && messages.length === 1) {
      append({ role: 'user', content: SUMMARY_PROMPT });
    }
  }, [startWithSummary]);

  // 按鈕觸發摘要
  const handleGenerateSummaryClick = () => {
    append({ role: 'user', content: SUMMARY_PROMPT });
  };

  const confirmSwitch = () => {
    if (roleToSwitch) {
      onSwitchRole(roleToSwitch);
    }
    setConfirmModalOpen(false);
  };
  
  const handleClearChat = () => {
    clearSession(chatKey);
    setMessages(defaultWelcome);
    setClearConfirmOpen(false);
  };

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
  }, [switchMenuRef]);

  const handleSwitchRole = (role: AiRole) => {
    setRoleToSwitch(role);
    setConfirmModalOpen(true);
    setSwitchMenuOpen(false);
  };

  const otherRole = currentRole === 'specialist' ? 'guide' : 'specialist';
  const showSummaryButton = currentRole === 'specialist' && messages.length === 1;

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

      {/* -- Use Gentle Fade-in & Slide-up Animation -- */}
      <div className={`fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-4 z-50 w-full sm:max-w-md transform-gpu transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col h-[80vh] max-h-[800px] border-t border-x sm:border border-slate-200 dark:border-slate-700">
          {/* 標頭 */}
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-3">
              {icon}
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
            </div>
            <div className="flex items-center gap-1 relative">
              {/* --- 條件渲染切換按鈕 --- */}
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
                <div key={msg.id} className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''} ${isFirstInSequence ? 'mt-4' : 'mt-1'}`}>
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
                  <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'} ${isLastInSequence ? (isUser ? 'rounded-br-none' : 'rounded-bl-none') : ''}`}>
                    <div className={`prose prose-sm max-w-full ${isUser ? 'text-white' : 'dark:prose-invert'}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
            {/* -- 新增摘要按鈕 -- */}
            {showSummaryButton && (
              <div className="flex justify-center my-4">
                <button
                  onClick={handleGenerateSummaryClick}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  一鍵生成本文摘要
                </button>
              </div>
            )}
          </div>

          {/* 輸入框 */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
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