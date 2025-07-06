'use client';

import React from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader } from 'lucide-react';

export default function MusicControlPanel() {
  const {
    isPlaying,
    currentTrack,
    volume,
    progress,
    duration,
    pauseTrack,
    handlePlay,
    nextTrack,
    previousTrack,
    handleSetVolume,
    seek,
  } = useSpotify();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center p-4 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin"></div>
          <span className="text-sm">載入中...</span>
        </div>
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
              onChange={(e) => handleSetVolume(Number(e.target.value))}
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
          onClick={() => (isPlaying ? pauseTrack() : handlePlay())}
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