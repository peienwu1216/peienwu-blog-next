import { NextRequest } from 'next/server';
import { seekToPosition } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { position } = await req.json();
    
    if (typeof position !== 'number' || position < 0) {
      return createErrorResponse('Position must be a positive number', 400);
    }

    const result = await seekToPosition(position);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to seek to position');
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error in /api/spotify/seek:', error);
    return createErrorResponse('Invalid request body', 400);
  }
}