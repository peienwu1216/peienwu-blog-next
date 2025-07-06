import { nextTrack } from '@/lib/spotifyService';
import { createSuccessResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = await nextTrack();
  
  if (!result.success) {
    return createSpotifyErrorResponse(result.error, 'Failed to skip to next track');
  }

  return createSuccessResponse({ success: true });
}