import { NextRequest } from 'next/server';
import { resumePlayback } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export async function PUT(req: NextRequest) {
  try {
    const { deviceId } = await req.json();
    
    if (!deviceId) {
      return createErrorResponse('deviceId is required', 400);
    }

    const result = await resumePlayback(deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to resume playback');
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error in /api/spotify/resume:', error);
    return createErrorResponse('Invalid request body', 400);
  }
} 