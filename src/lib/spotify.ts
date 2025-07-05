import { URLSearchParams } from 'url';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

if (!client_id || !client_secret || !refresh_token) {
  throw new Error(
    'Missing Spotify credentials. Please check your .env.local file.'
  );
}

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    console.error('Failed to get access token:', errorDetails);
    throw new Error('Failed to get access token from Spotify.');
  }

  const data = await response.json();
  return data.access_token;
};

export const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`; 