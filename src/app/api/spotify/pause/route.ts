import { pausePlayback } from '@/lib/spotifyService';
import { createSuccessResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export async function PUT() {
  const result = await pausePlayback();
  
  if (!result.success) {
    return createSpotifyErrorResponse(result.error, 'Failed to pause playback');
  }

  return createSuccessResponse({ success: true });
}