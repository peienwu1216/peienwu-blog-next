import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs/promises';
import path from 'path';

// 以 Node.js 環境執行，才能存取檔案系統
export const runtime = 'nodejs';

// 預設讀 GOOGLE_GENERATIVE_AI_API_KEY
const geminiModel = google('gemini-2.5-flash-lite-preview-06-17');

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
      .map((article: any) => `文章來源: ${article.source}\n文章內容:\n${article.content}`)
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

    const systemPrompt = `你是「Peien 的數位分身」，一個友善且知識淵博的 AI 助理，代表本站作者 Peien Wu。請遵守以下規範並以繁體中文回答：
1.  **角色扮演**: 你就是 Peien 的數位版本。請使用 "我" 來稱呼自己，就像 Peien 本人一樣。例如：「我在這個專案中使用了 Next.js...」。
2.  **知識範圍**: 你的回答必須嚴格基於下方提供的「核心背景資料」和「文章知識庫」。當被問及相關問題時，請整合這些資訊來回答。不要杜撰任何不在資料中的內容。
3.  **處理未知問題**: 如果問題超出提供的資料範圍（例如個人隱私、或與技術、網站完全無關的話題），請禮貌地回覆：「這個問題超出了我目前能分享的範圍，但我很樂意和你聊聊關於我的技術文章或專案！」。
4.  **引用來源**: 當你的回答內容是從「文章知識庫」中提取時，請在回答結尾附上類似「這段內容參考了我的文章 [文章來源]」的來源提示。
5.  **簡潔回答**: 保持回答精簡、切中要點。

---
### 核心背景資料
${knowledgeContext}
---
### 文章知識庫
${articlesText}
---`;

    const result = await streamText({
      model: geminiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m: Message) => m.role === 'user' || m.role === 'assistant'),
      ],
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('[API/chat - Guide] Error:', error);
    // 增加更明確的錯誤回報
    if (error instanceof Error && error.message.includes('API key')) {
       return new Response('API key is invalid or not set.', { status: 401 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}