'use client';

import React, { useState, useCallback } from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { TrackInfo } from '@/store/music';

interface ArticlePlayButtonProps {
  trackId: string;
  trackTitle: string;
}

export default function ArticlePlayButton({ trackId, trackTitle }: ArticlePlayButtonProps) {
  const { playTrack, pauseTrack, isPlaying, currentTrack } = useSpotify();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用 useApi Hook 來處理 track 資訊的獲取，指定返回類型為 TrackInfo
  const { exec: getTrackApi, isLoading: isTrackLoading } = useApi<TrackInfo>('GET', `/api/spotify/track/${trackId}`);

  // 核心邏輯：判斷「這篇文章的歌曲」是否就是「當前正在播放的歌曲」
  const isThisTrackPlaying = isPlaying && currentTrack?.trackId === trackId;

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 如果這首歌正在播放，則執行暫停
    if (isThisTrackPlaying) {
      pauseTrack();
      toast.info('音樂已暫停');
      return;
    }

    // 如果要播放的歌就是目前已經在播放的歌，只是被暫停了，也直接忽略，避免重複插播
    // (這個檢查可以防止在暫停狀態下，再次點擊造成重複插播)
    if (currentTrack?.trackId === trackId) {
      return;
    }

    // 設定提交中狀態，防止連續點擊
    setIsSubmitting(true);
    try {
      // 使用 useApi Hook 獲取歌曲資訊
      const trackToPlay = await getTrackApi();
      
      if (trackToPlay) {
        // 呼叫 playTrack，並明確告知是「插播 (interrupt)」
        await playTrack(trackToPlay, true);
        toast.success(`正在播放 ${trackToPlay.title}`);
      } else {
        toast.error('無法載入歌曲資訊');
      }
    } catch (error) {
      console.error('Failed to play track from article:', error);
      toast.error('播放失敗，請稍後再試');
    } finally {
      // 無論成功或失敗，最後都解除提交中狀態
      setIsSubmitting(false);
    }
  }, [isThisTrackPlaying, trackId, currentTrack, playTrack, pauseTrack, getTrackApi]);

  if (!trackId) return null;

  // 組合 loading 狀態
  const isLoading = isSubmitting || isTrackLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading} // 當正在提交請求時，禁用按鈕
      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isThisTrackPlaying ? `暫停播放 ${trackTitle}` : `播放主題曲 ${trackTitle}`}
    >
      {isThisTrackPlaying ? (
        <Pause size={16} className="text-blue-500" />
      ) : (
        <Play size={16} />
      )}
      <span className="hidden sm:inline">
        {isThisTrackPlaying ? '暫停音樂' : '播放主題曲'}
      </span>
    </button>
  );
} 