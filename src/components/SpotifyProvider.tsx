'use client';
import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode, useRef } from 'react';
import { useMusicStore, TrackInfo } from '@/store/music';
import { clientConfig } from '@/config/spotify';
import { useApi } from '@/hooks/useApi';
import { shuffleArray } from '@/lib/utils';
import { toast } from 'sonner';

interface SpotifyContextProps {
  playTrack: (track: TrackInfo, isInterrupt?: boolean) => void;
  handlePlay: () => void;
  handlePlayRandom: () => void;
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
    artists: { name: string }[];
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
  
  const get = useMusicStore.getState;
  
  const [loading, setLoading] = useState(true);
  
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlaybackInitiatedRef = useRef(false);

  const { exec: nowPlayingApi } = useApi<NowPlayingResponse>('GET', '/api/spotify/now-playing');

  const syncPlaybackState = useCallback(async () => {
    if (playerRef.current && (await playerRef.current.getCurrentState())?.paused === false) {
        return;
    }
    try {
        const data = await nowPlayingApi();
        if (data && data.isPlaying && data.item) {
            const track: TrackInfo = {
                title: data.item.name,
                artist: data.item.artists.map(a => a.name).join(', '),
                album: data.item.album.name,
                albumImageUrl: data.item.album.images[0]?.url,
                songUrl: data.item.external_urls.spotify,
                trackId: data.item.id,
                duration: data.item.duration_ms / 1000,
            };
            if (get().currentTrack?.trackId !== track.trackId) {
                setTrack(track);
            }
            setDuration(track.duration || 0);
            setProgress(data.progress_ms / 1000);
            if(!get().isPlaying) setIsPlaying(true);
        } else {
            if(get().isPlaying) setIsPlaying(false);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
           // Handle auth errors if needed
        } else {
          console.error("Sync state failed:", error)
        }
    }
  }, [nowPlayingApi, setTrack, setDuration, setProgress, setIsPlaying, get]);

  useEffect(() => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(syncPlaybackState, 5000);
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [syncPlaybackState]);

