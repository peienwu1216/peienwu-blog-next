import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error in /api/spotify/access-token:', error);
    return NextResponse.json(
      { error: 'Failed to get Spotify access token' },
      { status: 500 }
    );
  }
} 