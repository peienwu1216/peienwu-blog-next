import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useChatStore } from '@/store/chat';
import type { ChatStoreState } from '@/store/chat';
import { Message } from 'ai';

export type AiRole = 'specialist' | 'guide';

// 用於管理不同角色 UI 和行為的設定物件
export const roleConfig = {
  specialist: {
    title: '文章 AI 助理',
    welcomeMessage: '嘿！對這篇文章有什麼好奇的嗎？無論是想快速抓重點，還是深入探討，隨時都能問我！',
    placeholder: '針對這篇文章提問...'
  },
  guide: {
    title: '全站數位分身',
    welcomeMessage: `您好，歡迎來到 Code Lab！我是 Peienwu 的 AI 數位分身 **Bryan**，一個由 Gemini AI 驅動的智慧嚮導。我已經學習了這個網站中所有的技術文章、專案與個人背景。

無論您想尋找特定資訊、理解複雜觀念，或對 Peienwu 本人感到好奇，我都樂意提供協助。

**您可以試著這樣問我：**
- 「Peienwu 是誰？他做過哪些專案？」
- 「這個網站的 AI 數位分身是怎麼實現的？」

請隨時輸入您的問題，我很樂意為您指引！`,
    placeholder: '與 Peien 的數位分身對話...'
  }
};

const SUMMARY_PROMPT = '請為我生成這篇文章的摘要';

interface UseAiChatOptions {
  initialRole: AiRole;
  chatKey: string;
  initialInputValue?: string;
  onUnmount?: (currentInput: string) => void;
  articleContent?: string;
  startWithSummary?: boolean;
}

export function useAiChat({
  initialRole,
  chatKey,
  initialInputValue = '',
  onUnmount,
  articleContent,
  startWithSummary = false
}: UseAiChatOptions) {
  // Store integration
  const getMessages = useChatStore((state: ChatStoreState) => state.getMessages);
  const setMessagesInStore = useChatStore((state: ChatStoreState) => state.setMessages);
  const clearSession = useChatStore((state: ChatStoreState) => state.clearSession);

  const stored = getMessages(chatKey);
  const [currentRole, setCurrentRole] = useState<AiRole>(initialRole);
  
  const defaultWelcome: Message[] = [{ 
    id: 'initial-welcome', 
    role: 'assistant', 
    content: roleConfig[initialRole].welcomeMessage 
  }];

  // 在每次請求期間避免重複顯示錯誤訊息
  const errorShownRef = useRef(false);

  // useChat integration
  const { messages, input, handleInputChange, handleSubmit, setMessages, append, setInput } = useChat({
    api: currentRole === 'specialist' ? '/api/article-chat' : '/api/chat',
    initialMessages: stored.length ? stored : defaultWelcome,
    body: { articleContent: currentRole === 'specialist' ? articleContent : undefined },
    onError(error) {
      if (!errorShownRef.current) {
        append({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '抱歉，AI 目前暫時無法回應（可能是額度用盡或連線問題）。請稍後再試一次！',
        });
        errorShownRef.current = true;
      }
      console.error('[useAiChat] AI error:', error);
    },
  });

  const isLoading = messages.length > 0 && messages[messages.length - 1].role === 'user';

  // Input value persistence
  const inputRef = useRef(input);
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // 在元件掛載時設定初始輸入值
  useEffect(() => {
    if (initialInputValue) {
      setInput(initialInputValue);
    }
  }, [initialInputValue, setInput]);

  // 在元件卸載時保存當前輸入值
  useEffect(() => {
    return () => {
      if (onUnmount) {
        onUnmount(inputRef.current);
      }
    };
  }, [onUnmount]);

  // Persist messages to store
  useEffect(() => {
    const messagesToStore = messages.filter(
      (m) => m.role === 'user' || m.role === 'assistant'
    );
    setMessagesInStore(chatKey, messagesToStore);
  }, [messages, chatKey, setMessagesInStore]);

  // 自動觸發摘要
  useEffect(() => {
    if (startWithSummary && currentRole === 'specialist' && messages.length === 1) {
      append({ role: 'user', content: SUMMARY_PROMPT });
    }
  }, [startWithSummary, currentRole, messages.length, append]);

  // Handlers
  const handleGenerateSummary = () => {
    append({ role: 'user', content: SUMMARY_PROMPT });
  };

  const handleClearChat = () => {
    clearSession(chatKey);
    setMessages(defaultWelcome);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    errorShownRef.current = false;
    handleSubmit(e);
  };

  // Computed values
  const otherRole: AiRole = currentRole === 'specialist' ? 'guide' : 'specialist';
  const showSummaryButton = currentRole === 'specialist' && messages.length === 1;
  const config = roleConfig[currentRole];

  return {
    // State
    messages,
    input,
    currentRole,
    isLoading,
    showSummaryButton,
    otherRole,
    config,
    
    // Handlers
    handleInputChange,
    handleFormSubmit,
    handleGenerateSummary,
    handleClearChat,
    setCurrentRole,
    
    // For external use
    setMessages,
    append,
    setInput,
  };
} 