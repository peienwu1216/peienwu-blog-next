'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, Loader2 } from 'lucide-react';

// 1. 全新的 SVG 動態頻譜圖示元件
const SpectrumIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex w-6 h-6 items-center justify-center">
    <div className="flex h-4 w-4 items-end justify-between">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className="w-[3px] h-full rounded-full bg-current"
          style={{
            animation: isPlaying
              ? `equalize 1.25s infinite ease-in-out ${i * 0.2}s`
              : 'none',
          }}
        />
      ))}
    </div>
  </div>
);

interface AnthemCardProps {
  className?: string;
}

export default function AnthemCard({ className = '' }: AnthemCardProps) {
  // 2. 狀態管理簡化
  const { 
    handlePlay, 
    pauseTrack, 
    isPlaying: isAnthemPlaying, 
    currentTrack, 
    progress: spotifyProgress, 
    duration: spotifyDuration,
    isReady
  } = useSpotify();
  
  const [isLoading, setIsLoading] = useState(false);
  const ANTHEM_TRACK_ID = "6gU9OKjOE7ghfxe5F75T7s"; // Avicii - The Nights

  // 判斷當前播放的是否正是這首主題曲
  const isCurrentlyPlayingThisAnthem = useMemo(() => {
    return isAnthemPlaying && currentTrack?.trackId === ANTHEM_TRACK_ID;
  }, [isAnthemPlaying, currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = async () => {
    setIsLoading(true);
    try {
      if (isCurrentlyPlayingThisAnthem) {
        await pauseTrack();
      } else {
        await handlePlay(); 
      }
    } catch (error) {
      console.error('播放失敗:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };
  
  // 3. 播放中狀態 UI 全面升級
  if (isCurrentlyPlayingThisAnthem) {
    return (
      <div className={`rounded-xl p-4 shadow-lg backdrop-blur-md bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-300 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <SpectrumIcon isPlaying={true} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                The Nights
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Avicii</p>
            </div>
          </div>
          <button
            onClick={handlePlayClick}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white transition hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-3">
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded-full transition-all duration-1000 linear"
              style={{ width: `${spotifyDuration > 0 ? (spotifyProgress / spotifyDuration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{formatTime(spotifyProgress)}</span>
            <span>{formatTime(spotifyDuration)}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. 初始狀態 UI 全面升級
  return (
    <div className={`group rounded-xl p-6 shadow-lg backdrop-blur-md bg-white/50 hover:bg-white/70 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-300 ${className}`}>
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-105">
                <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V4a1 1 0 00-.804-.98zM5 19a2.369 2.369 0 01-2-2.25 2.369 2.369 0 012-2.25c1.076 0 2 .874 2 2.25A2.369 2.369 0 015 19zm10-2a2.369 2.369 0 01-2-2.25A2.369 2.369 0 0115 12.5c1.076 0 2 .874 2 2.25A2.369 2.369 0 0115 17z"/>
                </svg>
            </div>
            <div className="flex-1">
                <blockquote className="text-slate-600 dark:text-slate-300 italic text-base leading-relaxed border-l-2 border-slate-300 dark:border-slate-600 pl-4">
                    "He said, one day you'll leave this world behind, so live a life you will remember."
                </blockquote>
                <div className="text-right text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    — Avicii, The Nights
                </div>
            </div>
        </div>
        <div className="mt-5 text-center">
            <button
                onClick={handlePlayClick}
                disabled={!isReady || isLoading}
                className="inline-flex items-center gap-2 px-8 py-2.5 bg-slate-800 hover:bg-slate-950 disabled:bg-slate-400 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed group-hover:bg-sky-600 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white dark:disabled:bg-slate-600"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Play className="w-5 h-5" />
                )}
                <span>播放主題曲</span>
            </button>
        </div>
    </div>
  );
} 