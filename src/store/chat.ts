import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import type { Message } from 'ai/react';

export type ChatMessage = Message;

interface ChatSession {
  messages: ChatMessage[];
  timestamp: number; // epoch ms
}

export interface ChatStoreState {
  sessions: Record<string, ChatSession>;
  getMessages: (key: string) => ChatMessage[];
  setMessages: (key: string, messages: ChatMessage[]) => void;
  clearSession: (key: string) => void;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      sessions: {},
      getMessages: (key) => {
        const session = get().sessions[key];
        if (!session) return [];
        // guide 無期限，specialist 有效期 24h
        const isGuide = key === 'guide';
        if (!isGuide && Date.now() - session.timestamp > ONE_DAY_MS) {
          // expire
          set((state) => {
            const { [key]: _removed, ...rest } = state.sessions;
            return { sessions: rest };
          });
          return [];
        }
        return session.messages;
      },
      setMessages: (key, messages) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [key]: { messages, timestamp: Date.now() },
          },
        }));
      },
      clearSession: (key) => {
        set((state) => {
          const { [key]: _removed, ...rest } = state.sessions;
          return { sessions: rest };
        });
      },
    }),
    {
      name: 'ai-chat-store',
    }
  )
); 