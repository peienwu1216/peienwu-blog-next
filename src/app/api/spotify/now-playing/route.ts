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
      progress_ms: song.progress_ms,
      item: {
        name: song.item.name,
        duration_ms: song.item.duration_ms,
        artists: song.item.artists.map((artist: { name: string }) => artist.name),
        album: {
          name: song.item.album.name,
          images: song.item.album.images,
        },
        external_urls: song.item.external_urls,
        id: song.item.id,
      },
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