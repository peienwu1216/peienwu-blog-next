import { CoreMessage, streamText, type LanguageModel } from 'ai';
import { google } from '@ai-sdk/google';

// Tier 1 Strategy: Use a high-quality model as primary, and a fast model as a fallback for reliability.
const primaryModel = google('gemini-2.0-flash');
const fallbackModel = google('gemini-2.0-flash-lite');

interface StreamLlmOptions {
  model?: LanguageModel;
  fallbackModel?: LanguageModel;
  messages: CoreMessage[];
  // 必要時可以加入其他 streamText 的參數，例如 temperature, maxTokens 等
}

/**
 * 通用的 LLM 串流處理函式，內建模型備援機制。
 * @param {StreamLlmOptions} options - 包含訊息、主要模型與備用模型的設定物件。
 * @returns {Promise<Response>} A streaming response.
 */
export async function streamLlm({
  model = primaryModel,
  fallbackModel: fallback = fallbackModel,
  messages,
}: StreamLlmOptions): Promise<Response> {
  try {
    // 1. 優先嘗試主要模型
    const result = await streamText({ model, messages });
    return result.toDataStreamResponse();
  } catch (primaryError) {
    console.warn(
      `Primary model (${model.modelId}) failed, switching to fallback (${fallback.modelId}).`,
      primaryError,
    );

    try {
      // 2. 若主要模型失敗，則嘗試備用模型
      const fallbackResult = await streamText({ model: fallback, messages });
      return fallbackResult.toDataStreamResponse();
    } catch (fallbackError) {
      // 3. 若備用模型也失敗，則拋出最終錯誤
      console.error(
        `Fallback model (${fallback.modelId}) also failed.`,
        fallbackError,
      );
      // 根據最終的錯誤類型，回傳一個更友善的錯誤訊息
      if (fallbackError instanceof Error && fallbackError.message.includes('API key')) {
        return new Response('API key is invalid or not set.', { status: 401 });
      }
      return new Response('AI service is currently unavailable after multiple retries.', { status: 503 });
    }
  }
} 