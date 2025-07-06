'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, Loader2, Music4 } from 'lucide-react';
import { toast } from 'sonner';

// 頻譜動畫元件（與文章音樂播放一致）
const SpectrumIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" className="block" aria-hidden>
    {[0, 1, 2, 3].map((i) => (
      <rect
        key={i}
        x={i * 8 + 2}
        y={4}
        width={4}
        height={12}
        rx={2}
        className="fill-sky-500/80 dark:fill-sky-400/80"
        style={{
          animation: isPlaying ? `equalize 1.2s infinite ease-in-out ${i * 0.18}s` : 'none',
        }}
      />
    ))}
  </svg>
);

// 標準作法：引導使用者啟動播放器的提示元件
const ActivationToast = () => (
  <div className="flex items-center gap-3 p-2">
    <Music4 className="h-5 w-5 text-sky-500" />
    <div>
      <div className="font-bold">請先啟動音樂播放器</div>
      <div className="text-xs text-slate-500">按下 <kbd className="rounded border px-1">⌘+K</kbd> 並點擊音樂面板的播放鍵，即可啟用。</div>
    </div>
  </div>
);

const ANTHEM_TRACK: import('@/store/music').TrackInfo = {
  trackId: '19GqnCuVdOlSPHp6rHdYR2',
  title: 'The Nights',
  artist: 'Avicii',
  album: 'The Days / Nights',
  albumImageUrl: '/images/anthem-cover.jpg',
  songUrl: 'https://open.spotify.com/track/19GqnCuVdOlSPHp6rHdYR2',
  duration: 234,
};

export default function AnthemCard({ className = '' }: { className?: string }) {
  const {
    playTrack,
    pauseTrack,
    resumeTrack,
    isPlaying,
    currentTrack,
    progress,
    duration,
    isReady,
    hasPlaybackInitiated,
    isControllable,
    expirationText,
  } = useSpotify();
  const [isLoading, setIsLoading] = useState(false);

  // 是否正在播放主題曲
  const isThisTrackPlaying = isPlaying && currentTrack?.trackId === ANTHEM_TRACK.trackId;
  const isThisTrackPaused = !isPlaying && currentTrack?.trackId === ANTHEM_TRACK.trackId;

  // 插播主題曲 - 按照文章音樂播放的邏輯
  const handlePlayClick = useCallback(async () => {
    // 冷啟動檢查
    if (!isReady || !hasPlaybackInitiated) {
      toast.custom(() => <ActivationToast />, {
        duration: 6000,
        position: 'bottom-right',
      });
      return;
    }

    // 權限檢查 - 友善的提示
    if (!isControllable) {
      toast.info(
        `🎵 目前由其他訪客控制播放中\n\n您可以等待 ${expirationText} 後重新取得控制權，或等待當前播放結束。`,
        {
          duration: 5000,
          position: 'bottom-right',
        }
      );
      return;
    }

    setIsLoading(true);
    try {
      if (isThisTrackPlaying) {
        await pauseTrack();
      } else if (isThisTrackPaused) {
        await resumeTrack();
      } else {
        await playTrack(ANTHEM_TRACK, true); // 插播
      }
    } catch (error) {
      console.error('Failed to play anthem track:', error);
      toast.error(`播放失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  }, [
    isReady,
    hasPlaybackInitiated,
    isControllable,
    isThisTrackPlaying,
    isThisTrackPaused,
    playTrack,
    pauseTrack,
    resumeTrack,
    expirationText,
  ]);

  // loading 狀態自動歸零
  useEffect(() => {
    if (!isThisTrackPlaying && isLoading) setIsLoading(false);
  }, [isThisTrackPlaying, isLoading]);

  // 進度顯示
  const showProgress = isThisTrackPlaying || isThisTrackPaused;
  const cardProgress = showProgress ? progress : 0;
  const cardDuration = showProgress ? duration : ANTHEM_TRACK.duration || 0;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(Math.floor(s % 60)).toString().padStart(2, '0')}`;

  return (
    <div className={`relative rounded-2xl p-5 shadow-2xl border border-white/30 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg transition-all duration-300 max-w-[350px] ${className}`}> 
      <div className="flex items-center gap-4">
        {/* 專輯封面 */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <img
            src={ANTHEM_TRACK.albumImageUrl}
            alt={ANTHEM_TRACK.album}
            className="w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-white/60 dark:border-slate-800/60"
            draggable={false}
          />
          {/* 頻譜動畫 */}
          {isThisTrackPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <SpectrumIcon isPlaying={true} />
            </div>
          )}
        </div>
        {/* 歌曲資訊 */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-slate-900 dark:text-white truncate">{ANTHEM_TRACK.title}</div>
          <div className="text-slate-500 dark:text-slate-300 text-sm truncate">{ANTHEM_TRACK.artist}</div>
          <div className="italic text-slate-600 dark:text-slate-400 text-xs mt-1 truncate">"He said, one day you'll leave this world behind, so live a life you will remember."</div>
        </div>
        {/* 控制按鈕 */}
        <button
          onClick={handlePlayClick}
          disabled={isLoading || !isControllable}
          className={`ml-2 flex items-center justify-center w-11 h-11 rounded-full shadow-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed ${isThisTrackPlaying ? 'ring-2 ring-sky-400/40' : ''}`}
          aria-label={
            !isControllable 
              ? '目前由其他訪客控制中，無法播放' 
              : isThisTrackPlaying 
                ? '暫停播放' 
                : '播放主題曲'
          }
          title={!isControllable ? '目前由其他訪客控制中' : undefined}
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isThisTrackPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
      </div>
      {/* 進度條 */}
      <div className="mt-5">
        <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${cardDuration > 0 ? (cardProgress / cardDuration) * 100 : 0}%` }}
          />
          {/* 動態光點 */}
          {cardDuration > 0 && (
            <div
              className="absolute top-0 h-2 w-2 bg-white/80 rounded-full shadow-lg transition-all duration-500"
              style={{ left: `calc(${cardDuration > 0 ? (cardProgress / cardDuration) * 100 : 0}% - 0.5rem)` }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>{formatTime(cardProgress)}</span>
          <span>{formatTime(cardDuration)}</span>
        </div>
      </div>
    </div>
  );
} 