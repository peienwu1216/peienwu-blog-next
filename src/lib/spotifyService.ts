import { getAccessToken, NOW_PLAYING_ENDPOINT, PREVIOUS_ENDPOINT, NEXT_ENDPOINT, VOLUME_ENDPOINT, SEEK_ENDPOINT, clearTokenCache } from './spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// 定義不回傳 JSON 內容的端點
const NO_CONTENT_ENDPOINTS = [
  'me/player/play',
  'me/player/pause', 
  'me/player/next',
  'me/player/previous',
  'me/player/seek',
  'me/player/volume',
  'me/player/queue'
];

// 封裝 fetch 邏輯，自動加入 Authorization header
async function fetchFromSpotify(endpoint: string, options: RequestInit = {}) {
  try {
    // ✨ 每次 API 呼叫都獲取最新的 token
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${SPOTIFY_API_BASE}/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // 先檢查狀態碼，再決定是否解析 JSON
    if (!response.ok) {
      let errorDetails: any = {};
      try {
        // 嘗試解析錯誤回應的 JSON
        const errorText = await response.text();
        if (errorText) {
          errorDetails = JSON.parse(errorText);
        }
      } catch (parseError) {
        // 如果無法解析 JSON，使用文字內容
        errorDetails = { message: await response.text() || `HTTP ${response.status}` };
      }
      
      // 提供更友善的錯誤訊息
      let userMessage = 'Spotify API 錯誤';
      if (errorDetails.error?.reason === 'NO_ACTIVE_DEVICE') {
        userMessage = '找不到活躍的 Spotify 設備，請確保 Spotify 應用程式已開啟';
      } else if (errorDetails.error?.reason === 'PREMIUM_REQUIRED') {
        userMessage = '此功能需要 Spotify Premium 會員資格';
      } else if (response.status === 401) {
        userMessage = 'Spotify 認證失敗，請重新登入';
        // ✨ 如果是 401 錯誤，清除 token 快取
        clearTokenCache();
      } else if (response.status === 403) {
        userMessage = '沒有權限執行此操作';
      } else if (response.status === 404) {
        userMessage = '找不到指定的資源';
      } else if (response.status >= 500) {
        userMessage = 'Spotify 服務暫時無法使用，請稍後再試';
      }
      
      console.error(`Spotify API Error on ${endpoint}:`, errorDetails);
      return { 
        success: false, 
        error: { 
          ...errorDetails, 
          userMessage 
        }, 
        status: response.status 
      };
    }

    // 檢查是否為不回傳內容的端點
    const isNoContentEndpoint = NO_CONTENT_ENDPOINTS.some(ep => endpoint.includes(ep));
    
    // 如果是不回傳內容的端點或狀態碼是 204，則回傳成功但無資料
    if (isNoContentEndpoint || response.status === 204) {
      return { success: true, data: null };
    }

    // 檢查 Content-Type 來決定是否解析 JSON
    const contentType = response.headers.get('content-type');
    const hasContent = response.headers.get('content-length') !== '0';
    
    // 如果沒有內容，則回傳成功但無資料
    if (!hasContent) {
      return { success: true, data: null };
    }

    // 如果 Content-Type 不是 JSON，則不嘗試解析
    if (contentType && !contentType.includes('application/json')) {
      console.warn(`Non-JSON response from ${endpoint}: ${contentType}`);
      return { success: true, data: null };
    }

    // 嘗試解析 JSON，如果失敗則回傳錯誤
    try {
      const data = await response.json();
      return { success: true, data };
    } catch (parseError) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, parseError);
      // 如果解析失敗但狀態碼是成功的，我們仍然回傳成功
      return { success: true, data: null };
    }
  } catch (error) {
    console.error(`Network error on ${endpoint}:`, error);
    return { 
      success: false, 
      error: { 
        message: 'Network error',
        userMessage: '網路連線錯誤，請檢查您的網路連線'
      }, 
      status: 500 
    };
  }
}

// 取得目前播放歌曲
export const getNowPlaying = () => fetchFromSpotify('me/player/currently-playing');

