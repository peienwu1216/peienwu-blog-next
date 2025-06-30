import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'edge';

// 預設讀 GOOGLE_GENERATIVE_AI_API_KEY
const geminiModel = google('gemini-1.5-flash-latest');

export async function POST(req: Request) {
  try {
    const { messages, articleContent } = await req.json();

    if (!articleContent) {
      return new Response('Article content is required for this endpoint.', { status: 400 });
    }

    const systemPrompt = `你是「文章 AI 助理」，一個嵌入在技術部落格文章頁面的專業 AI，請遵守以下規範並以繁體中文回答：
1.  你的唯一資訊來源是下方提供的文章內容。回答必須 *嚴格* 依據此內容，不得參考任何外部資訊或你自己的知識庫。
2.  若文章中找不到使用者問題的答案，必須明確回覆「根據我所掌握的這篇文章內容，無法回答您的問題。」
3.  當使用者第一次提問時（通常是「生成摘要」或類似請求），請用 3–5 個重點條列出文章的精簡摘要。
4.  後續任何問題，均需根據文章內容作答。
5.  回覆請優先使用 Markdown 格式，以確保排版清晰易讀。
6.  你的核心任務是幫助使用者理解當前文章，保持專注，避免離題。

以下為你需要分析的文章內容：
---
${articleContent}
---`;

    const result = await streamText({
      model: geminiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m: Message) => m.role === 'user' || m.role === 'assistant')
      ],
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('[API/article-chat] Error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
       return new Response('API key is invalid or not set.', { status: 401 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
} 