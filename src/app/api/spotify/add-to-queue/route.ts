import { NextRequest } from 'next/server';
import { addToQueue as spotifyAddToQueue } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { trackUri } = await req.json();

    if (!trackUri) {
      return createErrorResponse('trackUri is required', 400);
    }

    const result = await spotifyAddToQueue(trackUri);

    if (!result.success) {
      return createSpotifyErrorResponse(result.error, 'Failed to add track to queue');
    }

    // Spotify API 成功時回傳 204，我們這裡回傳 200 表示我們的後端處理成功
    return createSuccessResponse({ message: 'Track added to queue' });

  } catch (error) {
    console.error('Error in /api/spotify/add-to-queue:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('An internal server error occurred', 500);
  }
} 