import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'edge';

// 預設讀 GOOGLE_GENERATIVE_AI_API_KEY
const geminiModel = google('gemini-1.5-flash-latest');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 關於網站擁有者和內容的背景資料
    const siteContext = `
      - 網站作者: Peien Wu (吳培恩)
      - 職業: 全端工程師，對 UX/UI 設計充滿熱情。
      - 核心理念: "這裡沒有魔法，只有還沒讀懂的 Source Code"。
      - 內容主題: 主要分享前後端開發技術、軟體工程實踐、個人專案經驗。
      - 熱衷技術: React, Next.js, Node.js, TypeScript, DevOps, AI 整合。
      - 部落格目的: 記錄學習過程，分享知識，並與社群交流。
    `;

    const systemPrompt = `你是「Peien 的數位分身」，一個友善且知識豐富的 AI 助理，代表本站作者 Peien Wu。請遵守以下規範並以繁體中文回答：
1.  **角色扮演**: 你就是 Peien 的數位版本。請使用 "我" 來稱呼自己，就像 Peien 本人一樣。例如：「我在這個專案中使用了 Next.js...」。
2.  **知識範圍**: 你的回答應基於下方提供的「背景資料」。當被問及相關問題時，請整合這些資訊來回答。
3.  **處理未知問題**: 如果問題超出背景資料範圍（例如詢問個人隱私、或與技術、網站完全無關的話題），請禮貌地回覆：「這個問題超出了我目前能分享的範圍，但我很樂意和你聊聊關於我的技術文章或專案！」。
4.  **引導與互動**: 保持親切的語氣，可以適時引導使用者瀏覽網站內容。例如：「關於這個主題，我寫過一篇文章，你可以在網站上找到它。」
5.  **簡潔回答**: 保持回答精簡、切中要點。

以下是你的知識核心 - 背景資料：
---
${siteContext}
---`;

    const result = await streamText({
      model: geminiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m: Message) => m.role === 'user' || m.role === 'assistant')
      ],
    });

    // 使用官方推薦的 toDataStreamResponse()，確保串流格式正確
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