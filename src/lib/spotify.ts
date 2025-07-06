import { URLSearchParams } from 'url';
import { validateServerConfig } from '@/config/spotify';

// 宣告一個介面來定義 Token 物件的結構
interface Token {
  access_token: string;
  expires_in: number;
  expires_at?: number; // 我們將用這個屬性來記錄 token 的過期時間
}

// 在記憶體中建立一個變數來快取 token
let tokenCache: Token | null = null;

// 使用新的設定驗證函式
const { clientId, clientSecret, refreshToken } = validateServerConfig();

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
// New Endpoints
const PLAYER_ENDPOINT = `https://api.spotify.com/v1/me/player`;
const PREVIOUS_ENDPOINT = `${PLAYER_ENDPOINT}/previous`;
const NEXT_ENDPOINT = `${PLAYER_ENDPOINT}/next`;
const VOLUME_ENDPOINT = `${PLAYER_ENDPOINT}/volume`;
const SEEK_ENDPOINT = `${PLAYER_ENDPOINT}/seek`;

export const getAccessToken = async () => {
  // 檢查快取的 token 是否存在且尚未過期
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
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  
  // 計算過期時間（提前 5 分鐘過期，確保安全邊際）
  const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
  
  tokenCache = {
    access_token: data.access_token,
    expires_in: data.expires_in,
    expires_at: expiresAt,
  };

  return data.access_token;
};

// 匯出常數供其他模組使用
export {
  NOW_PLAYING_ENDPOINT,
  PREVIOUS_ENDPOINT,
  NEXT_ENDPOINT,
  VOLUME_ENDPOINT,
  SEEK_ENDPOINT,
};