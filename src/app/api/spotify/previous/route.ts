import { previousTrack } from '@/lib/spotifyService';
import { createSuccessResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = await previousTrack();
  
  if (!result.success) {
    return createSpotifyErrorResponse(result.error, 'Failed to skip to previous track');
  }

  return createSuccessResponse({ success: true });
}