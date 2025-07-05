import { type Message } from 'ai';
import { streamLlm } from '@/lib/ai/llmClient';
import { ARTICLE_SPECIALIST_SYSTEM_PROMPT } from '@/lib/ai/promptTemplates';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, articleContent } = await req.json();

    if (!articleContent) {
      return new Response('Article content is required for this endpoint.', { status: 400 });
    }

    const systemPrompt = `${ARTICLE_SPECIALIST_SYSTEM_PROMPT}

以下為你需要分析的文章內容：
---
${articleContent}
---`;

    const messagesWithSystemPrompt = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.filter((m: Message) => m.role === 'user' || m.role === 'assistant')
    ];

    return streamLlm({ messages: messagesWithSystemPrompt });

  } catch (error) {
    console.error('[API/article-chat] Error in POST handler:', error);
    // 捕獲 json 解析等初始錯誤
    return new Response('An unexpected error occurred.', { status: 500 });
  }
} 