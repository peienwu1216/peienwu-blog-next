import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

const PLAYER_PAUSE_ENDPOINT = 'https://api.spotify.com/v1/me/player/pause';

export async function PUT() {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(PLAYER_PAUSE_ENDPOINT, { 
            method: 'PUT', 
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Failed to pause player:', errorDetails);
            return new NextResponse(JSON.stringify(errorDetails), { status: response.status });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in /api/spotify/pause:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}