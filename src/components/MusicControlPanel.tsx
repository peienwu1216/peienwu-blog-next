'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSpotify } from './SpotifyProvider';
import { useMusicStore } from '@/store/music';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Loader, Shuffle, Crown, Lock, Zap, User } from 'lucide-react';

// ✨ TTL 重置動畫組件
const TTLResetAnimation = ({ event, onComplete }: { 
  event: { newTTL: number; resetBy: string; actionType: string; timestamp: number } | null; 
  onComplete: () => void;
}) => {
  useEffect(() => {
    if (event) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  if (!event) return null;

  return (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg ttl-reset-animation flex items-center gap-1">
        <Zap className="w-3 h-3" />
        +{event.newTTL}s
      </div>
    </div>
  );
};

// ✨ DJ 轉換動畫組件
const DJTransitionAnimation = ({ 
  animation, 
  onComplete 
}: { 
  animation: { show: boolean; type: 'CLAIMED' | 'RELEASED' | 'EXPIRED' | null; djName?: string };
  onComplete: () => void;
}) => {
  useEffect(() => {
    if (animation.show) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [animation.show, onComplete]);

  if (!animation.show || !animation.type) return null;

  const getMessage = () => {
    switch (animation.type) {
      case 'CLAIMED':
        return (
          <>
            {/* 桌面版：完整顯示 */}
            <span className="hidden sm:inline">🎉 {animation.djName} 成為新的 DJ！</span>
            {/* 手機版：簡化顯示 */}
            <span className="sm:hidden">🎉 {animation.djName} 接管</span>
          </>
        );
      case 'RELEASED':
        return (
          <>
            <span className="hidden sm:inline">👋 {animation.djName} 已離開 DJ 台</span>
            <span className="sm:hidden">👋 {animation.djName} 離開</span>
          </>
        );
      case 'EXPIRED':
        return (
          <>
            <span className="hidden sm:inline">⏰ {animation.djName} 的控制權已過期</span>
            <span className="sm:hidden">⏰ {animation.djName} 過期</span>
          </>
        );
      default:
        return '';
    }
  };

  const getColor = () => {
    switch (animation.type) {
      case 'CLAIMED':
        return 'bg-emerald-500';
      case 'RELEASED':
        return 'bg-blue-500';
      case 'EXPIRED':
        return 'bg-amber-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
      <div className={`${getColor()} text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg dj-transition-animation`}>
        {getMessage()}
      </div>
    </div>
  );
};

export default function MusicControlPanel() {
  // 記住靜音前的音量
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const volumeRef = useRef(0.5);
  // 音量滑桿顯示狀態
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 處理中狀態
  const [isTakingControl, setIsTakingControl] = useState(false);

  // ✨ 透明化升級：獲取 DJ 狀態和動畫
  const { 
    isMaster, 
    isLocked, 
    countdown, 
    djStatus,
    lastTTLReset,
    djTransitionAnimation,
    clearTTLResetAnimation,
    clearDJTransition
  } = useMusicStore();

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

  // 同步 volumeRef 與當前音量
  React.useEffect(() => {
    if (volume > 0) {
      volumeRef.current = volume;
    }
  }, [volume]);

  // 修正：主控權狀態變化時自動重置 loading 狀態，避免未點擊時出現轉圈圈
  useEffect(() => {
    if (isTakingControl && (isMaster || isLocked)) {
      setIsTakingControl(false);
    }
  }, [isMaster, isLocked]);

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

  // ✨ 狀態 C: 無人主控，可以搶佔
  if (!isMaster && !isLocked) {
    return (
      <div className="flex items-center gap-4 p-2 w-full relative">
        {/* ✨ DJ 轉換動畫 */}
        <DJTransitionAnimation animation={djTransitionAnimation} onComplete={clearDJTransition} />
        
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
              <span role="img" aria-label="party">🎧</span> DJ 台空閒中
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
                <span className="hidden sm:inline">正在取得主控權...</span>
                <span className="sm:hidden">取得中...</span>
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

  // ✨ 狀態 B: 他人主控，被鎖定
  if (isLocked) {
    return (
      <div className="flex items-center gap-4 p-2 w-full relative">
        {/* ✨ TTL 重置動畫 */}
        <TTLResetAnimation event={lastTTLReset} onComplete={clearTTLResetAnimation} />
        {/* ✨ DJ 轉換動畫 */}
        <DJTransitionAnimation animation={djTransitionAnimation} onComplete={clearDJTransition} />
        
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
          {/* ✨ 透明化：顯示當前 DJ */}
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-amber-600" />
            <span className="text-amber-600 text-xs font-bold">
              DJ: {djStatus?.ownerName || '未知用戶'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 text-slate-500 dark:text-slate-400 text-xs">
            {countdown > 0 && (
              <span className="text-amber-600 font-bold">({countdown} 秒後可接管)</span>
            )}
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>{`${djStatus?.ownerName?.split(' ')[1] || 'DJ'} 正在控制中`}</span>
            </div>
            {/* ✨ 顯示最後操作 */}
            {djStatus?.lastAction && (
              <span className="text-xs text-slate-400 italic">
                最後操作: {djStatus.lastAction.details}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✨ 狀態 A: 你是主控
  return (
    <div className="flex items-center gap-4 p-2 w-full relative group">
      {/* ✨ TTL 重置動畫 */}
      <TTLResetAnimation event={lastTTLReset} onComplete={clearTTLResetAnimation} />
      {/* ✨ DJ 轉換動畫 */}
      <DJTransitionAnimation animation={djTransitionAnimation} onComplete={clearDJTransition} />
      
      {/* ✨ 透明化升級：DJ 標記與詳細資訊 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
        <Crown className="w-5 h-5 text-yellow-400 crown-glow" />
        <span className="text-xs font-bold text-yellow-500">
          {/* 桌面版：完整顯示 */}
          <span className="hidden sm:inline">
            您是派對DJ ({djStatus?.ownerName})
            {countdown > 0 && ` - ${countdown}秒`}
          </span>
          {/* 手機版：簡化顯示 */}
          <span className="sm:hidden">
            DJ {djStatus?.ownerName}
            {countdown > 0 && ` -${countdown}s`}
          </span>
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
        {/* ✨ 透明化：DJ 統計信息 */}
        <div className="hidden lg:flex flex-col items-end text-xs text-yellow-600 dark:text-yellow-400 mr-2 dj-stats-animation">
          {djStatus && (
            <>
              <span className="font-bold">操作: {djStatus.actionCount}次</span>
              <span className="text-yellow-500">
                時長: {Math.floor((Date.now() - djStatus.sessionStartAt) / 60000)}分鐘
              </span>
            </>
          )}
        </div>
        
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