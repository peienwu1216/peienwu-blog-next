'use client';
import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode, useRef } from 'react';
import { useMusicStore, TrackInfo } from '@/store/music';
import { clientConfig } from '@/config/spotify';
import { useApi } from '@/hooks/useApi';

interface SpotifyContextProps {
  playTrack: (track: TrackInfo, isInterrupt?: boolean) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;
  loading: boolean;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
  volume: number;
  progress: number;
  duration: number;
}

interface NowPlayingResponse {
  isPlaying: boolean;
  item: {
    id: string;
    name: string;
    artists: string[];
    album: {
      name: string;
      images: { url: string }[];
    };
    external_urls: {
      spotify: string;
    };
    duration_ms: number;
  } | null;
  progress_ms: number;
  duration_ms: number;
}

const SpotifyContext = createContext<SpotifyContextProps | undefined>(undefined);

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

// 🚨 使用設定檔中的預設播放列表 ID
const DEFAULT_PLAYLIST_ID = clientConfig.defaultPlaylistId;

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  const { currentTrack, queue, setTrack, setQueue, insertTrack } = useMusicStore();
  
  // 將播放器狀態移至 Provider 的本地 state
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 使用 useApi Hook 來準備好我們的 API 呼叫函式
  const { exec: playApi, isLoading: isPlayLoading } = useApi('PUT', '/api/spotify/play');
  const { exec: pauseApi, isLoading: isPauseLoading } = useApi('PUT', '/api/spotify/pause');
  const { exec: resumeApi, isLoading: isResumeLoading } = useApi('PUT', '/api/spotify/resume');
  const { exec: nextApi, isLoading: isNextLoading } = useApi('POST', '/api/spotify/next');
  const { exec: previousApi, isLoading: isPreviousLoading } = useApi('POST', '/api/spotify/previous');
  const { exec: volumeApi, isLoading: isVolumeLoading } = useApi('PUT', '/api/spotify/volume');
  const { exec: seekApi, isLoading: isSeekLoading } = useApi('PUT', '/api/spotify/seek');
  const { exec: nowPlayingApi } = useApi<NowPlayingResponse>('GET', '/api/spotify/now-playing');

  // ✨ --- 新增：主動同步狀態的函式 --- ✨
  const syncPlaybackState = useCallback(async () => {
    if (playerRef.current && (await playerRef.current.getCurrentState())?.paused === false) {
        return;
    }
    try {
        const data = await nowPlayingApi();
        if (data && data.isPlaying && data.item) {
            const track: TrackInfo = {
                title: data.item.name,
                artist: data.item.artists.join(', '),
                album: data.item.album.name,
                albumImageUrl: data.item.album.images[0]?.url,
                songUrl: data.item.external_urls.spotify,
                trackId: data.item.id,
                duration: data.item.duration_ms / 1000,
            };
            if (currentTrack?.trackId !== track.trackId) {
                setTrack(track);
            }
            setDuration(track.duration || 0);
            setProgress(data.progress_ms / 1000);
            if(!isPlaying) setIsPlaying(true);
        } else {
            if(isPlaying) setIsPlaying(false);
        }
    } catch (error) {
        console.error("Sync state failed:", error)
    }
  }, [currentTrack, isPlaying, setTrack, setProgress, setDuration, nowPlayingApi]);

  useEffect(() => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(syncPlaybackState, 5000);
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [syncPlaybackState]);

  // ✨ 修改：resumeTrack 函式，使用 useApi
  const resumeTrack = useCallback(async () => {
    if (!isReady || !deviceIdRef.current) return;
    
    // 樂觀更新：立即更新 UI 狀態
    if (currentTrack) setIsPlaying(true);
    
    // 使用 useApi Hook 呼叫 resume API
    const result = await resumeApi({ deviceId: deviceIdRef.current });
    
    if (!result) {
      // 如果失敗，回滾 UI 狀態
      setIsPlaying(false);
    }
  }, [isReady, currentTrack, resumeApi]);

  // ✨ 修改：playTrack 函式，使用 useApi
  const playTrack = useCallback(async (track: TrackInfo, isInterrupt = false) => {
    if (!isReady || !deviceIdRef.current) {
      alert("Spotify 播放器尚未準備就緒。");
      return;
    }
    
    const trackUri = `spotify:track:${track.trackId}`;
    
    // 直接呼叫 exec 函式，傳入需要的 body
    const result = await playApi({ trackUri, deviceId: deviceIdRef.current });

    if (result) {
      // 成功時，由 Spotify SDK 的 'player_state_changed' 事件來更新狀態，
      // 我們只需在 store 中處理播放列表邏輯
      if (isInterrupt) {
        insertTrack(track);
      } else {
        setTrack(track);
      }
    }
  }, [isReady, playApi, insertTrack, setTrack]);

  const changeTrack = useCallback((direction: 'next' | 'previous') => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId);
    if (currentIndex === -1) {
      if(queue.length > 0) playTrack(queue[0]);
      return;
    };
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % queue.length;
    } else {
      nextIndex = (currentIndex - 1 + queue.length) % queue.length;
    }
    playTrack(queue[nextIndex]);
  }, [currentTrack, queue, playTrack]);

  const nextTrack = useCallback(async () => {
    if (!deviceIdRef.current) {
      console.error('No device ID available');
      return;
    }
    const result = await nextApi({ deviceId: deviceIdRef.current });
    if (result) {
      // 成功時，由 SDK 事件更新狀態
      changeTrack('next');
    }
  }, [nextApi, changeTrack]);

  const previousTrack = useCallback(async () => {
    if (!deviceIdRef.current) {
      console.error('No device ID available');
      return;
    }
    const result = await previousApi({ deviceId: deviceIdRef.current });
    if (result) {
      // 成功時，由 SDK 事件更新狀態
      changeTrack('previous');
    }
  }, [previousApi, changeTrack]);

  const pauseTrack = useCallback(async () => {
    if (!deviceIdRef.current) {
      console.error('No device ID available');
      return;
    }
    setIsPlaying(false); // 樂觀更新
    await pauseApi({ deviceId: deviceIdRef.current }); // 呼叫 API，錯誤處理已在 Hook 中完成
  }, [pauseApi]);

  const setVolume = useCallback(async (newVolume: number) => {
    if(playerRef.current) {
      await playerRef.current.setVolume(newVolume);
      setVolumeState(newVolume);
    }
    // 同時呼叫 API 同步到 Spotify
    if (deviceIdRef.current) {
      await volumeApi({ volume: newVolume * 100, deviceId: deviceIdRef.current });
    }
  }, [volumeApi]);

  const seek = useCallback(async (newPosition: number) => {
    if(playerRef.current) {
      await playerRef.current.seek(newPosition * 1000);
      setProgress(newPosition);
    }
    // 同時呼叫 API 同步到 Spotify
    if (deviceIdRef.current) {
      await seekApi({ position: newPosition * 1000, deviceId: deviceIdRef.current });
    }
  }, [seekApi]);

  const initializeDefaultPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/spotify/playlist/${DEFAULT_PLAYLIST_ID}`);
      if (res.ok) {
        const tracks: TrackInfo[] = await res.json();
        setQueue(tracks);
        if (tracks.length > 0) {
          const firstTrack = { ...tracks[0], duration: tracks[0].duration || 0 };
          setTrack(firstTrack);
          setDuration(firstTrack.duration);
        }
      }
    } catch (e) {
      console.error("Failed to load default playlist", e);
    } finally {
      setLoading(false);
    }
  }, [setQueue, setTrack, setDuration]);

  useEffect(() => {
    if (typeof window === 'undefined' || playerRef.current) return;
    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer();
    };
    const initializePlayer = async () => {
      try {
        const tokenRes = await fetch('/api/spotify/access-token');
        if (!tokenRes.ok) throw new Error('Failed to get access token');
        const { accessToken } = await tokenRes.json();
        const player = new window.Spotify.Player({
          name: "Peienwu's Code Lab",
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5
        });
        player.addListener('ready', ({ device_id }) => {
          deviceIdRef.current = device_id;
          setIsReady(true);
          initializeDefaultPlaylist();
        });
        player.addListener('not_ready', () => {
          setIsReady(false);
        });
        player.addListener('player_state_changed', (state) => {
            if (!state) {
                setIsPlaying(false);
                return;
            }
            const sdkTrack = state.track_window.current_track;
            const trackInfo: TrackInfo = {
                trackId: sdkTrack.id ?? '',
                title: sdkTrack.name,
                artist: sdkTrack.artists.map(a => a.name).join(', '),
                album: sdkTrack.album.name,
                albumImageUrl: sdkTrack.album.images[0].url,
                songUrl: `https://open.spotify.com/track/${sdkTrack.id}`,
                duration: state.duration / 1000,
            };
            setTrack(trackInfo);
            setProgress(state.position / 1000);
            setDuration(state.duration / 1000);
            setIsPlaying(!state.paused);
        });
        await player.connect();
        playerRef.current = player;
      } catch (error) {
        console.error('[Spotify SDK] Initialization failed:', error);
      }
    };
    if (window.Spotify) {
      initializePlayer();
    }
  }, [initializeDefaultPlaylist, setTrack, setProgress, setDuration]);

  // ✨ 2. 新增此 useEffect 來管理進度更新的計時器
  useEffect(() => {
    // 當 isPlaying 狀態改變時，先清除舊的計時器
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // 如果正在播放，就建立一個新的計時器
    if (isPlaying) {
      progressIntervalRef.current = setInterval(async () => {
        if (playerRef.current) {
          const state = await playerRef.current.getCurrentState();
          if (state && !state.paused) {
            // 更新全域狀態中的進度（單位：秒）
            setProgress(state.position / 1000);
          }
        }
      }, 1000); // 每秒更新一次
    }

    // 元件卸載或 isPlaying 變為 false 時，清除計時器
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, setProgress]);

  // 組合所有 loading 狀態
  const isAnyLoading = isPlayLoading || isPauseLoading || isResumeLoading || isNextLoading || 
                      isPreviousLoading || isVolumeLoading || isSeekLoading;

  return (
    <SpotifyContext.Provider value={{
      playTrack, pauseTrack, nextTrack, previousTrack, setVolume, seek,
      loading: loading || isAnyLoading, isReady, isPlaying, currentTrack, 
      volume, progress, duration, resumeTrack
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};