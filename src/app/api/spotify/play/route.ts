import { NextRequest, NextResponse } from 'next/server';
import { playTrack } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    // 從 URL 的 searchParams 獲取 deviceId
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    // 從請求 body 獲取 trackUri 或 contextUri
    const { trackUri, contextUri } = await req.json();
    if (!trackUri && !contextUri) {
      return createErrorResponse('trackUri or contextUri is required', 400);
    }

    const result = await playTrack(trackUri || contextUri, deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to play track');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in /api/spotify/play:', error);
    return createErrorResponse('An internal server error occurred', 500);
  }
}