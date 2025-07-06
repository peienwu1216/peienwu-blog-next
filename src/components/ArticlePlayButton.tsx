'use client';

import React, { useState, useCallback } from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { TrackInfo } from '@/store/music';

interface ArticlePlayButtonProps {
  trackId: string;
  trackTitle: string;
}

export default function ArticlePlayButton({ trackId, trackTitle }: ArticlePlayButtonProps) {
  const { playTrack, pauseTrack, resumeTrack, isPlaying, currentTrack } = useSpotify();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { exec: getTrackApi, isLoading: isTrackLoading } = useApi<TrackInfo>('GET', `/api/spotify/track/${trackId}`);

  const isThisTrackPlaying = isPlaying && currentTrack?.trackId === trackId;

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isThisTrackPlaying) {
      pauseTrack();
      toast.info('音樂已暫停');
      return;
    }
    
    if (currentTrack?.trackId === trackId && !isPlaying) {
      resumeTrack();
      toast.info(`繼續播放: ${currentTrack.title}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const trackToPlay = await getTrackApi();
      if (trackToPlay) {
        await playTrack(trackToPlay, true);
        toast.success(`正在播放 ${trackToPlay.title}`);
      } else {
        toast.error('無法載入歌曲資訊');
      }
    } catch (error) {
      console.error('Failed to play track from article:', error);
      toast.error('播放失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  }, [isThisTrackPlaying, trackId, currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, getTrackApi]);

  if (!trackId) return null;

  const isLoading = isSubmitting || isTrackLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isThisTrackPlaying ? `暫停播放 ${trackTitle}` : `播放主題曲 ${trackTitle}`}
    >
      {isLoading ? (
        <Loader size={16} className="animate-spin" />
      ) : isThisTrackPlaying ? (
        <Pause size={16} className="text-blue-500" />
      ) : (
        <Play size={16} />
      )}
      <span className="hidden sm:inline">
        {isLoading ? '載入中...' : isThisTrackPlaying ? '暫停音樂' : '播放主題曲'}
      </span>
    </button>
  );
} 