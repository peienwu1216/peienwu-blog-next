'use client';
import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { useMusicStore, TrackInfo } from '@/store/music';

interface SpotifyContextProps {
  playTrack: (track: TrackInfo) => void;
  pauseTrack: () => void;
  fetchNowPlaying: () => Promise<void>;
  loading: boolean;
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
}

const SpotifyContext = createContext<SpotifyContextProps | undefined>(undefined);

export const useSpotify = () => {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be used within SpotifyProvider');
  return ctx;
};

interface SpotifyProviderProps {
  children: ReactNode;
}

export const SpotifyProvider = ({ children }: SpotifyProviderProps) => {
  const { isPlaying, currentTrack, play, pause, setTrack } = useMusicStore();
  const [loading, setLoading] = useState(false);

  // 取得目前 Spotify 正在播放的歌曲
  const fetchNowPlaying = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spotify/now-playing');
      const data = await res.json();
      if (data.isPlaying) {
        const track: TrackInfo = {
          title: data.title,
          artist: data.artist,
          album: data.album,
          albumImageUrl: data.albumImageUrl,
          songUrl: data.songUrl,
          trackId: data.trackId,
        };
        setTrack(track);
        play(track);
      } else {
        pause();
        setTrack(null);
      }
    } catch (e) {
      pause();
      setTrack(null);
    } finally {
      setLoading(false);
    }
  }, [play, pause, setTrack]);

  // 播放指定歌曲
  const playTrack = useCallback((track: TrackInfo) => {
    play(track);
    // 實際播放可串接 Web Playback SDK 或僅同步狀態
  }, [play]);

  // 暫停播放
  const pauseTrack = useCallback(() => {
    pause();
    // 實際暫停可串接 Web Playback SDK 或僅同步狀態
  }, [pause]);

  // 頁面初次載入時自動同步一次
  useEffect(() => {
    fetchNowPlaying();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SpotifyContext.Provider value={{ playTrack, pauseTrack, fetchNowPlaying, loading, isPlaying, currentTrack }}>
      {children}
    </SpotifyContext.Provider>
  );
}; 