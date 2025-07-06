import { getAccessToken, NOW_PLAYING_ENDPOINT, PREVIOUS_ENDPOINT, NEXT_ENDPOINT, VOLUME_ENDPOINT, SEEK_ENDPOINT } from './spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// 封裝 fetch 邏輯，自動加入 Authorization header
async function fetchFromSpotify(endpoint: string, options: RequestInit = {}) {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${SPOTIFY_API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}));
      console.error(`Spotify API Error on ${endpoint}:`, errorDetails);
      // 不再拋出錯誤，而是回傳錯誤物件
      return { success: false, error: errorDetails, status: response.status };
    }

    // 如果 API 回傳 204 No Content，則回傳成功但無資料
    if (response.status === 204) {
      return { success: true, data: null };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Network error on ${endpoint}:`, error);
    return { 
      success: false, 
      error: { message: 'Network error' }, 
      status: 500 
    };
  }
}

// 取得目前播放歌曲
export const getNowPlaying = () => fetchFromSpotify('me/player/currently-playing');

// 播放指定歌曲
export const playTrack = (trackUri: string, deviceId: string) => 
  fetchFromSpotify(`me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify({ uris: [trackUri] }),
  });

// 暫停播放
export const pausePlayback = () => fetchFromSpotify('me/player/pause', { method: 'PUT' });

// 播放下一首
export const nextTrack = () => fetchFromSpotify('me/player/next', { method: 'POST' });

// 播放上一首
export const previousTrack = () => fetchFromSpotify('me/player/previous', { method: 'POST' });

// 設定音量
export const setVolume = (volumePercent: number) => 
  fetchFromSpotify(`me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' });

// 跳轉到指定播放進度
export const seekToPosition = (positionMs: number) => 
  fetchFromSpotify(`me/player/seek?position_ms=${positionMs}`, { method: 'PUT' });

// 取得播放列表內容
export const getPlaylist = (playlistId: string) => 
  fetchFromSpotify(`playlists/${playlistId}`);

// 取得單一歌曲資訊
export const getTrack = (trackId: string) => 
  fetchFromSpotify(`tracks/${trackId}`); 