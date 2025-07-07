import { useState, useEffect, useCallback, useRef } from 'react';
import { useMusicStore } from '@/store/music';
import { spotifyApiService } from '@/services/spotifyApiService';
import { TrackInfo, SpotifyPlayerState } from '@/types/spotify';

interface UseSpotifyPlayerProps {
  defaultPlaylistId: string;
}

interface UseSpotifyPlayerReturn {
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  loading: boolean;
}

export function useSpotifyPlayer({ defaultPlaylistId }: UseSpotifyPlayerProps): UseSpotifyPlayerReturn {
  const { 
    setTrack, 
    setQueue, 
    setIsPlaying, 
    setIsReady, 
    setProgress, 
    setDuration 
  } = useMusicStore();
  
  const get = useMusicStore.getState;
  
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReadyState] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  const playerRef = useRef<Spotify.Player | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✨ 退場機制防抖：追蹤已經執行過退場的歌曲，避免重複觸發
  const exitExecutedTracksRef = useRef<Set<string>>(new Set());
  // ✨ 退場機制：獨立的檢查間隔
  const exitCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load default playlist
  const initializeDefaultPlaylist = useCallback(async () => {
    setLoading(true);
    try {
      const tracks = await spotifyApiService.getPlaylist(defaultPlaylistId);
      setQueue(tracks);
      
      if (tracks.length > 0) {
        const firstTrack = { ...tracks[0], duration: tracks[0].duration || 0 };
        setTrack(firstTrack);
        setDuration(firstTrack.duration);
      }
    } catch (error) {
      console.error("Failed to load default playlist", error);
    } finally {
      setLoading(false);
    }
  }, [defaultPlaylistId, setQueue, setTrack, setDuration]);

  // Sync playback state with Spotify API - 檢測本地設備實際播放狀態
  const syncPlaybackState = useCallback(async () => {
    try {
      // 檢查本地 Player 的實際狀態
      let localPlayerState = null;
      if (playerRef.current) {
        try {
          localPlayerState = await playerRef.current.getCurrentState();
        } catch (error) {
          console.warn('Failed to get local player state:', error);
        }
      }

      // 獲取 Spotify API 的全局播放狀態
      const apiData = await spotifyApiService.getNowPlaying();
      
      // 判斷本地設備是否正在播放音樂
      const isLocallyPlaying = localPlayerState && 
        !localPlayerState.paused && 
        localPlayerState.track_window?.current_track?.id;

      // 如果本地設備正在播放，更新狀態
      if (isLocallyPlaying && localPlayerState) {
        const sdkTrack = localPlayerState.track_window.current_track;
        const trackInfo: TrackInfo = spotifyApiService.createTrackInfo(sdkTrack, localPlayerState);
        
        // 只在歌曲變更時更新
        if (get().currentTrack?.trackId !== trackInfo.trackId) {
          setTrack(trackInfo);
        }
        
        setDuration(localPlayerState.duration / 1000);
        setProgress(localPlayerState.position / 1000);
        
        if (!get().isPlaying) {
          setIsPlaying(true);
        }
      } else {
        // 本地設備沒有播放，檢查是否有其他設備在播放
        if (apiData && apiData.isPlaying && apiData.item) {
          const track: TrackInfo = {
            title: apiData.item.name,
            artist: apiData.item.artists.map(a => a.name).join(', '),
            album: apiData.item.album.name,
            albumImageUrl: apiData.item.album.images[0]?.url || '/images/placeholder.png',
            songUrl: apiData.item.external_urls.spotify,
            trackId: apiData.item.id,
            duration: apiData.item.duration_ms / 1000,
          };
          
          // 只在歌曲變更時更新
          if (get().currentTrack?.trackId !== track.trackId) {
            setTrack(track);
          }
          
          setDuration(track.duration || 0);
          setProgress(apiData.progress_ms / 1000);
        }
        
        // 本地設備沒有播放，設置為暫停狀態
        if (get().isPlaying) {
          setIsPlaying(false);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        console.warn("Sync state failed due to auth error, will retry on next sync");
      } else {
        console.error("Sync state failed:", error);
      }
    }
  }, [setTrack, setDuration, setProgress, setIsPlaying, get]);

  // Initialize Spotify Player
  useEffect(() => {
    if (typeof window === 'undefined' || playerRef.current) return;

    const initializePlayer = async () => {
      try {
        console.log('Starting Spotify Player initialization...');
        
        const player = new window.Spotify.Player({
          name: "Peienwu's Code Lab",
          getOAuthToken: async (cb) => {
            console.log('Spotify SDK is requesting a new token...');
            try {
              const accessToken = await spotifyApiService.getAccessToken();
              console.log('New token received by SDK.');
              cb(accessToken);
            } catch (error) {
              console.error('Error in getOAuthToken callback:', error);
              cb('');
            }
          },
          volume: 0.5,
        });

        // Player event listeners
        player.addListener('ready', ({ device_id }) => {
          console.log('Spotify Player is ready with Device ID:', device_id);
          setDeviceId(device_id);
          setIsReadyState(true);
          setIsReady(true);
          initializeDefaultPlaylist();
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.warn('Device ID has gone offline:', device_id);
          setIsReadyState(false);
          setIsReady(false);
        });

        // Player state change handler
        (player as any).addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
          if (!state) {
            if (get().isPlaying) setIsPlaying(false);
            return;
          }

          const sdkTrack = state.track_window.current_track;
          const currentStoreTrack = get().currentTrack;

          // Update track info when song changes
          if (sdkTrack.id && sdkTrack.id !== currentStoreTrack?.trackId) {
            const trackInfo: TrackInfo = spotifyApiService.createTrackInfo(sdkTrack, state);
            setTrack(trackInfo);
            setDuration(state.duration / 1000);
          }
          
          // Sync play/pause state
          if (state.paused === get().isPlaying) {
            setIsPlaying(!state.paused);
          }

          // Sync progress
          setProgress(state.position / 1000);

          // ✨ 退場機制：檢測歌曲即將結束，如果沒有活躍DJ則自動暫停
          const checkForAutoExit = async () => {
            const duration = state.duration / 1000;
            const position = state.position / 1000;
            const remainingTime = duration - position;
            const trackId = sdkTrack.id;
            
            // 當歌曲剩餘時間少於5秒且正在播放時觸發檢查
            if (remainingTime <= 5 && !state.paused && duration > 30 && trackId) {
              // ✨ 防抖檢查：避免對同一首歌重複執行退場機制
              if (exitExecutedTracksRef.current.has(trackId)) {
                return;
              }
              
              try {
                // 檢查是否有活躍的DJ
                const response = await fetch('/api/spotify/master-device');
                const masterDeviceData = await response.json();
                
                // 如果沒有活躍的DJ（沒有djStatus），則暫停播放
                if (!masterDeviceData.djStatus) {
                  console.log('🛑 沒有活躍的DJ，歌曲即將結束，執行退場機制暫停播放');
                  
                  // 標記這首歌已經執行過退場機制
                  exitExecutedTracksRef.current.add(trackId);
                  
                  // 暫停播放以避免自動播放下一首
                  try {
                    await player.pause();
                    
                    // 顯示友好的通知
                    const { notifyHtml } = await import('@/lib/notify');
                    notifyHtml(
                      '🎭 DJ電台已空，音樂將暫停以節流',
                      { duration: 5000 }
                    );
                  } catch (pauseError) {
                    console.warn('退場機制暫停播放失敗:', pauseError);
                  }
                }
              } catch (error) {
                console.warn('退場機制檢查DJ狀態失敗:', error);
              }
            }
          };

          // ✨ 清理機制：當切換到新歌曲時，清理舊歌曲的退場記錄
          if (sdkTrack.id && sdkTrack.id !== currentStoreTrack?.trackId) {
            // 保留當前歌曲的記錄，清理其他歌曲的記錄以避免記憶體洩漏
            const currentTrackId = sdkTrack.id;
            const newExecutedTracks = new Set<string>();
            if (exitExecutedTracksRef.current.has(currentTrackId)) {
              newExecutedTracks.add(currentTrackId);
            }
            exitExecutedTracksRef.current = newExecutedTracks;
          }

          // 執行退場檢查
          checkForAutoExit();
        });

        await player.connect();
        playerRef.current = player;
        console.log('Spotify Player connected successfully.');
      } catch (error) {
        console.error('[Spotify SDK] Player initialization failed:', error);
      }
    };

    // ✨ 獨立的退場機制檢查：每2秒檢查一次，不依賴播放狀態變化
    const startExitCheckInterval = () => {
      if (exitCheckIntervalRef.current) {
        clearInterval(exitCheckIntervalRef.current);
      }
      
      exitCheckIntervalRef.current = setInterval(async () => {
        const currentState = get();
        
        // 只在播放中且有歌曲時檢查
        if (!currentState.isPlaying || !currentState.currentTrack || !playerRef.current) {
          return;
        }
        
        try {
          const playerState = await playerRef.current.getCurrentState();
          if (!playerState || playerState.paused) return;
          
          const duration = playerState.duration / 1000;
          const position = playerState.position / 1000;
          const remainingTime = duration - position;
          const trackId = playerState.track_window.current_track.id;
          
          // 檢查是否需要執行退場機制
          if (remainingTime <= 3 && duration > 30 && trackId) {
            if (exitExecutedTracksRef.current.has(trackId)) {
              return;
            }
            
            // 檢查DJ狀態
            const response = await fetch('/api/spotify/master-device');
            const masterDeviceData = await response.json();
            
            if (!masterDeviceData.djStatus) {
              console.log('🛑 [獨立檢查] 沒有活躍的DJ，歌曲即將結束，執行退場機制');
              
              exitExecutedTracksRef.current.add(trackId);
              
              await playerRef.current.pause();
              
              const { notifyHtml } = await import('@/lib/notify');
              notifyHtml(
                '🎭 DJ電台已空，音樂將暫停以節流',
                { duration: 5000 }
              );
            }
          }
        } catch (error) {
          console.warn('獨立退場檢查失敗:', error);
        }
      }, 2000); // 每2秒檢查一次
    };

    // Check for Spotify SDK availability
    const checkSpotifySDK = setInterval(() => {
      if (window.Spotify) {
        console.log('Spotify SDK has loaded.');
        clearInterval(checkSpotifySDK);
        initializePlayer();
        startExitCheckInterval(); // 啟動獨立檢查
      }
    }, 500);

    return () => {
      clearInterval(checkSpotifySDK);
      // ✨ 清理退場記錄和檢查間隔
      exitExecutedTracksRef.current.clear();
      if (exitCheckIntervalRef.current) {
        clearInterval(exitCheckIntervalRef.current);
      }
    };
  }, [initializeDefaultPlaylist, get, setIsPlaying, setTrack, setDuration, setProgress, setIsReady]);

  // Progress tracking
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (get().isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress(get().progress + 1);
      }, 1000);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [get().isPlaying, setProgress, get]);

  // Background sync - 檢測本地播放狀態變化，平衡響應速度與服務器負擔
  useEffect(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // 3 秒同步間隔：在即時事件失效時能快速響應，但不會過度頻繁
    syncIntervalRef.current = setInterval(syncPlaybackState, 3000);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncPlaybackState]);

  return {
    player: playerRef.current,
    deviceId,
    isReady,
    loading,
  };
} 