  const playPlaylist = useCallback(async (playlistId: string, options: { uris?: string[] } = {}) => {
    if (!deviceIdRef.current) return;
    try {
      const body = options.uris 
        ? { uris: options.uris }
        : { context_uri: `spotify:playlist:${playlistId}` };

      const response = await fetch(`/api/spotify/play?deviceId=${deviceIdRef.current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error('Failed to play playlist');
      }
    } catch (error) {
      console.error('Failed to play playlist:', error);
      toast.error('播放清單失敗');
    }
  }, []);

  const resumeTrack = useCallback(async () => {
    if (!isReady || !deviceIdRef.current) return;
    try {
      const response = await fetch(`/api/spotify/resume?deviceId=${deviceIdRef.current}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        console.warn('Resume command failed, possibly no active track.');
      }
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  }, [isReady]);

  const handlePlay = useCallback(async () => {
    if (!isReady || !deviceIdRef.current) {
      alert('播放器尚未準備好');
      return;
    }

    if (hasPlaybackInitiatedRef.current) {
      await resumeTrack();
    } else {
      await playPlaylist(DEFAULT_PLAYLIST_ID);
      hasPlaybackInitiatedRef.current = true;
    }
  }, [isReady, resumeTrack, playPlaylist]);

  const interruptPlay = useCallback(async (track: TrackInfo, deviceId: string) => {
    try {
      const trackUri = `spotify:track:${track.trackId}`;
      const response = await fetch(`/api/spotify/play?deviceId=${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [trackUri] }),
      });
      if (!response.ok) throw new Error('Failed to interrupt play');
    } catch (error) {
      console.error('Failed to interrupt play:', error);
    }
  }, []);

  const handlePlayRandom = useCallback(async () => {
    if (!isReady || !deviceIdRef.current) {
        alert('播放器尚未準備好');
        return;
    }
    const currentQueue = get().queue;
    if (!currentQueue.length) {
        alert('播放清單為空，無法隨機播放');
        return;
    }
    try {
        const shuffledQueue = shuffleArray(currentQueue);
        const trackUris = shuffledQueue.map(track => `spotify:track:${track.trackId}`);
        await playPlaylist(DEFAULT_PLAYLIST_ID, { uris: trackUris });
        setQueue(shuffledQueue);
        setTrack(shuffledQueue[0]);
        setIsPlaying(true);
        hasPlaybackInitiatedRef.current = true;
        toast.success('已開始隨機播放！');
    } catch (error) {
        console.error('Failed to start random playback:', error);
        alert(`隨機播放失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }, [isReady, get, setQueue, setTrack, setIsPlaying, playPlaylist]);
  
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

  const playTrack = useCallback(async (track: TrackInfo, isInterrupt = false) => {
    if (!isReady || !deviceIdRef.current) {
      alert("Spotify 播放器尚未準備就緒。");
      return;
    }
    
    const trackUri = `spotify:track:${track.trackId}`;

    try {
      if (isInterrupt) {
        // ✨ 全新的插播邏輯
        // 1. 呼叫後端 API，將歌曲新增至 Spotify 的遠端佇列
        const queueResponse = await fetch('/api/spotify/add-to-queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackUri }),
        });

        if (!queueResponse.ok) {
          const errorData = await queueResponse.json().catch(() => ({}));
          throw new Error(errorData.message || '新增歌曲至佇列失敗');
        }

        // 2. 呼叫「下一首」API，讓播放器立即跳到我們剛剛新增的歌曲
        await fetch(`/api/spotify/next?deviceId=${deviceIdRef.current}`, { method: 'POST' });

        // 3. 更新本地的 Zustand 狀態，保持與遠端同步
        insertTrack(track);

      } else {
        // 如果不是插播，則維持原本的邏輯 (取代整個佇列)
        await fetch(`/api/spotify/play?deviceId=${deviceIdRef.current}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uris: [trackUri] }),
        });
        setTrack(track);
      }

      // 無論是哪種方式，都將播放狀態設為 true，並標記為已開始播放
      setIsPlaying(true);
      hasPlaybackInitiatedRef.current = true;

    } catch (error) {
      console.error('Failed to play track:', error);
      toast.error(`播放歌曲失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }, [isReady, insertTrack, setTrack, setIsPlaying]); // 移除 nextTrack 依賴

  const nextTrack = useCallback(async () => {
    if (!deviceIdRef.current) return;
    try {
      await fetch(`/api/spotify/next?deviceId=${deviceIdRef.current}`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to call next track:', error);
    }
  }, []);

  const previousTrack = useCallback(async () => {
    if (!deviceIdRef.current) return;
    try {
      await fetch(`/api/spotify/previous?deviceId=${deviceIdRef.current}`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to call previous track:', error);
    }
  }, []);

  const pauseTrack = useCallback(async () => {
    if (!deviceIdRef.current) return;
    try {
      await fetch(`/api/spotify/pause?deviceId=${deviceIdRef.current}`, { method: 'PUT' });
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  }, []);

  const handleSetVolume = useCallback(async (newVolume: number) => {
    if(playerRef.current) {
      await playerRef.current.setVolume(newVolume);
    }
  }, []);

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
                if (get().isPlaying) setIsPlaying(false);
                return;
            }

            const sdkTrack = state.track_window.current_track;
            const currentStoreTrack = get().currentTrack;

            if (sdkTrack.id && sdkTrack.id !== currentStoreTrack?.trackId) {
              const trackInfo: TrackInfo = {
                  trackId: sdkTrack.id,
                  title: sdkTrack.name,
                  artist: sdkTrack.artists.map(a => a.name).join(', '),
                  album: sdkTrack.album.name,
                  albumImageUrl: sdkTrack.album.images[0].url,
                  songUrl: `https://open.spotify.com/track/${sdkTrack.id}`,
                  duration: state.duration / 1000,
              };
              setTrack(trackInfo);
              setDuration(state.duration / 1000);
            }
            
            if (state.paused === get().isPlaying) {
              setIsPlaying(!state.paused);
            }
            setProgress(state.position / 1000);
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
  }, [initializeDefaultPlaylist, get, setIsPlaying, setTrack, setDuration, setProgress, setIsReady]);
  
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress(get().progress + 1);
      }, 1000);
    }
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current) };
  }, [isPlaying, setProgress, get]);


  return (
    <SpotifyContext.Provider value={{
      playTrack, handlePlay, handlePlayRandom, pauseTrack, nextTrack, previousTrack, handleSetVolume, seek,
      loading, isReady, isPlaying, currentTrack, 
      volume, progress, duration, resumeTrack
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};