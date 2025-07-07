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
        });

        await player.connect();
        playerRef.current = player;
        console.log('Spotify Player connected successfully.');
      } catch (error) {
        console.error('[Spotify SDK] Player initialization failed:', error);
      }
    };

    // Check for Spotify SDK availability
    const checkSpotifySDK = setInterval(() => {
      if (window.Spotify) {
        console.log('Spotify SDK has loaded.');
        clearInterval(checkSpotifySDK);
        initializePlayer();
      }
    }, 500);

    return () => clearInterval(checkSpotifySDK);
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