import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

// Spotify's endpoint to get a playlist by its ID
const PLAYLIST_ENDPOINT = 'https://api.spotify.com/v1/playlists';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const playlistId = params.id;
  if (!playlistId) {
    return new NextResponse('Playlist ID is required', { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();
    // 我們可以透過 fields 參數只請求我們需要的資料，減少傳輸量
    const fields = 'tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls))';
    const response = await fetch(`${PLAYLIST_ENDPOINT}/${playlistId}?fields=${fields}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Failed to get playlist info from Spotify:', errorDetails);
      return new NextResponse(JSON.stringify(errorDetails), { status: response.status });
    }

    const playlistData = await response.json();

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

    return NextResponse.json(tracks);

  } catch (error) {
    console.error('Error in /api/spotify/playlist/[id]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}