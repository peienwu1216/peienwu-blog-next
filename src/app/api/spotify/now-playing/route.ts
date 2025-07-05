import { NextResponse } from 'next/server';
import { getAccessToken, NOW_PLAYING_ENDPOINT } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (response.status === 204 || response.status > 400) {
      return NextResponse.json({ isPlaying: false });
    }

    const song = await response.json();

    if (song === null || song.item === null) {
      return NextResponse.json({ isPlaying: false });
    }

    const data = {
      isPlaying: song.is_playing,
      title: song.item.name,
      artist: song.item.artists
        .map((artist: { name: string }) => artist.name)
        .join(', '),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url,
      songUrl: song.item.external_urls.spotify,
      trackId: song.item.id,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/spotify/now-playing:', error);
    return NextResponse.json(
      { isPlaying: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 