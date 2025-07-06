import { NextRequest } from 'next/server';
import { playTrack as playSpotify } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    // ✨ 修改：解析整個 body
    const body = await req.json();

    // ✨ 修改：直接將 body 傳遞給 spotifyService
    //    這樣它就能處理 uris (陣列) 或 context_uri (單一字串)
    const result = await playSpotify(body, deviceId);

    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to start playback');
    }

    return createSuccessResponse({ message: 'Playback started' });

  } catch (error) {
    console.error('Error in /api/spotify/play:', error);
    // 處理 JSON 解析錯誤
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('An internal server error occurred', 500);
  }
}