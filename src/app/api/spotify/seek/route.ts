import { NextRequest, NextResponse } from 'next/server';
import { seekToPosition } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    // 從 URL 的 searchParams 獲取 deviceId
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    // 從請求 body 獲取 position
    const { position } = await req.json();
    if (typeof position !== 'number' || position < 0) {
      return createErrorResponse('Position must be a positive number', 400);
    }

    const result = await seekToPosition(position, deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to seek position');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in /api/spotify/seek:', error);
    return createErrorResponse('An internal server error occurred', 500);
  }
}