import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

const PLAYER_PLAY_ENDPOINT = 'https://api.spotify.com/v1/me/player/play';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { trackUri } = await req.json();
    if (!trackUri) {
      return new NextResponse('Track URI is required', { status: 400 });
    }

    const accessToken = await getAccessToken();
    
    const response = await fetch(PLAYER_PLAY_ENDPOINT, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri] // Spotify API 需要一個 URI 陣列
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('Failed to play track:', errorDetails);
      return new NextResponse(JSON.stringify(errorDetails), { status: response.status });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in /api/spotify/play:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}