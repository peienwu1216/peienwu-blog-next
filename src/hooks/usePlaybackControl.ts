import { useCallback, useRef } from 'react';
import { useMusicStore } from '@/store/music';
import { spotifyApiService } from '@/services/spotifyApiService';
import { showHtmlToast } from '@/lib/notify';
import { shuffleArray } from '@/lib/utils';
import { TrackInfo } from '@/types/spotify';

interface UsePlaybackControlProps {
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
  defaultPlaylistId: string;
  hasPermissions: () => Promise<boolean>;
  claimMasterDevice: () => Promise<boolean>;
  createIdleResetAction: <T extends any[]>(
    action: (...args: T) => Promise<void>,
    actionName?: string
  ) => (...args: T) => Promise<void>;
}

interface UsePlaybackControlReturn {
  playTrack: (track: TrackInfo, isInterrupt?: boolean) => Promise<void>;
  handlePlay: () => Promise<void>;
  handlePlayRandom: () => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  handleSetVolume: (volume: number) => Promise<void>;
  seek: (position: number) => Promise<void>;
}

export function usePlaybackControl({
  player,
  deviceId,
  isReady,
  defaultPlaylistId,
  hasPermissions,
  claimMasterDevice,
  createIdleResetAction,
}: UsePlaybackControlProps): UsePlaybackControlReturn {
  
  const { 
    setTrack, 
    setQueue, 
    insertTrack, 
    setIsPlaying, 
    setProgress, 
    setVolume: setVolumeState 
  } = useMusicStore();
  
  const get = useMusicStore.getState;
  
  // Throttling control
  const isThrottledRef = useRef(false);
  const hasPlaybackInitiatedRef = useRef(false);

  // Create throttled action wrapper
  const createThrottledAction = useCallback(<T extends any[]>(
    action: (...args: T) => Promise<void>,
    delay: number = 500
  ) => {
    return async (...args: T) => {
      if (isThrottledRef.current) return;
      
      isThrottledRef.current = true;
      setTimeout(() => { isThrottledRef.current = false; }, delay);
      
      await action(...args);
    };
  }, []);

  // Permission-checked action wrapper with enhanced error handling
  const createPermissionCheckedAction = useCallback(<T extends any[]>(
    action: (...args: T) => Promise<void>,
    errorMessage: string = "目前由其他裝置控制中，無法執行操作。"
  ) => {
    return async (...args: T) => {
      if (!isReady || !deviceId) {
        showHtmlToast('播放器尚未準備好', { type: 'error' });
        return;
      }

      try {
        const hasPermission = await hasPermissions();
        if (!hasPermission) {
          showHtmlToast(errorMessage, { type: 'error' });
          return;
        }

        await action(...args);
      } catch (error) {
        console.error('Action failed:', error);
        
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes('Authentication expired') || error.message.includes('401')) {
            showHtmlToast('Spotify 認證已過期，請重新整理頁面', { type: 'error' });
          } else if (error.message.includes('Premium required')) {
            showHtmlToast('此功能需要 Spotify Premium 會員', { type: 'error' });
          } else if (error.message.includes('No active device')) {
            showHtmlToast('找不到活躍的播放裝置', { type: 'error' });
          } else {
            showHtmlToast(`操作失敗: ${error.message}`, { type: 'error' });
          }
        } else {
          showHtmlToast('操作失敗，請稍後再試', { type: 'error' });
        }
      }
    };
  }, [isReady, deviceId, hasPermissions]);

  // Play playlist with optional track URIs
  const playPlaylist = useCallback(async (playlistId: string, options: { uris?: string[] } = {}) => {
    if (!deviceId) return;
    
    try {
      await spotifyApiService.playPlaylist(deviceId, playlistId, options);
    } catch (error) {
      console.error('Failed to play playlist:', error);
      showHtmlToast('播放清單失敗', { type: 'error' });
    }
  }, [deviceId]);

  // ✨ Resume playback - 帶有閒置重置制
  const resumeTrack = useCallback(createIdleResetAction(async () => {
    if (!player) return;
    
    try {
      await player.resume();
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  }, 'Resume Playback'), [player, createIdleResetAction]);

  // Enhanced master device claiming with retry and smart checking
  const claimMasterDeviceWithRetry = useCallback(async (maxRetries = 2): Promise<boolean> => {
    // First, check if we're already the master device
    const { isMaster } = useMusicStore.getState();
    if (isMaster) {
      console.log('Already master device, no need to claim');
      return true;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const hasClaimed = await claimMasterDevice();
        if (hasClaimed) return true;
        
        // If claiming failed but not due to error, don't retry
        return false;
      } catch (error) {
        console.warn(`Master device claim attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries - 1) {
          // Last attempt, show error
          showHtmlToast('取得播放主控權失敗，請稍後再試', { type: 'error' });
          return false;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return false;
  }, [claimMasterDevice]);

  // ✨ Main play function - 帶有閒置重置制
  const handlePlay = useCallback(createPermissionCheckedAction(createIdleResetAction(async () => {
    // Try to claim master device if no master exists
    const hasClaimed = await claimMasterDeviceWithRetry();
    if (!hasClaimed) return;

    if (hasPlaybackInitiatedRef.current) {
      // 注意：這裡不再調用 resumeTrack，因為它已經有自己的 TTL 重置
      // 直接調用原始的 resume 邏輯
      if (!player) return;
      try {
        await player.resume();
      } catch (error) {
        console.error('Failed to resume playback:', error);
      }
    } else {
      await playPlaylist(defaultPlaylistId);
      hasPlaybackInitiatedRef.current = true;
    }
  }, 'Start Playback'), "目前由其他裝置控制中，無法播放。"), [claimMasterDeviceWithRetry, player, playPlaylist, defaultPlaylistId, createIdleResetAction]);

  // ✨ Play specific track - 帶有閒置重置制
  const playTrack = useCallback(createPermissionCheckedAction(createIdleResetAction(async (track: TrackInfo, isInterrupt = false) => {
    // Try to claim master device if no master exists
    const hasClaimed = await claimMasterDeviceWithRetry();
    if (!hasClaimed) return;

    const trackUri = spotifyApiService.createTrackUri(track.trackId);

    if (isInterrupt) {
      // Add to queue and skip to it
      insertTrack(track);
      await spotifyApiService.addToQueue(trackUri);
      await spotifyApiService.nextTrack(deviceId!);
    } else {
      // Replace current playback
      await spotifyApiService.playTrackUris(deviceId!, [trackUri]);
    }
    
    hasPlaybackInitiatedRef.current = true;
  }, 'Track Playback'), "目前由其他裝置控制中，無法播放。"), [claimMasterDeviceWithRetry, insertTrack, deviceId, createIdleResetAction]);

  // ✨ Random playback - 帶有閒置重置制
  const handlePlayRandom = useCallback(createPermissionCheckedAction(createIdleResetAction(async () => {
    // Try to claim master device if no master exists
    const hasClaimed = await claimMasterDeviceWithRetry();
    if (!hasClaimed) return;

    const currentQueue = get().queue;
    if (!currentQueue.length) {
      showHtmlToast('播放清單為空，無法隨機播放', { type: 'error' });
      return;
    }
    
    const shuffledQueue = shuffleArray(currentQueue);
    const trackUris = shuffledQueue.map(track => spotifyApiService.createTrackUri(track.trackId));
    
    await playPlaylist(defaultPlaylistId, { uris: trackUris });
    setQueue(shuffledQueue);
    setTrack(shuffledQueue[0]);
    setIsPlaying(true);
    hasPlaybackInitiatedRef.current = true;
    
    showHtmlToast("已開始隨機播放！");
  }, 'Random Playback'), "目前由其他裝置控制中，無法播放。"), [claimMasterDeviceWithRetry, get, setQueue, setTrack, setIsPlaying, playPlaylist, defaultPlaylistId, createIdleResetAction]);

  // ✨ Pause playback - 帶有閒置重置制
  const pauseTrack = useCallback(createThrottledAction(createPermissionCheckedAction(createIdleResetAction(async () => {
    if (!player) return;
    
    try {
      await player.pause();
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  }, 'Pause Playback'), "目前由其他裝置控制中，無法暫停播放。"), 300), [player, createPermissionCheckedAction, createIdleResetAction]);

  // ✨ Enhanced Next track with intelligent fallback - 帶有閒置重置制
  const nextTrack = useCallback(createThrottledAction(createPermissionCheckedAction(createIdleResetAction(async () => {
    if (!player) return;
    
    try {
      // ✨ 智能檢測：先嘗試正常的下一首
      await player.nextTrack();
      
      // 等待一下讓 Spotify 處理
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 檢查播放狀態：如果沒有開始播放下一首，說明佇列可能為空
      const playerState = await player.getCurrentState();
      
      if (!playerState || playerState.paused) {
        console.log('🎵 檢測到佇列可能為空，啟動智能音樂續播...');
        
        // ✨ 策略 1：嘗試重新洗牌當前播放清單
        const currentQueue = get().queue;
        if (currentQueue.length > 1) {
          console.log('🔀 重新洗牌當前播放清單');
          
          const shuffledQueue = shuffleArray(currentQueue);
          const trackUris = shuffledQueue.map(track => spotifyApiService.createTrackUri(track.trackId));
          
          // 播放洗牌後的清單
          await playPlaylist(defaultPlaylistId, { uris: trackUris });
          setQueue(shuffledQueue);
          setTrack(shuffledQueue[0]);
          setIsPlaying(true);
          
          showHtmlToast("🎲 佇列已空，自動洗牌重新播放！", { type: 'success' });
          return;
        }
        
        // ✨ 策略 2：加載並播放預設播放清單
        try {
          console.log('📻 加載預設播放清單');
          
          const defaultTracks = await spotifyApiService.getPlaylist(defaultPlaylistId);
          if (defaultTracks.length > 0) {
            const shuffledTracks = shuffleArray(defaultTracks);
            const trackUris = shuffledTracks.map(track => spotifyApiService.createTrackUri(track.trackId));
            
            await playPlaylist(defaultPlaylistId, { uris: trackUris });
            setQueue(shuffledTracks);
            setTrack(shuffledTracks[0]);
            setIsPlaying(true);
            
            showHtmlToast("🎵 自動載入音樂清單，繼續您的音樂之旅！", { type: 'success' });
            return;
          }
        } catch (playlistError) {
          console.warn('載入預設播放清單失敗:', playlistError);
        }
        
        // ✨ 策略 3：如果所有策略都失敗，暫停並友善提示
        showHtmlToast("🎭 音樂庫已空，請手動選擇歌曲繼續播放", { type: 'warning' });
      }
    } catch (error) {
      console.error('Failed to go to next track:', error);
      
      // ✨ 錯誤處理：如果是因為沒有下一首的錯誤，也嘗試智能續播
      if (error instanceof Error && (
        error.message.includes('No active device') ||
        error.message.includes('Player command failed') ||
        error.message.includes('The access token expired')
      )) {
        console.log('🔄 nextTrack 失敗，可能是佇列問題，嘗試智能續播...');
        
        // 重複上面的智能續播邏輯
        const currentQueue = get().queue;
        if (currentQueue.length > 1) {
          try {
            const shuffledQueue = shuffleArray(currentQueue);
            const trackUris = shuffledQueue.map(track => spotifyApiService.createTrackUri(track.trackId));
            
            await playPlaylist(defaultPlaylistId, { uris: trackUris });
            setQueue(shuffledQueue);
            setTrack(shuffledQueue[0]);
            setIsPlaying(true);
            
            showHtmlToast("🎲 自動重啟音樂播放！", { type: 'success' });
            return;
          } catch (fallbackError) {
            console.warn('智能續播也失敗了:', fallbackError);
          }
        }
        
        showHtmlToast("⚠️ 無法切換到下一首，請檢查播放狀態", { type: 'error' });
      } else {
        showHtmlToast("⚠️ 切換歌曲失敗，請稍後再試", { type: 'error' });
      }
    }
  }, 'Next Track'), "目前由其他裝置控制中，無法切換歌曲。")), [player, createPermissionCheckedAction, createIdleResetAction, get, shuffleArray, playPlaylist, defaultPlaylistId, setQueue, setTrack, setIsPlaying]);

  // ✨ Previous track - 帶有閒置重置制
  const previousTrack = useCallback(createThrottledAction(createPermissionCheckedAction(createIdleResetAction(async () => {
    if (!player) return;
    
    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Failed to go to previous track:', error);
    }
  }, 'Previous Track'), "目前由其他裝置控制中，無法切換歌曲。")), [player, createPermissionCheckedAction, createIdleResetAction]);

  // ✨ Volume control - 帶有閒置重置制
  const handleSetVolume = useCallback(createIdleResetAction(async (newVolume: number) => {
    if (!player) return;
    
    try {
      await player.setVolume(newVolume);
      setVolumeState(newVolume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, 'Volume Control'), [player, setVolumeState, createIdleResetAction]);

  // ✨ Seek position - 帶有閒置重置制
  const seek = useCallback(createIdleResetAction(async (newPosition: number) => {
    if (!player) return;
    
    try {
      await player.seek(newPosition * 1000);
      setProgress(newPosition);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, 'Seek Position'), [player, setProgress, createIdleResetAction]);

  return {
    playTrack: createThrottledAction(playTrack),
    handlePlay: createThrottledAction(handlePlay),
    handlePlayRandom: createThrottledAction(handlePlayRandom, 1000),
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    handleSetVolume,
    seek,
  };
} 