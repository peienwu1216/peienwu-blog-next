import { NextRequest, NextResponse } from 'next/server';

export function createSuccessResponse(data: any) {
  return NextResponse.json(data);
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: { message } }, { status });
}

export function createSpotifyErrorResponse(error: any, defaultMessage: string = 'Spotify API error') {
  const message = error?.error?.message || error?.message || defaultMessage;
  const status = error?.status || 500;
  return createErrorResponse(message, status);
}

// 定義一個通用函式的型別，這個函式會接收 deviceId 和可能的其他參數
type SpotifyPlayerAction = (deviceId: string, ...args: any[]) => Promise<{ success: boolean; error?: any; data?: any }>;

/**
 * 建立一個通用的 Spotify 播放器 API 路由處理器
 * @param action - 從 spotifyService 傳入的函式，例如 pausePlayback, nextTrack 等
 * @param requireBody - 此路由是否需要從 request body 讀取額外參數
 * @param returnData - 是否回傳資料（true 回傳 JSON，false 回傳 204 No Content）
 */
export function createSpotifyPlayerHandler(action: SpotifyPlayerAction, requireBody: boolean = false, returnData: boolean = false) {
  return async function(req: NextRequest) {
    try {
      const body = requireBody ? await req.json() : {};
      const deviceId = body.deviceId || req.nextUrl.searchParams.get('deviceId');

      if (!deviceId) {
        return createErrorResponse('deviceId is required', 400);
      }

      // 將 deviceId 和其他可能的參數傳遞給 action 函式
      const result = await action(deviceId, body);

      if (!result.success) {
        return createSpotifyErrorResponse(result.error, `Failed to perform action: ${action.name}`);
      }

      // ✨ 改善：根據 returnData 參數決定回傳格式
      if (returnData && result.data) {
        return createSuccessResponse(result.data);
      } else {
        // 對於成功的操作，回傳 204 No Content（更符合 HTTP 語意）
        return new NextResponse(null, { status: 204 });
      }

    } catch (error) {
      // 處理 JSON 解析錯誤等問題
      console.error(`Error in API handler for ${action.name}:`, error);
      return createErrorResponse('Invalid request body or unexpected error', 400);
    }
  };
} 