import { NextRequest } from 'next/server';
import { getTrack } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const trackId = params.id;
  if (!trackId) {
    return createErrorResponse('Track ID is required', 400);
  }
  
  const result = await getTrack(trackId);
  
  if (!result.success) {
    return createSpotifyErrorResponse(result.error, 'Failed to get track information');
  }

  const data = result.data;
  const track = {
    trackId: data.id,
    title: data.name,
    artist: data.artists.map((a: any) => a.name).join(', '),
    album: data.album.name,
    albumImageUrl: (data.album.images && data.album.images.length > 0)
      ? data.album.images[0].url
      : '/images/placeholder.png',
    songUrl: data.external_urls.spotify,
    duration: data.duration_ms / 1000,
  };
  
  return createSuccessResponse(track);
} 