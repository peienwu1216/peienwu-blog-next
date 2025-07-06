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

  // Sync playback state with Spotify API
  const syncPlaybackState = useCallback(async () => {
    // Don't sync if local player is playing
    if (playerRef.current && (await playerRef.current.getCurrentState())?.paused === false) {
      return;
    }

    try {
      const data = await spotifyApiService.getNowPlaying();
      
      if (data && data.isPlaying && data.item) {
        const track: TrackInfo = {
          title: data.item.name,
          artist: data.item.artists.map(a => a.name).join(', '),
          album: data.item.album.name,
          albumImageUrl: data.item.album.images[0]?.url || '/images/placeholder.png',
          songUrl: data.item.external_urls.spotify,
          trackId: data.item.id,
          duration: data.item.duration_ms / 1000,
        };
        
        // Only update if track changed
        if (get().currentTrack?.trackId !== track.trackId) {
          setTrack(track);
        }
        
        setDuration(track.duration || 0);
        setProgress(data.progress_ms / 1000);
        
        if (!get().isPlaying) {
          setIsPlaying(true);
        }
      } else {
        if (get().isPlaying) {
          setIsPlaying(false);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        // Handle auth errors silently
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

  // Background sync
  useEffect(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(syncPlaybackState, 5000);
    
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