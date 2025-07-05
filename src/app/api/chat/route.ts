import { type Message } from 'ai';
import fs from 'fs/promises';
import path from 'path';
import { streamLlm } from '@/lib/ai/llmClient';
import { GUIDE_SYSTEM_PROMPT } from '@/lib/ai/promptTemplates';

// 以 Node.js 環境執行，才能存取檔案系統
export const runtime = 'nodejs';

// --- 知識庫讀取函式 ---
async function getKnowledgeBase() {
  try {
    const personalityCorePath = path.join(process.cwd(), 'public/ai_personality_core.json');
    const knowledgeBasePath = path.join(process.cwd(), 'public/ai_knowledge_base.json');

    const personalityCoreRaw = await fs.readFile(personalityCorePath, 'utf-8');
    const knowledgeBaseRaw = await fs.readFile(knowledgeBasePath, 'utf-8');

    const personalityCore = JSON.parse(personalityCoreRaw);
    const knowledgeBase = JSON.parse(knowledgeBaseRaw);
    
    // 將專案履歷格式化為更易讀的字串
    const projectsText = personalityCore.projects
      .map((p: any) => `專案名稱: ${p.title}\n專案描述: ${p.description}`)
      .join('\n\n');

    const knowledgeContext = `
      - 關於我: ${personalityCore.about}
      - 我的專案履歷: \n${projectsText}
      - 其他背景資料: ${JSON.stringify(personalityCore.customBackground)}
    `;

    // 將所有文章內容合併為一個巨大的知識庫字串
    const articlesText = knowledgeBase
      .map((article: any) => `文章標題: ${article.title}\n文章連結: ${article.url}\n文章內容:\n${article.content}`)
      .join('\n\n---\n\n');

    return { knowledgeContext, articlesText };
  } catch (error) {
    console.error('Error reading knowledge base:', error);
    // 在無法讀取知識庫時，提供一個備用的 context，確保 API 仍能基本運作
    return {
      knowledgeContext: '網站作者是 Peien Wu (吳培恩)，一位全端工程師。',
      articlesText: '暫時無法讀取文章列表。',
    };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { knowledgeContext, articlesText } = await getKnowledgeBase();

    const systemPrompt = `${GUIDE_SYSTEM_PROMPT}
---
### 核心背景資料
${knowledgeContext}
---
### 文章知識庫
${articlesText}
---`;

    const messagesWithSystemPrompt = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.filter((m: Message) => m.role === 'user' || m.role === 'assistant'),
    ];
    
    return streamLlm({ messages: messagesWithSystemPrompt });

  } catch (error) {
    console.error('[API/chat - Guide] Error in POST handler:', error);
    // 捕獲 json 解析等初始錯誤
    return new Response('An unexpected error occurred.', { status: 500 });
  }
}