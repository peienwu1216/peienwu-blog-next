'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSpotify } from './SpotifyProvider';
import { useMusicStore } from '@/store/music';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader, Shuffle, Crown, Lock } from 'lucide-react';

export default function MusicControlPanel() {
  // 記住靜音前的音量
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const volumeRef = useRef(0.5);
  // 音量滑桿顯示狀態
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 處理中狀態
  const [isTakingControl, setIsTakingControl] = useState(false);

  // 清理 timeout 避免記憶體洩漏
  useEffect(() => {
    return () => {
      if (volumeSliderTimeoutRef.current) {
        clearTimeout(volumeSliderTimeoutRef.current);
      }
    };
  }, []);
  const {
    isPlaying,
    currentTrack,
    volume,
    progress,
    duration,
    pauseTrack,
    handlePlay,
    handlePlayRandom,
    nextTrack,
    previousTrack,
    handleSetVolume,
    seek,
    isControllable,
  } = useSpotify();
  const { isMaster, isLocked, countdown } = useMusicStore();

  // 同步 volumeRef 與當前音量
  React.useEffect(() => {
    if (volume > 0) {
      volumeRef.current = volume;
    }
  }, [volume]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 處理取得控制權
  const handleTakeControl = async () => {
    setIsTakingControl(true); // 立刻顯示處理中狀態
    try {
      await handlePlay(); // 使用現有的 handlePlay 函數
    } catch (error) {
      console.error('取得控制權失敗:', error);
    }
    // 不需要手動設回 false，因為狀態會自動更新
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

  // 狀態 C: 無人主控，可以搶佔
  if (!isMaster && !isLocked) {
    return (
      <div className="flex items-center gap-4 p-2 w-full">
        <img
          src={currentTrack.albumImageUrl || '/images/placeholder.png'}
          alt={currentTrack.album}
          width={56}
          height={56}
          className="w-14 h-14 rounded-md flex-shrink-0 shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {currentTrack.title}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {currentTrack.artist}
          </div>
          {/* 桌面版：顯示進度條 */}
          <div className="hidden md:flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <span className="text-xs text-slate-400">{formatTime(duration)}</span>
          </div>
          {/* 行動版：只顯示時間 */}
          <div className="md:hidden mt-1">
            <span className="text-xs text-slate-400">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sky-600 text-xs font-bold flex items-center gap-1">
              <span role="img" aria-label="party">🎧</span> 派對進行中...
            </span>
          </div>
          <button
            onClick={handleTakeControl}
            disabled={isTakingControl}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed text-white rounded-full font-semibold text-sm shadow transition"
          >
            {isTakingControl ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin w-4 h-4 mr-1" />
                正在取得主控權...
              </span>
            ) : (
              <>
                <Play className="inline-block w-4 h-4 mr-1" /> 成為派對DJ
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 狀態 B: 他人主控，被鎖定
  if (isLocked) {
    return (
      <div className="flex items-center gap-4 p-2 w-full">
        <img
          src={currentTrack.albumImageUrl || '/images/placeholder.png'}
          alt={currentTrack.album}
          width={56}
          height={56}
          className="w-14 h-14 rounded-md flex-shrink-0 shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {currentTrack.title}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {currentTrack.artist}
          </div>
          {/* 桌面版：顯示進度條 */}
          <div className="hidden md:flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
              disabled
            />
            <span className="text-xs text-slate-400">{formatTime(duration)}</span>
          </div>
          {/* 行動版：只顯示時間 */}
          <div className="md:hidden mt-1">
            <span className="text-xs text-slate-400">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-amber-600 text-xs font-bold">派對進行中...</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-slate-500 dark:text-slate-400 text-xs">
            {countdown > 0 && (
              <span className="text-amber-600 font-bold">({countdown} 秒後可接管)</span>
            )}
            <span>由其他裝置控制中</span>
          </div>
        </div>
      </div>
    );
  }

  // 狀態 A: 你是主控
  return (
    <div className="flex items-center gap-4 p-2 w-full relative group">
      {/* 👑 DJ 標記與微光特效 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
        <Crown className="w-5 h-5 text-yellow-400 drop-shadow-glow animate-pulse" />
        <span className="text-xs font-bold text-yellow-500">
          您是目前的派對DJ
          {countdown > 0 && (
            <span className="text-yellow-500"> ({countdown} 秒)</span>
          )}
        </span>
      </div>
      <img
        src={currentTrack.albumImageUrl || '/images/placeholder.png'}
        alt={currentTrack.album}
        width={56}
        height={56}
        className="w-14 h-14 rounded-md flex-shrink-0 shadow-lg"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
          {currentTrack.title}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {currentTrack.artist}
        </div>
        {/* 桌面版：顯示進度條 */}
        <div className="hidden md:flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-sky-200 dark:bg-sky-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <span className="text-xs text-slate-400">{formatTime(duration)}</span>
        </div>
        {/* 行動版：只顯示時間 */}
        <div className="md:hidden mt-1">
          <span className="text-xs text-slate-400">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* 桌面版：顯示音量控制 */}
        <div className="hidden xl:block relative">
          <button 
            onClick={() => {
              if (volume === 0) {
                // 如果當前是靜音，恢復到記住的音量
                handleSetVolume(previousVolume);
              } else {
                // 如果當前有音量，記住當前音量並靜音
                setPreviousVolume(volume);
                handleSetVolume(0);
              }
            }}
            onMouseEnter={() => {
              if (volumeSliderTimeoutRef.current) {
                clearTimeout(volumeSliderTimeoutRef.current);
              }
              setShowVolumeSlider(true);
            }}
            onMouseLeave={() => {
              volumeSliderTimeoutRef.current = setTimeout(() => {
                setShowVolumeSlider(false);
              }, 300);
            }}
            className="p-2 rounded-full active:bg-sky-200 dark:active:bg-sky-600 transition-colors touch-manipulation"
            title={volume === 0 ? "取消靜音" : "靜音"}
          >
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div 
            className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg transition-opacity pointer-events-none ${showVolumeSlider ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
            onMouseEnter={() => {
              if (volumeSliderTimeoutRef.current) {
                clearTimeout(volumeSliderTimeoutRef.current);
              }
              setShowVolumeSlider(true);
            }}
            onMouseLeave={() => {
              volumeSliderTimeoutRef.current = setTimeout(() => {
                setShowVolumeSlider(false);
              }, 300);
            }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleSetVolume(Number(e.target.value))}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-20 h-1 appearance-none cursor-pointer accent-sky-500"
              style={{
                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
        <button 
          onClick={previousTrack} 
          className="p-2 rounded-full active:bg-sky-200 dark:active:bg-sky-600 transition-colors touch-manipulation"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => (isPlaying ? pauseTrack() : handlePlay())}
          className="p-3 bg-sky-600 dark:bg-sky-100 text-white dark:text-slate-900 rounded-full shadow-lg active:bg-sky-800 dark:active:bg-sky-300 transition-colors touch-manipulation"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button 
          onClick={nextTrack} 
          className="p-2 rounded-full active:bg-sky-200 dark:active:bg-sky-600 transition-colors touch-manipulation"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        <button 
          onClick={handlePlayRandom} 
          className="p-2 rounded-full active:bg-sky-200 dark:active:bg-sky-600 transition-colors touch-manipulation"
          title="隨機播放"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>
      {/* 微光特效 */}
      <div className="absolute inset-0 pointer-events-none rounded-xl ring-2 ring-sky-400/40 blur-sm opacity-60 animate-pulse group-hover:opacity-80 transition" />
    </div>
  );
}