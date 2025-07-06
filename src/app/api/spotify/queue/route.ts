import { NextRequest, NextResponse } from 'next/server';
import { addToQueue } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 從 URL 的 searchParams 獲取 deviceId
    const deviceId = req.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    // 從請求 body 獲取 trackUri
    const { trackUri } = await req.json();
    if (!trackUri) {
      return createErrorResponse('trackUri is required', 400);
    }

    const result = await addToQueue(trackUri, deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to add track to queue');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in /api/spotify/queue:', error);
    return createErrorResponse('An internal server error occurred', 500);
  }
} 