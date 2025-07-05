import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const trackId = params.id;
  if (!trackId) {
    return new NextResponse('Track ID is required', { status: 400 });
  }
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return new NextResponse('Failed to fetch track', { status: 500 });
    }
    const data = await response.json();
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
    return NextResponse.json(track);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 