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
  handleSetVolume: (volume: number) => void;
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
  const { 
    currentTrack, 
    queue, 
    isPlaying,
    isReady,
    progress,
    duration,
    volume,
    setTrack, 
    setQueue, 
    insertTrack,
    setIsPlaying,
    setIsReady,
    setProgress,
    setDuration,
    setVolume: setVolumeState
  } = useMusicStore();
  
  // 將播放器狀態移至 Provider 的本地 state
  const [loading, setLoading] = useState(true);
  
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 使用 useApi Hook 來準備好我們的 API 呼叫函式
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
  }, [currentTrack, isPlaying, setTrack, setProgress, setDuration, setIsPlaying, nowPlayingApi]);

  useEffect(() => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(syncPlaybackState, 5000);
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [syncPlaybackState]);

  // ✨ 修改：resumeTrack 函式，使用原生 fetch
  const resumeTrack = useCallback(async () => {
    if (!isReady || !deviceIdRef.current) return;
    
    try {
      const response = await fetch(`/api/spotify/resume?deviceId=${deviceIdRef.current}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to call resume track API');
      }
      console.log('Resume track called successfully');
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  }, [isReady]);

  // ✨ 新增：插播功能（中斷當前播放並播放新歌）
  const interruptPlay = useCallback(async (track: TrackInfo, deviceId: string) => {
    try {
      const trackUri = `spotify:track:${track.trackId}`;
      
      // 直接播放這首歌，會中斷當前播放並開始播放新歌
      const response = await fetch(`/api/spotify/play?deviceId=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackUri }),
      });
      if (!response.ok) {
        throw new Error('Failed to interrupt play');
      }
      
      console.log(`Interrupted with track: ${track.title}`);
    } catch (error) {
      console.error('Failed to interrupt play:', error);
    }
  }, []);

  // ✨ 新增：將 playlist 同步到 Spotify queue
  const syncPlaylistToSpotify = useCallback(async (tracks: TrackInfo[], deviceId: string) => {
    if (!tracks.length || !deviceId) return;
    try {
      // 1. 先播放第一首
      const firstTrackUri = `spotify:track:${tracks[0].trackId}`;
      const playResponse = await fetch(`/api/spotify/play?deviceId=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackUri: firstTrackUri }),
      });
      if (!playResponse.ok) {
        throw new Error('Failed to play first track');
      }
      // 2. 依序把剩下的歌加到 Spotify queue
      for (let i = 1; i < tracks.length; i++) {
        const trackUri = `spotify:track:${tracks[i].trackId}`;
        const queueResponse = await fetch(`/api/spotify/queue?deviceId=${deviceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trackUri }),
        });
        if (!queueResponse.ok) {
          console.warn(`Failed to add track ${i} to queue`);
        }
      }
      console.log(`Synced ${tracks.length} tracks to Spotify queue`);
    } catch (error) {
      console.error('Failed to sync playlist to Spotify:', error);
    }
  }, []);

  // ✨ 新增：記錄 queue 是否已同步到 Spotify
  const queueSyncedRef = useRef(false);

  // ✨ 修改：將 playlist 載入時只設置 queue，不自動播放
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
        queueSyncedRef.current = false; // 標記 queue 尚未同步
      }
    } catch (e) {
      console.error("Failed to load default playlist", e);
    } finally {
      setLoading(false);
    }
  }, [setQueue, setTrack, setDuration]);

  // ✨ 修改 playTrack：第一次播放時才同步 queue 並播放
  const playTrack = useCallback(async (track: TrackInfo, isInterrupt = false) => {
    if (!isReady || !deviceIdRef.current) {
      alert("Spotify 播放器尚未準備就緒。");
      return;
    }
    // 第一次播放時才同步 queue
    if (!queueSyncedRef.current && queue.length > 0) {
      await syncPlaylistToSpotify(queue, deviceIdRef.current);
      queueSyncedRef.current = true;
    }
    if (isInterrupt) {
      await interruptPlay(track, deviceIdRef.current);
      insertTrack(track);
    } else {
      const trackUri = `spotify:track:${track.trackId}`;
      try {
        const response = await fetch(`/api/spotify/play?deviceId=${deviceIdRef.current}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trackUri }),
        });
        if (!response.ok) {
          throw new Error('Failed to play track API');
        }
        setTrack(track);
        console.log('Play track called successfully');
      } catch (error) {
        console.error('Failed to play track:', error);
      }
    }
  }, [isReady, insertTrack, setTrack, interruptPlay, queue, syncPlaylistToSpotify]);

  const nextTrack = useCallback(async () => {
    console.log('nextTrack called, deviceId:', deviceIdRef.current, 'isReady:', isReady);
    if (!deviceIdRef.current) {
      console.error('No device ID available - Spotify SDK may not be initialized');
      alert('Spotify 播放器尚未準備就緒，請稍後再試');
      return;
    }
    try {
      console.log('Calling next API with deviceId:', deviceIdRef.current);
      const response = await fetch(`/api/spotify/next?deviceId=${deviceIdRef.current}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to call next track API');
      }
      console.log('Next track API call successful');
    } catch (error) {
      console.error('Failed to call next track:', error);
      alert('切換下一首失敗，請稍後再試');
    }
  }, [isReady]);

  const previousTrack = useCallback(async () => {
    console.log('previousTrack called, deviceId:', deviceIdRef.current, 'isReady:', isReady);
    if (!deviceIdRef.current) {
      console.error('No device ID available - Spotify SDK may not be initialized');
      alert('Spotify 播放器尚未準備就緒，請稍後再試');
      return;
    }
    try {
      console.log('Calling previous API with deviceId:', deviceIdRef.current);
      const response = await fetch(`/api/spotify/previous?deviceId=${deviceIdRef.current}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to call previous track API');
      }
      console.log('Previous track API call successful');
    } catch (error) {
      console.error('Failed to call previous track:', error);
      alert('切換上一首失敗，請稍後再試');
    }
  }, [isReady]);

  const pauseTrack = useCallback(async () => {
    console.log('pauseTrack called, deviceId:', deviceIdRef.current, 'isReady:', isReady);
    if (!deviceIdRef.current) {
      console.error('No device ID available - Spotify SDK may not be initialized');
      alert('Spotify 播放器尚未準備就緒，請稍後再試');
      return;
    }
    try {
      console.log('Calling pause API with deviceId:', deviceIdRef.current);
      const response = await fetch(`/api/spotify/pause?deviceId=${deviceIdRef.current}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to call pause track API');
      }
      console.log('Pause track API call successful');
    } catch (error) {
      console.error('Failed to pause track:', error);
      alert('暫停播放失敗，請稍後再試');
    }
  }, [isReady]);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    if(playerRef.current) {
      await playerRef.current.setVolume(newVolume);
      setVolumeState(newVolume);
    }
    // 同時呼叫 API 同步到 Spotify
    if (deviceIdRef.current) {
      try {
        const response = await fetch(`/api/spotify/volume?deviceId=${deviceIdRef.current}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ volume: newVolume * 100 }),
        });
        if (!response.ok) {
          throw new Error('Failed to set volume API');
        }
        console.log('Volume set successfully');
      } catch (error) {
        console.error('Failed to set volume:', error);
      }
    }
  }, [setVolumeState]);

  const seek = useCallback(async (newPosition: number) => {
    if(playerRef.current) {
      await playerRef.current.seek(newPosition * 1000);
      setProgress(newPosition);
    }
    // 同時呼叫 API 同步到 Spotify
    if (deviceIdRef.current) {
      try {
        const response = await fetch(`/api/spotify/seek?deviceId=${deviceIdRef.current}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: newPosition * 1000 }),
        });
        if (!response.ok) {
          throw new Error('Failed to seek position API');
        }
        console.log('Seek position set successfully');
      } catch (error) {
        console.error('Failed to seek position:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || playerRef.current) return;
    console.log('Setting up Spotify SDK...');
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify SDK ready callback triggered');
      initializePlayer();
    };
    const initializePlayer = async () => {
      try {
        console.log('Initializing Spotify player...');
        const tokenRes = await fetch('/api/spotify/access-token');
        if (!tokenRes.ok) throw new Error('Failed to get access token');
        const { accessToken } = await tokenRes.json();
        console.log('Got access token, creating player...');
        const player = new window.Spotify.Player({
          name: "Peienwu's Code Lab",
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5
        });
        player.addListener('ready', ({ device_id }) => {
          console.log('Spotify SDK ready, device_id:', device_id);
          deviceIdRef.current = device_id;
          setIsReady(true);
          initializeDefaultPlaylist();
        });
        player.addListener('not_ready', () => {
          console.log('Spotify SDK not ready');
          setIsReady(false);
        });
        player.addListener('player_state_changed', (state) => {
            console.log('Player state changed:', state);
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
        console.log('Connecting to Spotify...');
        await player.connect();
        playerRef.current = player;
        console.log('Spotify player connected successfully');
      } catch (error) {
        console.error('[Spotify SDK] Initialization failed:', error);
      }
    };
    if (window.Spotify) {
      console.log('Spotify SDK already available, initializing...');
      initializePlayer();
    } else {
      console.log('Waiting for Spotify SDK to load...');
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
  const isAnyLoading = false;

  return (
    <SpotifyContext.Provider value={{
      playTrack, pauseTrack, nextTrack, previousTrack, handleSetVolume, seek,
      loading: loading || isAnyLoading, isReady, isPlaying, currentTrack, 
      volume, progress, duration, resumeTrack
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};