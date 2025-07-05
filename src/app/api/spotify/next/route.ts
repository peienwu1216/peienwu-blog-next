import { NextResponse } from 'next/server';
import { getAccessToken, NEXT_ENDPOINT } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(NEXT_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
    return new NextResponse('Failed to go to next track', { status: response.status });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}