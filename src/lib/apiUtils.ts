import { NextResponse } from 'next/server';

export function createSuccessResponse(data: any) {
  return NextResponse.json(data);
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: { message } }, { status });
}

export function createSpotifyErrorResponse(error: any, defaultMessage: string = 'Spotify API error') {
  const message = error?.error?.message || error?.message || defaultMessage;
  const status = error?.status || 500;
  return createErrorResponse(message, status);
} 