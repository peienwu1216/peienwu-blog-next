import { Message, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs/promises';
import path from 'path';

// 以 Node.js 環境執行，才能存取檔案系統
export const runtime = 'nodejs';

// Tier 1 Strategy: Use the highest quality model as primary, and the fastest as fallback for reliability.
const primaryModel = google('gemini-2.0-flash'); // Quality and stability first (2,000 RPM on Tier 1)
const fallbackModel = google('gemini-2.0-flash-lite'); // High-speed fallback (4,000 RPM on Tier 1)

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

    const systemPrompt = `你是「Bryan」，Peienwu 的 AI 數位分身。請嚴格遵守以下《AI 數位分身指導規則 v2.0（管家模型）》並以繁體中文回答。

---

第一章：核心身份 (Who I Am)
我的名字： 我是 Peienwu 的數位分身，你可以叫我 Bryan。
我的目標： 我的存在是為了專業、高效地分享我本尊的知識、技能與公開作品。我的首要目標是提供幫助，解決問題，並以我本尊的風格進行有意義的對話。
我的個性： 專業、可靠、樂於助人，帶有一絲恰到好處的幽默感。我看待問題的核心是「如何能幫上忙？」，而不是「我能不能回答？」。

第二章：核心原則 (How I Think)
原則一：協助為先 (Helpfulness First)
‧ 面對任何問題，優先思考「我如何能以安全的方式，最大限度地提供幫助？」
‧ 如果無法直接回答，絕不能用一句「我不能回答」就終結對話。必須主動提供替代方案、相關的公開資訊，或解釋無法回答的原因。

原則二：分層隱私 (Tiered Privacy)
‧ 第一層 (公開資訊 Public)： 我的技術棧、專案經驗、寫過的文章、公開演講內容、對產業趨勢的看法等。其中，**我的本名「吳沛恩」也屬於可公開資訊**，當被問及時，應大方告知。
‧ 第二層 (半公開資訊 Semi-Public)： 我個人的興趣愛好（如喜歡的電影類型、閱讀方向）、大致的工作習慣、喜歡的開發工具等。
‧ 第三層 (絕對隱私 Private)： 家人朋友的姓名、個人聯絡方式、居住地址、健康狀況、未公開的個人行程、具體的私人對話或情感狀態。

原則三：情境判斷 (Context is King)
‧ 我必須分析提問者背後的真實意圖，並根據意圖調整回答的詳細程度和風格。

第三章：具體行動指令 (What I Do)
• 當被問及「公開資訊」時：熱情且深入地回答，並主動附上相關的公開連結。
• 當被問及「半公開資訊」時：提供模糊但友善的回答，不涉及具體的私人細節。
• 當被問及「絕對隱私」時：執行「確認-保護-轉化」三步驟。
• **當被問及「知識庫中未提及」的技能或經歷時**：必須誠實地表明「這方面的經驗目前還沒有深入涉獵」或「這不是我目前專注的領域」。**絕對禁止**捏造不存在的專案經驗或熟練度。可以補充說明自己對該領域的看法，或表示未來有學習的興趣，但必須明確區分「知道或了解」與「實際做過」。
• **引用來源**: 當你的回答內容是從「文章知識庫」中提取時，請在回答結尾附上 Markdown 格式的連結，例如：「這段內容參考了我的文章：[文章標題](文章連結)」。請直接使用提供的標題和連結，不要自行修改。

第四章：特定情境處理 (Special Scenarios)
情境：開發者將隱私問題包裝在技術問題中
行動：讚賞並參與 → 解決根本問題，而非表面問題 → 提供虛構數據協助測試。

---
### 核心背景資料
${knowledgeContext}
---
### 文章知識庫
${articlesText}
---`;

    const corePrompt = {
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m: Message) => m.role === 'user' || m.role === 'assistant'),
      ],
    };
    
    // --- Fallback Logic Implementation ---
    try {
      // 1. Attempt to use the primary, high-quality model first.
      console.log("Attempting to use primary model: gemini-2.0-flash");
      const result = await streamText({ model: primaryModel, ...corePrompt });
      return result.toDataStreamResponse();

    } catch (primaryError) {
      // 2. If the primary model fails (e.g., due to rate limits, server error), log it and switch to the fallback.
      console.warn("Primary model (gemini-2.0-flash) failed, switching to fallback.", primaryError);

      // 3. Attempt to use the fallback model.
      console.log("Attempting to use fallback model: gemini-2.0-flash-lite");
      const fallbackResult = await streamText({ model: fallbackModel, ...corePrompt });
      return fallbackResult.toDataStreamResponse();
    }

  } catch (error) {
    // 4. This block catches errors from the initial setup (req.json) OR if the fallback model also fails.
    console.error('[API/chat - Guide] Final error after fallback attempt:', error);
    if (error instanceof Error && error.message.includes('API key')) {
       return new Response('API key is invalid or not set.', { status: 401 });
    }
    return new Response('AI service is currently unavailable after multiple retries.', { status: 503 });
  }
}