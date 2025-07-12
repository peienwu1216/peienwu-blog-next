'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useSpotify } from './SpotifyProvider';
import { Play, Pause, Loader, Music4 } from 'lucide-react';
import { notifyHtml } from '@/lib/notify';
import { useApi } from '@/hooks/useApi';
import { TrackInfo } from '@/store/music';

interface ArticlePlayButtonProps {
  trackId: string;
  trackTitle: string;
}

// 動態 Equalizer SVG 組件
const EqualizerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 頻譜條 - 使用自定義 CSS 動畫 */}
    <rect x="2" y="8" width="2" height="8" className="equalizer-bar" />
    <rect x="6" y="6" width="2" height="12" className="equalizer-bar" />
    <rect x="10" y="4" width="2" height="16" className="equalizer-bar" />
    <rect x="14" y="7" width="2" height="10" className="equalizer-bar" />
    <rect x="18" y="5" width="2" height="14" className="equalizer-bar" />
    <rect x="22" y="9" width="2" height="6" className="equalizer-bar" />
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

export default function ArticlePlayButton({ trackId, trackTitle }: ArticlePlayButtonProps) {
  const { 
    playTrack, 
    pauseTrack, 
    resumeTrack, 
    isPlaying, 
    currentTrack,
    isReady,
    hasPlaybackInitiated,
    isControllable,
    expirationText
  } = useSpotify();
  
  const { exec: getTrackApi, isLoading: isTrackInfoLoading } = useApi<TrackInfo>('GET', `/api/spotify/track/${trackId}`);

  // ✨ 新增一個處理中的狀態
  const [isProcessing, setIsProcessing] = useState(false);

  const isThisTrackCurrentlyPlaying = isPlaying && currentTrack?.trackId === trackId;
  const isThisTrackCurrentlyPaused = !isPlaying && currentTrack?.trackId === trackId;

  // 懸停狀態管理
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 冷啟動檢查
    if (!isReady || !hasPlaybackInitiated) {
      notifyHtml('請先啟動音樂播放器', { duration: 3000 });
      return;
    }

    // 權限檢查 - 友善的提示
    if (!isControllable) {
      notifyHtml(
        `🎵 目前由其他訪客控制播放中<br><br>您可以等待 ${expirationText} 後重新取得控制權，或等待當前播放結束。`,
        { duration: 3000 }
      );
      return;
    }

    // ✨ 開始處理，設定 loading 狀態
    setIsProcessing(true);
    
    try {
      if (isThisTrackCurrentlyPlaying) {
        await pauseTrack();
      } else if (isThisTrackCurrentlyPaused) {
        await resumeTrack();
      } else {
        const trackToPlay = await getTrackApi();
        if (trackToPlay) {
          // 現在的 playTrack 內部已經包含了完整的奪權和啟用邏輯
          await playTrack(trackToPlay, true); 
        } else {
          notifyHtml('無法載入歌曲資訊', { type: 'error' });
        }
      }
    } catch (error) {
      console.error('Failed to play track from article:', error);
      notifyHtml(`播放失敗: ${error instanceof Error ? error.message : '未知錯誤'}`, { type: 'error' });
    } finally {
      // ✨ 處理完畢，無論成功或失敗都取消 loading 狀態
      // 稍微延遲一下，讓 Spotify 的狀態有時間同步回來
      setTimeout(() => setIsProcessing(false), 500);
    }
  }, [
    isReady,
    hasPlaybackInitiated,
    isControllable,
    isThisTrackCurrentlyPlaying,
    isThisTrackCurrentlyPaused,
    playTrack, 
    pauseTrack, 
    resumeTrack, 
    getTrackApi,
    setIsProcessing
  ]);

  // ✨ 當播放狀態改變時，也取消 loading
  useEffect(() => {
    if (isThisTrackCurrentlyPlaying) {
      setIsProcessing(false);
    }
  }, [isThisTrackCurrentlyPlaying]);

  if (!trackId) return null;

  // 決定顯示的圖示和文字
  const getIconAndText = () => {
    // ✨ 優先顯示處理中的狀態
    if (isProcessing || isTrackInfoLoading) {
      return { icon: <Loader size={16} className="animate-spin" />, text: '處理中...' };
    }
    
    if (!isControllable) {
      return { icon: <Play size={16} />, text: '等待控制權' };
    }
    
    if (isThisTrackCurrentlyPlaying) {
      // 播放中：懸停時顯示 Pause + 歌曲名稱 + 律動符號，否則顯示動態 Equalizer + 歌曲名稱
      if (isHovered) {
        return { 
          icon: <Pause size={16} />, 
          text: `${trackTitle} 🎵`,
          showEqualizer: false
        };
      } else {
        return { 
          icon: <EqualizerIcon />, 
          text: trackTitle,
          showEqualizer: true
        };
      }
    }
    
    // 暫停或未播放：懸停時圖示變主題色
    return { 
      icon: <Play size={16} className={isHovered ? "text-blue-500 dark:text-blue-400" : ""} />, 
      text: isThisTrackCurrentlyPaused ? '繼續播放' : '播放主題曲',
      showEqualizer: false
    };
  };

  const { icon, text, showEqualizer } = getIconAndText();

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isProcessing || isTrackInfoLoading || !isControllable}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 ease-in-out
        ${isThisTrackCurrentlyPlaying 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
        }
        ${isHovered && isControllable 
          ? 'scale-105 shadow-md transform' 
          : 'hover:scale-105 hover:shadow-md hover:transform'
        }
        ${!isControllable 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      aria-label={
        !isControllable 
          ? '目前由其他訪客控制中，無法播放' 
          : isThisTrackCurrentlyPlaying 
            ? `暫停播放 ${trackTitle}` 
            : `播放主題曲 ${trackTitle}`
      }
      title={!isControllable ? '目前由其他訪客控制中' : undefined}
    >
      {icon}
      <span className="hidden sm:inline">{text}</span>
      {/* 播放中時顯示額外的律動符號 */}
      {isThisTrackCurrentlyPlaying && !isHovered && (
        <span className="hidden sm:inline text-blue-500 dark:text-blue-400">🎵</span>
      )}
    </button>
  );
}