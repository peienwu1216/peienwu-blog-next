import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, SEEK_ENDPOINT } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { position_ms } = await req.json();
    const accessToken = await getAccessToken();
    const url = new URL(SEEK_ENDPOINT);
    url.searchParams.append('position_ms', position_ms);

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
    return new NextResponse('Failed to seek track', { status: response.status });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}