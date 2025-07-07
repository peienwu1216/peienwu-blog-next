"use client";

import { useMusicStore } from '@/store/music';

export default function MusicIndicator() {
  const { isPlaying, isReady } = useMusicStore();

  // 檢查是否應該顯示音樂指示器
  // 條件：本地設備正在播放音樂 + 設備已準備
  // 不管是否有主控權，只要本地有聲音就顯示
  const shouldShowIndicator = isPlaying && isReady;

  if (!shouldShowIndicator) {
    return null;
  }

  return (
    <div className="flex items-center ml-3">
      {/* 音樂律動動畫 - 更加subtle和精緻 */}
      <div className="flex items-end space-x-px h-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-green-500/60 dark:bg-green-400/60 rounded-[1px] animate-pulse"
            style={{
              width: '1.5px',
              height: `${8 + i * 2}px`,
              animationDelay: `${i * 120}ms`,
              animationDuration: '1000ms',
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        ))}
      </div>
      
      {/* 微小的音符圖標 */}
      <div className="ml-1.5">
        <svg 
          className="w-2.5 h-2.5 text-green-500/50 dark:text-green-400/50" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
    </div>
  );
} 