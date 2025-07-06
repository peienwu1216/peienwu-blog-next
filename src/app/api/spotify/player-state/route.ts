import { NextRequest, NextResponse } from 'next/server';
import { getPlayerState } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const result = await getPlayerState();
    
    if (!result.success) {
      return createErrorResponse(result.error?.userMessage || 'Failed to get player state', 500);
    }

    // 如果沒有任何裝置在播放，Spotify 會回傳 204 No Content
    if (result.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return createSuccessResponse(result.data);
  } catch (error) {
    console.error('Error in /api/spotify/player-state:', error);
    return createErrorResponse('An internal server error occurred', 500);
  }
} 