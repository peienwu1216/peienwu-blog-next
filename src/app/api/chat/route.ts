import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'edge';

// 預設讀 GOOGLE_GENERATIVE_AI_API_KEY
const geminiModel = google('gemini-1.5-flash-latest');

export async function POST(req: Request) {
  try {
    const { messages, articleContent: directArticleContent, data } = await req.json();
    const articleContent = directArticleContent ?? data?.articleContent;

    if (!articleContent) {
      return new Response('Article content is required', { status: 400 });
    }

    const systemPrompt = `你是「Peien's AI Assistant」，一個嵌入在技術部落格中的世界級 AI 助理，請遵守以下規範並以繁體中文回答：
1.  回答內容必須 *嚴格* 依據下方提供的文章內容，不得臆測或捏造。
2.  若文章中找不到答案，必須明確回覆「依照提供的文章內容，無法回答此問題」。
3.  當使用者第一次提問「生成摘要」時，請用 3–5 個重點條列提供精簡摘要。
4.  後續任何問題，均需根據文章內容作答。
5.  回覆請使用 Markdown，保持易讀排版。
6.  僅當使用者明確要求程式碼示範，或情境明顯需要教學範例時，才提供程式碼區塊；摘要與一般敘述應避免過度加入程式碼。

以下為完整文章內容：
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

    // 使用官方推薦的 toDataStreamResponse()，確保串流格式正確
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('[API/chat] Error:', error);
    // 增加更明確的錯誤回報
    if (error instanceof Error && error.message.includes('API key')) {
       return new Response('API key is invalid or not set.', { status: 401 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}