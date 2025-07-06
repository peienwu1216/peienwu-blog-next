import { NextRequest } from 'next/server';
import { addToQueue } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export async function POST(req: NextRequest) {
  try {
    const { trackUri, deviceId } = await req.json();
    
    if (!trackUri || !deviceId) {
      return createErrorResponse('trackUri and deviceId are required', 400);
    }

    const result = await addToQueue(trackUri, deviceId);
    
    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to add to queue');
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error in /api/spotify/queue:', error);
    return createErrorResponse('Invalid request body', 400);
  }
} 