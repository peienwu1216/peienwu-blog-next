'use client';
import React from 'react';
import { useSpotify } from '@/components/SpotifyProvider';

export default function NowPlayingCard() {
  const { currentTrack, isPlaying } = useSpotify();

  const handleClick = () => {
    // 藍圖的最終實現：模擬點擊 SearchButton 來觸發 ⌘+K。
    const searchButton = document.querySelector('header .flex.items-center.gap-2 button[aria-label="開啟指揮中心"]') as HTMLButtonElement | null;
    searchButton?.click();
  };

  return (
    <div
      className="rounded-xl bg-white/80 dark:bg-slate-800/80 shadow p-4 flex items-center gap-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition"
      onClick={handleClick}
      tabIndex={0}
      aria-label="點擊以開啟音樂控制中心"
    >
      {isPlaying && currentTrack ? (
        <>
          <img
            src={currentTrack.albumImageUrl}
            alt={currentTrack.album}
            className="w-14 h-14 rounded-lg object-cover shadow"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Code & Beats</div>
            <div className="font-bold truncate text-slate-900 dark:text-slate-100">{currentTrack.title}</div>
            <div className="text-sm truncate text-slate-600 dark:text-slate-300">{currentTrack.artist}</div>
          </div>
        </>
      ) : (
        <div className="flex-1 min-w-0 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Code & Beats</div>
          <div className="text-slate-700 dark:text-slate-200 text-sm">目前沒有播放音樂</div>
          <div className="text-xs text-slate-400 mt-1">點擊卡片，學習如何控制本站音樂</div>
        </div>
      )}
    </div>
  );
} 