// 播放指定歌曲、多首歌曲或播放清單
export const playTrack = (playOptions: { 
  uris?: string[]; 
  context_uri?: string; 
  trackUri?: string;
  position_ms?: number;
}, deviceId: string) => {
  
  const body: { 
    uris?: string[]; 
    context_uri?: string; 
    position_ms?: number 
  } = {};

  // 根據傳入的參數，建構送往 Spotify API 的 body
  if (playOptions.uris) {
    body.uris = playOptions.uris;
  } else if (playOptions.context_uri) {
    body.context_uri = playOptions.context_uri;
  } else if (playOptions.trackUri) {
    // 處理單一歌曲插播的情況
    body.uris = [playOptions.trackUri];
  } else {
    // 如果 playOptions 是一個字串（為了相容舊版呼叫）
    const uri = playOptions as unknown as string;
    if (uri.includes('spotify:playlist:')) {
      body.context_uri = uri;
    } else {
      body.uris = [uri];
    }
  }

  // 如果傳入了 position_ms，就將它加入到請求的 body 中
  if (typeof playOptions.position_ms === 'number') {
    body.position_ms = playOptions.position_ms;
  }

  return fetchFromSpotify(`me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

// 暫停播放
export const pausePlayback = (deviceId?: string) => {
  const endpoint = deviceId ? `me/player/pause?device_id=${deviceId}` : 'me/player/pause';
  return fetchFromSpotify(endpoint, { method: 'PUT' });
};

// 恢復播放
export const resumePlayback = (deviceId: string) => 
  fetchFromSpotify(`me/player/play?device_id=${deviceId}`, { method: 'PUT' });

// 播放下一首
export const nextTrack = (deviceId?: string) => {
  const endpoint = deviceId ? `me/player/next?device_id=${deviceId}` : 'me/player/next';
  return fetchFromSpotify(endpoint, { method: 'POST' });
};

// 播放上一首
export const previousTrack = (deviceId?: string) => {
  const endpoint = deviceId ? `me/player/previous?device_id=${deviceId}` : 'me/player/previous';
  return fetchFromSpotify(endpoint, { method: 'POST' });
};

// 設定音量
export const setVolume = (volumePercent: number, deviceId?: string) => {
  // 將音量值四捨五入到整數，避免浮點數精度問題
  const roundedVolume = Math.round(volumePercent);
  const endpoint = deviceId 
    ? `me/player/volume?volume_percent=${roundedVolume}&device_id=${deviceId}` 
    : `me/player/volume?volume_percent=${roundedVolume}`;
  return fetchFromSpotify(endpoint, { method: 'PUT' });
};

// 跳轉到指定播放進度
export const seekToPosition = (positionMs: number, deviceId?: string) => {
  const endpoint = deviceId 
    ? `me/player/seek?position_ms=${positionMs}&device_id=${deviceId}` 
    : `me/player/seek?position_ms=${positionMs}`;
  return fetchFromSpotify(endpoint, { method: 'PUT' });
};

// 取得播放列表內容
export const getPlaylist = (playlistId: string) => {
  // 移除 fields 參數限制，回傳完整的 playlist 資料
  return fetchFromSpotify(`playlists/${playlistId}`);
};

// 取得單一歌曲資訊
export const getTrack = (trackId: string) => 
  fetchFromSpotify(`tracks/${trackId}`);

// 新增：將歌曲加入 Spotify queue
export const addToQueue = (trackUri: string, deviceId?: string) => {
  const endpoint = deviceId
    ? `me/player/queue?uri=${encodeURIComponent(trackUri)}&device_id=${deviceId}`
    : `me/player/queue?uri=${encodeURIComponent(trackUri)}`;
  return fetchFromSpotify(endpoint, { method: 'POST' });
};

/**
 * 將播放狀態明確轉移到指定的裝置。
 * @param deviceId 要轉移到的裝置 ID
 * @param play 是否在轉移後立即播放。設為 true 可以強制讓指定裝置變為活躍裝置。
 * @returns 服務操作結果
 */
export const transferPlayback = (deviceId: string, play: boolean = true) => {
  return fetchFromSpotify('me/player', {
    method: 'PUT',
    body: JSON.stringify({
      device_ids: [deviceId],
      play: play
    }),
  });
};

// 取得播放器狀態
export const getPlayerState = () => fetchFromSpotify('me/player'); 