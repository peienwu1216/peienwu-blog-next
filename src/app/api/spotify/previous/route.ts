import { NextRequest } from 'next/server';
import { previousTrack } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    
    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    const result = await previousTrack(deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to skip to previous track');
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error in /api/spotify/previous:', error);
    return createErrorResponse('Invalid request body', 400);
  }
}