import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotifyService';
import { createSuccessResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getNowPlaying();
  
  if (!result.success) {
    return createSpotifyErrorResponse(result.error, 'Failed to get current track');
  }

  const data = result.data;
  
  if (!data || !data.item) {
    return createSuccessResponse({
      isPlaying: false,
      item: null,
      progress_ms: 0,
      duration_ms: 0,
    });
  }

  return createSuccessResponse({
    isPlaying: !data.is_playing ? false : true,
    item: {
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists,
      album: data.item.album,
      external_urls: data.item.external_urls,
      duration_ms: data.item.duration_ms,
    },
    progress_ms: data.progress_ms || 0,
    duration_ms: data.item.duration_ms,
  });
} 