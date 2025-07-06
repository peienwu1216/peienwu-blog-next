import { NextRequest, NextResponse } from 'next/server';
import { playTrack as spotifyPlay } from '@/lib/spotifyService'; // 避免命名衝突
import { createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    // 直接解析整個請求的 body
    const body = await req.json();

    // 驗證 body 中是否包含任何一種有效的播放指令
    if (!body.uris && !body.context_uri && !body.trackUri) {
      return createErrorResponse('A track URI, context URI, or URIs array is required', 400);
    }

    // 將整個 body 物件傳遞給服務層函式
    const result = await spotifyPlay(body, deviceId);

    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to start playback');
    }

    // 對於成功的操作，回傳 204 No Content
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error in /api/spotify/play:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('An internal server error occurred', 500);
  }
}