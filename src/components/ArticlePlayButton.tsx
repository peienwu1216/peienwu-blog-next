'use client';

import React from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface ArticlePlayButtonProps {
  trackId: string;
  trackTitle: string;
}

export default function ArticlePlayButton({ trackId, trackTitle }: ArticlePlayButtonProps) {
  const { playTrack, pauseTrack, isPlaying, currentTrack } = useSpotify();
  const isThisTrackPlaying = isPlaying && currentTrack?.trackId === trackId;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const trackToPlay = {
      trackId,
      title: trackTitle,
      artist: '',
      album: '',
      albumImageUrl: '',
      songUrl: '',
    };
    playTrack(trackToPlay);
    toast.info(`正在播放主題曲: ${trackTitle}`);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    pauseTrack();
    toast.info('音樂已暫停');
  };

  if (!trackId) return null;

  return (
    <button
      onClick={isThisTrackPlaying ? handlePause : handlePlay}
      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
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