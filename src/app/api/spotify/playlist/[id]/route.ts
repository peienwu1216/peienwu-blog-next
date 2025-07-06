import { NextRequest } from 'next/server';
import { getPlaylist } from '@/lib/spotifyService';
import { createSuccessResponse, createErrorResponse, createSpotifyErrorResponse } from '@/lib/apiUtils';

// Spotify's endpoint to get a playlist by its ID
const PLAYLIST_ENDPOINT = 'https://api.spotify.com/v1/playlists';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const playlistId = params.id;
  if (!playlistId) {
    return createErrorResponse('Playlist ID is required', 400);
  }

  const result = await getPlaylist(playlistId);
  
  if (!result.success) {
    return createSpotifyErrorResponse(result.error, 'Failed to get playlist');
  }

  const playlistData = result.data;

  // 將回傳的資料結構簡化，只留下我們需要的 TrackInfo[]
  const tracks = playlistData.tracks.items.map((item: any) => ({
      title: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join(', '),
      album: item.track.album.name,
      albumImageUrl:
        (item.track.album.images && item.track.album.images.length > 0)
          ? item.track.album.images[0].url
          : '/images/placeholder.png',
      songUrl: item.track.external_urls.spotify,
      trackId: item.track.id,
      duration: item.track.duration_ms / 1000,
  }));

  return createSuccessResponse(tracks);
}