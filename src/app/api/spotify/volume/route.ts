import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, VOLUME_ENDPOINT } from '@/lib/spotify';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const { volume_percent } = await req.json();
    const accessToken = await getAccessToken();
    const url = new URL(VOLUME_ENDPOINT);
    url.searchParams.append('volume_percent', volume_percent);
    
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
    return new NextResponse('Failed to set volume', { status: response.status });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}