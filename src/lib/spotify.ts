import { URLSearchParams } from 'url';
import { validateServerConfig } from '@/config/spotify';

interface Token {
  access_token: string;
  expires_in: number;
  expires_at?: number;
}

let tokenCache: Token | null = null;

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

// 保持這些常數的匯出，因為 spotifyService.ts 有用到
export const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const PLAYER_ENDPOINT = `https://api.spotify.com/v1/me/player`;
export const PREVIOUS_ENDPOINT = `${PLAYER_ENDPOINT}/previous`;
export const NEXT_ENDPOINT = `${PLAYER_ENDPOINT}/next`;
export const VOLUME_ENDPOINT = `${PLAYER_ENDPOINT}/volume`;
export const SEEK_ENDPOINT = `${PLAYER_ENDPOINT}/seek`;

export const getAccessToken = async () => {
  // ✨ 將驗證和讀取變數的邏輯移到函式內部
  const { clientId, clientSecret, refreshToken } = validateServerConfig();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  if (tokenCache && tokenCache.expires_at && Date.now() < tokenCache.expires_at) {
    return tokenCache.access_token;
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    // 您可以增加更詳細的錯誤日誌
    const errorBody = await response.text();
    console.error('Failed to refresh access token:', errorBody);
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  
  const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
  
  tokenCache = {
    access_token: data.access_token,
    expires_in: data.expires_in,
    expires_at: expiresAt,
  };

  return data.access_token;
}; 