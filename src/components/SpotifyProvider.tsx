'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useMusicStore } from '@/store/music';
import { clientConfig } from '@/config/spotify';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { useMasterDevice } from '@/hooks/useMasterDevice';
import { usePlaybackControl } from '@/hooks/usePlaybackControl';
import { SpotifyContextProps } from '@/types/spotify';

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
  // Music store state
  const { 
    currentTrack, 
    isPlaying,
    progress,
    duration,
    volume,
  } = useMusicStore();

  // Initialize Spotify Player
  const { 
    player, 
    deviceId, 
    isReady, 
    loading 
  } = useSpotifyPlayer({ 
    defaultPlaylistId: DEFAULT_PLAYLIST_ID 
  });

  // Master Device Management
  const { 
    masterDeviceId,
    isControllable, 
    expirationText,
    claimMasterDevice,
    checkPermissions,
    createIdleResetAction 
  } = useMasterDevice({ 
    deviceId 
  });

  // ✨ Playback Control with Idle Reset
  const {
    playTrack,
    handlePlay,
    handlePlayRandom,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    handleSetVolume,
    seek,
  } = usePlaybackControl({
    player,
    deviceId,
    isReady,
    defaultPlaylistId: DEFAULT_PLAYLIST_ID,
    hasPermissions: checkPermissions,
    claimMasterDevice,
    createIdleResetAction,
  });

  // Context value
  const contextValue: SpotifyContextProps = {
    // Playback controls
    playTrack,
    handlePlay,
    handlePlayRandom,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    handleSetVolume,
    seek,
    
    // State
    loading,
    isReady,
    isPlaying,
    currentTrack,
    volume,
    progress,
    duration,
    hasPlaybackInitiated: !!currentTrack, // Simplified logic
    isControllable,
    expirationText,
  };

  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
};