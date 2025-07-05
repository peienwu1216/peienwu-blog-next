'use client';
import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode, useRef } from 'react';
import { useMusicStore, TrackInfo } from '@/store/music';

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

const SpotifyContext = createContext<SpotifyContextProps | undefined>(undefined);

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be used within a SpotifyProvider');
  return ctx;
};

// 🚨 請在此處填入您想要的預設播放列表 Spotify ID
const DEFAULT_PLAYLIST_ID = '0EUdsblGUaGfNvwPES3qka'; // 例如：Spotify 的 "Lofi Beats"

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  const {
    isPlaying, currentTrack, volume, progress, duration, queue,
    play, pause, setTrack, setQueue, setVolume: setVolumeInStore, setProgress, setDuration, insertTrack
  } = useMusicStore();
  
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✨ --- 新增：主動同步狀態的函式 --- ✨
  const syncPlaybackState = useCallback(async () => {
    if (playerRef.current && (await playerRef.current.getCurrentState())?.paused === false) {
        return;
    }
    try {
        const res = await fetch('/api/spotify/now-playing');
        if (!res.ok) return;
        const data = await res.json();
        if (data.isPlaying && data.item) {
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
            if(!isPlaying) play(track);
        } else {
            if(isPlaying) pause();
        }
    } catch (error) {
        console.error("Sync state failed:", error)
    }
  }, [currentTrack, isPlaying, play, pause, setTrack, setProgress, setDuration]);

  useEffect(() => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(syncPlaybackState, 5000);
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [syncPlaybackState]);

  // ✨ 新增：專門用於恢復播放的函式
  const resumeTrack = useCallback(async () => {
    if (!isReady || !deviceIdRef.current) return;
    
    // 樂觀更新：立即更新 UI 狀態
    if (currentTrack) play(currentTrack);
    
    try {
      const tokenRes = await fetch('/api/spotify/access-token');
      if (!tokenRes.ok) throw new Error('無法獲取 access token');
      const { accessToken } = await tokenRes.json();
      
      const SPOTIFY_PLAY_ENDPOINT = 'https://api.spotify.com/v1/me/player/play';
      await fetch(`${SPOTIFY_PLAY_ENDPOINT}?device_id=${deviceIdRef.current}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        // 注意：恢復播放時，不傳送 request body
      });
    } catch (e) {
      console.error("恢復播放時發生錯誤:", e);
      // 如果失敗，回滾 UI 狀態
      pause();
    }
  }, [isReady, play, currentTrack, pause]);

  // ✨ 修改：playTrack 函式，移除進度重設
  const playTrack = useCallback(async (track: TrackInfo, isInterrupt = false) => {
    if (!isReady || !deviceIdRef.current) {
      alert("Spotify 播放器尚未準備就緒。請確認您的 Spotify 帳號是 Premium 會員，並在其他裝置（如手機 App）上選擇 'Peienwu's Code Lab' 作為播放裝置後，重新整理頁面。");
      return;
    }
    const trackUri = `spotify:track:${track.trackId}`;
    const SPOTIFY_PLAY_ENDPOINT = 'https://api.spotify.com/v1/me/player/play';
    try {
      const tokenRes = await fetch('/api/spotify/access-token');
      if (!tokenRes.ok) throw new Error('無法獲取 access token');
      const { accessToken } = await tokenRes.json();
      const deviceId = deviceIdRef.current;
      if (!deviceId) throw new Error('No device id');
      
      const res = await fetch(`${SPOTIFY_PLAY_ENDPOINT}?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ uris: [trackUri] })
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error("Spotify 播放失敗:", errorBody);
        if (errorBody.error?.reason === 'PREMIUM_REQUIRED') {
            alert('此功能需要 Spotify Premium 會員資格。');
        }
        return;
      }
      
      // 核心修改：不再手動重設進度。
      // 讓 player_state_changed 事件來同步最真實的狀態。
      if (isInterrupt) {
        insertTrack(track);
      } else {
        // 只更新 zustand store 的狀態，不手動操作進度條
        play(track); 
      }
    } catch (e) {
        console.error("播放歌曲時發生錯誤:", e);
    }
  }, [isReady, insertTrack, play]);

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

  const nextTrack = () => changeTrack('next');
  const previousTrack = () => changeTrack('previous');

  const pauseTrack = useCallback(async () => {
    // 樂觀更新：立即更新 UI 狀態
    pause();
    
    if (playerRef.current) {
      try {
        await playerRef.current.pause();
      } catch (e) {
        console.error("暫停播放時發生錯誤:", e);
        // 如果失敗，恢復播放狀態
        if (currentTrack) play(currentTrack);
      }
    }
  }, [pause, currentTrack, play]);

  const setVolume = useCallback(async (newVolume: number) => {
      if(playerRef.current) {
        await playerRef.current.setVolume(newVolume);
        setVolumeInStore(newVolume);
      }
  }, [setVolumeInStore]);

  const seek = useCallback(async (newPosition: number) => {
    if(playerRef.current) {
      await playerRef.current.seek(newPosition * 1000);
      setProgress(newPosition);
    }
  }, [setProgress]);

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
                pause();
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
            state.paused ? pause() : play(trackInfo);
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
  }, [initializeDefaultPlaylist, pause, play, setProgress, setDuration, setTrack]);

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

  return (
    <SpotifyContext.Provider value={{
      playTrack, pauseTrack, nextTrack, previousTrack, setVolume, seek,
      loading, isReady, isPlaying, currentTrack, volume, progress, duration, resumeTrack
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};