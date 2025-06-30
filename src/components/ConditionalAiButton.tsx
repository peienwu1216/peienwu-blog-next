'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { allPosts } from 'contentlayer/generated';
import { Bot } from 'lucide-react';
import AiChatWindow, { AiRole } from './AiChatWindow';

export default function ConditionalAiButton() {
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatRole, setChatRole] = useState<AiRole>('guide');
  const [promptInput, setPromptInput] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setChatOpen(false);
  }, [pathname]);

  // 當聊天視窗開啟時，禁止背景滾動
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // 元件卸載時，確保恢復滾動
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isChatOpen]);

  // 建立一個所有文章 slug 的集合，方便快速查找
  // useMemo確保這個集合只會在元件初次渲染時建立一次
  const postSlugs = useMemo(() => new Set(allPosts.map(p => `/${p.slug}`)), []);

  // 判斷當前頁面是否為文章頁
  const isArticlePage = postSlugs.has(pathname);

  // 如果是文章頁，則不渲染任何東西
  // 因為文章頁的 AI 按鈕由 ArticleClient.tsx 處理
  if (isArticlePage) {
    return null;
  }

  const handleOpenChat = () => setChatOpen(true);
  const handleCloseChat = () => {
    setChatOpen(false);
  };
  
  const handleSwitchRole = (newRole: AiRole) => {
    setChatRole(newRole);
  };

  return (
    <>
      {isChatOpen && (
        <AiChatWindow 
          key={chatRole}
          initialRole={chatRole}
          chatKey="guide"
          onClose={handleCloseChat}
          onSwitchRole={handleSwitchRole}
          initialInputValue={promptInput}
          onUnmount={setPromptInput}
          allowRoleSwitching={false}
        />
      )}

      {/* 懸浮按鈕只在聊天未開啟時顯示 */}
      {!isChatOpen && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={handleOpenChat}
            className="rounded-full bg-blue-600 p-4 text-white shadow-lg transition-transform hover:scale-110"
            aria-label="與數位分身對話"
          >
            <Bot className="h-6 w-6" />
          </button>
        </div>
      )}
    </>
  );
} 