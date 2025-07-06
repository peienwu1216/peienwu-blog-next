import { NextRequest, NextResponse } from 'next/server';
import { setVolume } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    // 從 URL 的 searchParams 獲取 deviceId
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    // 從請求 body 獲取 volume
    const { volume } = await req.json();
    if (typeof volume !== 'number' || volume < 0 || volume > 100) {
      return createErrorResponse('Volume must be a number between 0 and 100', 400);
    }

    const result = await setVolume(volume, deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to set volume');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in /api/spotify/volume:', error);
    return createErrorResponse('An internal server error occurred', 500);
  }
}