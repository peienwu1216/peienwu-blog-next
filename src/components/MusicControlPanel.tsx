'use client';

import React from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader } from 'lucide-react';

export default function MusicControlPanel() {
  const {
    isPlaying,
    currentTrack,
    progress,
    duration,
    volume,
    loading,
    previousTrack,
    nextTrack,
    pauseTrack,
    playTrack,
    setVolume,
    seek,
  } = useSpotify();

  const formatTime = (seconds: number) => {
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Loader className="w-4 h-4 animate-spin" />
        <span>讀取音樂電台中...</span>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">
        暫無播放音樂。點擊文章中的 ▶️ 開始。
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-2 w-full">
      <img
        src={currentTrack.albumImageUrl || '/images/placeholder.png'}
        alt={currentTrack.album}
        width={56}
        height={56}
        className="w-14 h-14 rounded-md flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
          {currentTrack.title}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {currentTrack.artist}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-slate-400">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="group relative flex items-center">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 appearance-none cursor-pointer accent-sky-500"
              style={{
                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
        <button onClick={previousTrack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => (isPlaying ? pauseTrack() : playTrack(currentTrack))}
          className="p-3 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button onClick={nextTrack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}