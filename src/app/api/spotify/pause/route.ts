import { NextRequest, NextResponse } from 'next/server';
import { pausePlayback } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    // 從 URL 的 searchParams 獲取 deviceId
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    const result = await pausePlayback(deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to pause playback');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in /api/spotify/pause:', error);
    return createErrorResponse('An internal server error occurred', 500);
  }
}