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

  console.log(`Fetching playlist: ${playlistId}`);
  const result = await getPlaylist(playlistId);
  
  if (!result.success) {
    console.error('Failed to get playlist:', result.error);
    return createSpotifyErrorResponse(result.error, 'Failed to get playlist');
  }

  const playlistData = result.data;
  console.log(`Playlist data received, tracks count: ${playlistData.tracks?.items?.length || 0}`);

  // 檢查是否有 tracks 資料
  if (!playlistData.tracks || !playlistData.tracks.items) {
    console.error('No tracks found in playlist data');
    return createErrorResponse('No tracks found in playlist', 404);
  }

  // 過濾掉 null 的 track（有些 playlist 可能包含已刪除的歌曲）
  const validTracks = playlistData.tracks.items.filter((item: any) => item.track !== null);
  console.log(`Valid tracks count: ${validTracks.length}`);

  // 將回傳的資料結構簡化，只留下我們需要的 TrackInfo[]
  const tracks = validTracks.map((item: any) => ({
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

  console.log(`Processed ${tracks.length} tracks from playlist`);
  return createSuccessResponse(tracks);
}