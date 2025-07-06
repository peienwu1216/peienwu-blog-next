// src/config/spotify.ts

// 這些是可以在前端安全使用的公開資訊
export const clientConfig = {
  defaultPlaylistId: process.env.NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST_ID || '0EUdsblGUaGfNvwPES3qka',
};

// 這些是只應該在伺服器端存取的敏感資訊
export const serverConfig = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
};

// 驗證並回傳伺服器端設定
export function validateServerConfig() {
  // ✨ 在函式內部直接讀取 process.env
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials on the server. Please check your .env.local and Vercel environment variables.');
  }
  
  return { clientId, clientSecret, refreshToken };
} 