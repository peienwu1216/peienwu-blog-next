import { NextRequest, NextResponse } from 'next/server';
import { transferPlayback } from '@/lib/spotifyService';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_ids, play } = body;

    if (!device_ids || !Array.isArray(device_ids) || device_ids.length === 0) {
      return NextResponse.json(
        { error: 'device_ids is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    const result = await transferPlayback(device_ids[0], play ?? true);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.userMessage || 'Failed to transfer playback' },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transfer playback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 