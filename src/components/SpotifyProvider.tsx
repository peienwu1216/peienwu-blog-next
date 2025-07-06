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
  hasPlaybackInitiated: boolean;
  isControllable: boolean;
  expirationText: string; // ✨ 新增：動態過期時間文字
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
  
  // ✨ 新增狀態，用來儲存當前的主控裝置 ID
  const [masterDeviceId, setMasterDeviceId] = useState<string | null>(null);

  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasPlaybackInitiatedRef = useRef(false);
  
  // ✨ 新增節流控制，防止快速重複操作
  const isThrottledRef = useRef(false);

  // ✨ 計算出當前裝置是否可控制
  const isControllable = !masterDeviceId || masterDeviceId === deviceIdRef.current;

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

  // ✨ 新增狀態來儲存過期時間配置
  const [expirationText, setExpirationText] = useState<string>('5 分鐘');

  // ✨ 在元件載入時，獲取當前的主控裝置和配置
  useEffect(() => {
    const fetchMasterDeviceAndConfig = async () => {
      try {
        // 並行獲取主控裝置和配置
        const [masterRes, configRes] = await Promise.all([
          fetch('/api/spotify/master-device'),
          fetch('/api/spotify/master-device/config')
        ]);
        
        const masterData = await masterRes.json();
        const configData = await configRes.json();
        
        setMasterDeviceId(masterData.masterDeviceId);
        setExpirationText(configData.expirationText);
      } catch (e) {
        console.error("Failed to fetch master device or config", e);
      }
    };
    fetchMasterDeviceAndConfig();
  }, []);

  useEffect(() => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(syncPlaybackState, 5000);
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [syncPlaybackState]);

  // ✨ 定期檢查主控裝置狀態
  useEffect(() => {
    const checkMasterDeviceStatus = async () => {
      if (!masterDeviceId) return;
      
      try {
        const res = await fetch('/api/spotify/master-device');
        const data = await res.json();
        
        if (!data.masterDeviceId) {
          // 主控裝置已過期，清除本地狀態
          setMasterDeviceId(null);
          // ✨ 根據是否為主控裝置顯示不同通知
          if (deviceIdRef.current === masterDeviceId) {
            toast.info("您的播放控制權已過期，其他裝置現在可以取得控制權。");
          } else {
            toast.info("主控裝置已過期，現在可以播放了！");
          }
        } else if (data.masterDeviceId !== deviceIdRef.current) {
          toast.error("目前由其他裝置控制中，無法播放。");
          return;
        } else {
          // 我們就是主控裝置，清除過期的本地狀態
          setMasterDeviceId(data.masterDeviceId);
        }
      } catch (error) {
        console.error('Failed to check master device status:', error);
      }
    };

    const masterDeviceCheckInterval = setInterval(checkMasterDeviceStatus, 10000); // 每 10 秒檢查一次
    return () => clearInterval(masterDeviceCheckInterval);
  }, [masterDeviceId]);

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

  // ✨ 修正：直接呼叫 player 實例的方法，並加入權限檢查
  const resumeTrack = useCallback(async () => {
    if (!isReady || !playerRef.current) return;
    
    // ✨ 權限檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      toast.error("目前由其他裝置控制中，無法播放。");
      return;
    }

    try {
      await playerRef.current.resume();
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  }, [isReady, masterDeviceId]);

  const handlePlay = useCallback(async () => {
    if (!isReady || !deviceIdRef.current || isThrottledRef.current) {
      toast.error('播放器尚未準備好');
      return;
    }

    // ✨ 權限檢查 - 增加動態檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      // 先檢查主控裝置是否仍然有效
      try {
        const res = await fetch('/api/spotify/master-device');
        const data = await res.json();
        
        if (!data.masterDeviceId) {
          // 主控裝置已過期，清除本地狀態
          setMasterDeviceId(null);
          toast.info("主控裝置已過期，現在可以播放了！");
        } else if (data.masterDeviceId !== deviceIdRef.current) {
          toast.error("目前由其他裝置控制中，無法播放。");
          return;
        } else {
          // 我們就是主控裝置，清除過期的本地狀態
          setMasterDeviceId(data.masterDeviceId);
        }
      } catch (error) {
        console.error('Failed to check master device status:', error);
        toast.error("檢查播放權限失敗，請稍後再試。");
        return;
      }
    }

    // 如果沒有主控裝置，此裝置將成為新的主控！
    if (!masterDeviceId) {
      try {
        const res = await fetch('/api/spotify/master-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: deviceIdRef.current }),
        });
        const data = await res.json();
        if (data.success) {
          setMasterDeviceId(data.masterDeviceId);
          toast.success("已取得播放主控權！");
        } else {
          throw new Error('Failed to claim master device status');
        }
      } catch (error) {
        toast.error("取得播放主控權失敗。");
        return;
      }
    }

    isThrottledRef.current = true;
    setTimeout(() => { isThrottledRef.current = false; }, 500);

    if (hasPlaybackInitiatedRef.current) {
      await resumeTrack();
    } else {
      await playPlaylist(DEFAULT_PLAYLIST_ID);
      hasPlaybackInitiatedRef.current = true;
    }
  }, [isReady, masterDeviceId, resumeTrack, playPlaylist]);

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
    if (!isReady || !deviceIdRef.current || isThrottledRef.current) {
        toast.error('播放器尚未準備好');
        return;
    }
    
    // ✨ 權限檢查 - 增加動態檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      // 先檢查主控裝置是否仍然有效
      try {
        const res = await fetch('/api/spotify/master-device');
        const data = await res.json();
        
        if (!data.masterDeviceId) {
          // 主控裝置已過期，清除本地狀態
          setMasterDeviceId(null);
          // ✨ 根據是否為主控裝置顯示不同通知
          if (deviceIdRef.current === masterDeviceId) {
            toast.info("您的播放控制權已過期，其他裝置現在可以取得控制權。");
          } else {
            toast.info("主控裝置已過期，現在可以播放了！");
          }
        } else if (data.masterDeviceId !== deviceIdRef.current) {
          toast.error("目前由其他裝置控制中，無法播放。");
          return;
        } else {
          // 我們就是主控裝置，清除過期的本地狀態
          setMasterDeviceId(data.masterDeviceId);
        }
      } catch (error) {
        console.error('Failed to check master device status:', error);
        toast.error("檢查播放權限失敗，請稍後再試。");
        return;
      }
    }

    // 如果沒有主控裝置，此裝置將成為新的主控！
    if (!masterDeviceId) {
      try {
        const res = await fetch('/api/spotify/master-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: deviceIdRef.current }),
        });
        const data = await res.json();
        if (data.success) {
          setMasterDeviceId(data.masterDeviceId);
          toast.success("已取得播放主控權！");
        } else {
          throw new Error('Failed to claim master device status');
        }
      } catch (error) {
        toast.error("取得播放主控權失敗。");
        return;
      }
    }
    
    const currentQueue = get().queue;
    if (!currentQueue.length) {
        toast.error('播放清單為空，無法隨機播放');
        return;
    }
    
    isThrottledRef.current = true;
    setTimeout(() => { isThrottledRef.current = false; }, 1000); // 隨機播放需要更長時間
    
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
        toast.error(`隨機播放失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }, [isReady, masterDeviceId, get, setQueue, setTrack, setIsPlaying, playPlaylist]);
  
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

  // ✨ 移除樂觀更新，讓狀態完全由 player_state_changed 事件驅動，並加入權限檢查
  const playTrack = useCallback(async (track: TrackInfo, isInterrupt = false) => {
    if (!isReady || !deviceIdRef.current || isThrottledRef.current) {
      toast.error("Spotify 播放器尚未準備就緒。");
      return;
    }
    
    // ✨ 權限檢查 - 增加動態檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      // 先檢查主控裝置是否仍然有效
      try {
        const res = await fetch('/api/spotify/master-device');
        const data = await res.json();
        
        if (!data.masterDeviceId) {
          // 主控裝置已過期，清除本地狀態
          setMasterDeviceId(null);
          // ✨ 根據是否為主控裝置顯示不同通知
          if (deviceIdRef.current === masterDeviceId) {
            toast.info("您的播放控制權已過期，其他裝置現在可以取得控制權。");
          } else {
            toast.info("主控裝置已過期，現在可以播放了！");
          }
        } else if (data.masterDeviceId !== deviceIdRef.current) {
          toast.error("目前由其他裝置控制中，無法播放。");
          return;
        } else {
          // 我們就是主控裝置，清除過期的本地狀態
          setMasterDeviceId(data.masterDeviceId);
        }
      } catch (error) {
        console.error('Failed to check master device status:', error);
        toast.error("檢查播放權限失敗，請稍後再試。");
        return;
      }
    }

    // 如果沒有主控裝置，此裝置將成為新的主控！
    if (!masterDeviceId) {
      try {
        const res = await fetch('/api/spotify/master-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: deviceIdRef.current }),
        });
        const data = await res.json();
        if (data.success) {
          setMasterDeviceId(data.masterDeviceId);
          toast.success("已取得播放主控權！");
        } else {
          throw new Error('Failed to claim master device status');
        }
      } catch (error) {
        toast.error("取得播放主控權失敗。");
        return;
      }
    }
    
    isThrottledRef.current = true;
    setTimeout(() => { isThrottledRef.current = false; }, 500);
    
    const trackUri = `spotify:track:${track.trackId}`;

    try {
      if (isInterrupt) {
        // ✨ 新的插播邏輯 - 移除樂觀更新
        // 1. 在本地佇列中預先插入歌曲
        insertTrack(track);

        // 2. 呼叫後端 API，將歌曲新增至 Spotify 的遠端佇列
        const queueResponse = await fetch('/api/spotify/add-to-queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackUri }),
        });

        if (!queueResponse.ok) {
          throw new Error('新增歌曲至佇列失敗');
        }

        // 3. 呼叫「下一首」API，讓播放器跳到我們剛剛新增的歌曲
        // 這一系列操作會觸發 player_state_changed 事件，由該事件監聽器去更新 UI
        await fetch(`/api/spotify/next?deviceId=${deviceIdRef.current}`, { method: 'POST' });

      } else {
        // 對於非插播，維持原本的取代佇列邏輯
        await fetch(`/api/spotify/play?deviceId=${deviceIdRef.current}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uris: [trackUri] }),
        });
      }
      
      // 無論如何，都標記為已觸發過播放
      hasPlaybackInitiatedRef.current = true;

    } catch (error) {
      console.error('Failed to play track:', error);
      toast.error(`播放歌曲失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      // ✨ 注意：這裡也不再需要還原狀態，因為我們沒有樂觀更新
    }
  }, [isReady, masterDeviceId, insertTrack]); // ✨ 移除了 setTrack 和 setIsPlaying 的依賴

  // ✨ 建立通用的權限檢查函式
  const createControlledAction = useCallback(<T extends any[]>(action: (...args: T) => Promise<any>) => {
    return async (...args: T) => {
      if (!isControllable) {
        toast.info("目前由其他裝置控制中...");
        return;
      }
      await action(...args);
    };
  }, [isControllable]);

  // ✨ 修正：直接呼叫 player 實例的方法，並加入權限檢查
  const nextTrack = useCallback(async () => {
    if (!isReady || !playerRef.current || isThrottledRef.current) return;
    
    // ✨ 權限檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      toast.error("目前由其他裝置控制中，無法切換歌曲。");
      return;
    }
    
    isThrottledRef.current = true;
    setTimeout(() => { isThrottledRef.current = false; }, 500); // 500ms 內最多執行一次
    
    try {
      await playerRef.current.nextTrack();
    } catch (error) {
      console.error('Failed to call next track:', error);
    }
  }, [isReady, masterDeviceId]);

  // ✨ 修正：直接呼叫 player 實例的方法，並加入權限檢查
  const previousTrack = useCallback(async () => {
    if (!isReady || !playerRef.current || isThrottledRef.current) return;
    
    // ✨ 權限檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      toast.error("目前由其他裝置控制中，無法切換歌曲。");
      return;
    }
    
    isThrottledRef.current = true;
    setTimeout(() => { isThrottledRef.current = false; }, 500);
    
    try {
      await playerRef.current.previousTrack();
    } catch (error) {
      console.error('Failed to call previous track:', error);
    }
  }, [isReady, masterDeviceId]);

  // ✨ 修正：直接呼叫 player 實例的方法，並加入權限檢查
  const pauseTrack = useCallback(async () => {
    if (!isReady || !playerRef.current || isThrottledRef.current) return;
    
    // ✨ 權限檢查
    if (masterDeviceId && deviceIdRef.current !== masterDeviceId) {
      toast.error("目前由其他裝置控制中，無法暫停播放。");
      return;
    }
    
    isThrottledRef.current = true;
    setTimeout(() => { isThrottledRef.current = false; }, 300);
    
    try {
      await playerRef.current.pause();
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  }, [isReady, masterDeviceId]);

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

        // ✨ 精確的狀態同步 - 這是更新 UI 的唯一管道
        player.addListener('player_state_changed', (state) => {
            if (!state) {
                // 如果沒有狀態，可能代表播放器已關閉或沒有活躍裝置
                if (get().isPlaying) setIsPlaying(false);
                return;
            }

            const sdkTrack = state.track_window.current_track;
            const currentStoreTrack = get().currentTrack;

            // 當歌曲 ID 改變時，更新曲目資訊
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
            
            // 同步播放/暫停狀態
            if (state.paused === get().isPlaying) {
              setIsPlaying(!state.paused);
            }

            // 同步進度
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
      volume, progress, duration, resumeTrack,
      hasPlaybackInitiated: hasPlaybackInitiatedRef.current,
      isControllable, // ✨ 將可控制狀態傳遞給所有子元件
      expirationText, // ✨ 將動態過期時間傳遞給所有子元件
    }}>
      {children}
    </SpotifyContext.Provider>
  );
};