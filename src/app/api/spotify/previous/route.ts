import { NextResponse } from 'next/server';
import { getAccessToken, PREVIOUS_ENDPOINT } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(PREVIOUS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
    return new NextResponse('Failed to go to previous track', { status: response.status });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}