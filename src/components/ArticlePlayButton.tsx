'use client';

import React, { useCallback } from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, Loader, Music4 } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { TrackInfo } from '@/store/music';

interface ArticlePlayButtonProps {
  trackId: string;
  trackTitle: string;
}

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

export default function ArticlePlayButton({ trackId, trackTitle }: ArticlePlayButtonProps) {
  const { 
    playTrack, 
    pauseTrack, 
    resumeTrack, 
    isPlaying, 
    currentTrack,
    isReady,
    hasPlaybackInitiated,
    isControllable // ✨ 取得是否可控制的狀態
  } = useSpotify();
  
  const { exec: getTrackApi, isLoading: isTrackInfoLoading } = useApi<TrackInfo>('GET', `/api/spotify/track/${trackId}`);

  const isThisTrackCurrentlyPlaying = isPlaying && currentTrack?.trackId === trackId;
  const isThisTrackCurrentlyPaused = !isPlaying && currentTrack?.trackId === trackId;

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 冷啟動檢查
    if (!isReady || !hasPlaybackInitiated) {
      toast.custom(() => <ActivationToast />, {
        duration: 6000,
        position: 'bottom-right',
      });
      return;
    }

    // ✨ 權限檢查 - 友善的提示
    if (!isControllable) {
      toast.info(
        "🎵 目前由其他訪客控制播放中\n\n您可以等待 5 分鐘後重新取得控制權，或等待當前播放結束。",
        {
          duration: 5000,
          position: 'bottom-right',
        }
      );
      return;
    }

    if (isThisTrackCurrentlyPlaying) {
      pauseTrack();
      return;
    }
    if (isThisTrackCurrentlyPaused) {
      resumeTrack();
      return;
    }
    try {
      const trackToPlay = await getTrackApi();
      if (trackToPlay) {
        await playTrack(trackToPlay, true); 
      } else {
        toast.error('無法載入歌曲資訊');
      }
    } catch (error) {
      console.error('Failed to play track from article:', error);
      toast.error(`播放失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }, [
    isReady,
    hasPlaybackInitiated,
    isControllable, // ✨ 加入權限檢查依賴
    isThisTrackCurrentlyPlaying,
    isThisTrackCurrentlyPaused,
    playTrack, 
    pauseTrack, 
    resumeTrack, 
    getTrackApi
  ]);

  if (!trackId) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isTrackInfoLoading || !isControllable}
      className={`flex items-center gap-2 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        !isControllable 
          ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' 
          : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
      aria-label={
        !isControllable 
          ? '目前由其他訪客控制中，無法播放' 
          : isThisTrackCurrentlyPlaying 
            ? `暫停播放 ${trackTitle}` 
            : `播放主題曲 ${trackTitle}`
      }
      title={!isControllable ? '目前由其他訪客控制中' : undefined}
    >
      {isTrackInfoLoading ? (
        <Loader size={16} className="animate-spin" />
      ) : !isControllable ? (
        <Play size={16} className="text-slate-400" />
      ) : isThisTrackCurrentlyPlaying ? (
        <Pause size={16} className="text-blue-500" />
      ) : (
        <Play size={16} />
      )}
      <span className="hidden sm:inline">
        {!isControllable 
          ? '等待控制權' 
          : isThisTrackCurrentlyPlaying 
            ? '暫停播放' 
            : '播放主題曲'
        }
      </span>
    </button>
  );
} 