import { NextRequest } from 'next/server';
import { setVolume } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { volume } = await req.json();
    
    if (typeof volume !== 'number' || volume < 0 || volume > 100) {
      return createErrorResponse('Volume must be a number between 0 and 100', 400);
    }

    const result = await setVolume(volume);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to set volume');
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error in /api/spotify/volume:', error);
    return createErrorResponse('Invalid request body', 400);
  }
}