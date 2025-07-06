import { NextRequest } from 'next/server';
import { playTrack } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { trackUri, deviceId } = await req.json();
    
    if (!trackUri || !deviceId) {
      return createErrorResponse('trackUri and deviceId are required', 400);
    }

    const result = await playTrack(trackUri, deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to play track');
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error in /api/spotify/play:', error);
    return createErrorResponse('Invalid request body', 400);
  }
}