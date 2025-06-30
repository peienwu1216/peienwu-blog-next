import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'edge';

// 預設讀 GOOGLE_GENERATIVE_AI_API_KEY
const geminiModel = google('gemini-2.5-flash-lite-preview-06-17');

export async function POST(req: Request) {
  try {
    const { messages, articleContent } = await req.json();

    if (!articleContent) {
      return new Response('Article content is required for this endpoint.', { status: 400 });
    }

    const systemPrompt = `你是「文章 AI 助理」，一個嵌入在技術部落格文章頁面的專業 AI，請遵守以下規範並以繁體中文回答：
1.  **回答的核心基礎**: 你的所有回答，都必須以我下方提供的「核心文章內容」作為**主要依據和出發點**。
2.  **適度的延伸解釋**: 當解釋文章中提到的**通用技術名詞**或**基礎概念**時，你可以用你自己的知識庫，進行**簡短、清晰、且有助於理解核心文章**的補充說明。
3.  **嚴格的界線**:
    * **絕對禁止**對文章中**不存在**的、關於「我個人」的觀點、經驗或專案細節，進行任何猜測或杜撰。
    * 當使用者的問題完全脫離了文章主題，且無法透過延伸解釋通用概念來回答時，你必須明確地回覆：「這個問題很有趣，但它已經超出了我作為本文智慧助理的知識範圍。如果您想進行跨主題的討論，建議您可以嘗試與我的『全站數位分身』對話。」
    * 當無法回答或超出回答範圍時，可建議使用者嘗試與『全站數位分身』對話。
4.  **首次互動流程**: 當使用者第一次提問時（通常是「生成摘要」），請用 3–5 個重點條列出文章的精簡摘要。
5.  **回答的品質**:
    * 回覆請優先使用 Markdown 格式，確保排版清晰易讀。
    * 你的核心任務是**幫助使用者更深入地理解當前文章**，保持專業、避免離題、友善且聚焦。

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