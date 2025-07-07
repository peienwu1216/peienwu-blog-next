'use client';
import React from 'react';
import { useSpotify } from '@/components/SpotifyProvider';
import { useMusicStore } from '@/store/music';
import { Play, Pause, Crown, Lock, Music2, Radio } from 'lucide-react';

// 音樂律動動畫組件
const MusicWaveIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end space-x-[2px] h-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className={`bg-sky-500/80 dark:bg-sky-400/80 rounded-[1px] transition-all duration-200 ${
          isPlaying ? 'animate-pulse' : ''
        }`}
        style={{
          width: '2px',
          height: `${6 + i * 2}px`,
          animationDelay: `${i * 120}ms`,
          animationDuration: '1000ms',
        }}
      />
    ))}
  </div>
);

export default function NowPlayingCard() {
  const { currentTrack, isPlaying, isControllable, expirationText } = useSpotify();
  const { djStatus, isMaster, isLocked } = useMusicStore();

  const handleClick = () => {
    // 藍圖的最終實現：模擬點擊 SearchButton 來觸發 ⌘+K。
    const searchButton = document.querySelector('header .flex.items-center.gap-2 button[aria-label="開啟指揮中心"]') as HTMLButtonElement | null;
    searchButton?.click();
  };

  // 決定卡片狀態和樣式
  const getCardState = () => {
    if (!currentTrack) {
      return {
        title: 'Code & Beats',
        subtitle: '電台靜默中',
        description: '點擊啟動音樂電台',
        icon: <Radio className="w-3 h-3 text-slate-400" />,
        bgColor: 'bg-white/80 dark:bg-slate-800/80',
        borderColor: '',
        showStatus: false,
      };
    }

    if (isMaster) {
      return {
        title: `🎛️ 您現在是DJ`,
        subtitle: djStatus?.ownerName || 'DJ',
        description: `已操作 ${djStatus?.actionCount || 0} 次`,
        icon: <Crown className="w-3 h-3 text-yellow-500" />,
        bgColor: 'bg-yellow-50/80 dark:bg-yellow-900/20',
        borderColor: 'ring-2 ring-yellow-300/50 dark:ring-yellow-600/50',
        showStatus: true,
        statusText: isPlaying ? '播放中' : '已暫停',
        statusColor: isPlaying ? 'text-green-600' : 'text-amber-600',
      };
    }

    if (isLocked && djStatus) {
      return {
        title: `🎧 ${(djStatus.ownerName.length > 8 ? djStatus.ownerName.slice(-6) : djStatus.ownerName)} 控台中`,
        subtitle: '',
        description: isControllable ? '點擊接管DJ台' : `${expirationText}後可接管`,
        icon: <Lock className="w-3 h-3 text-amber-600" />,
        bgColor: 'bg-amber-50/80 dark:bg-amber-900/20',
        borderColor: 'ring-2 ring-amber-300/50 dark:ring-amber-600/50',
        showStatus: true,
        statusText: isPlaying ? '播放中' : '待機中',
        statusColor: isPlaying ? 'text-green-600' : 'text-slate-500',
      };
    }

    return {
      title: 'Code & Beats',
      subtitle: '電台開放中',
      description: '點擊搶佔DJ台',
      icon: isPlaying ? <MusicWaveIcon isPlaying={true} /> : <Music2 className="w-3 h-3 text-sky-500" />,
      bgColor: 'bg-sky-50/80 dark:bg-sky-900/20',
      borderColor: 'ring-2 ring-sky-300/50 dark:ring-sky-600/50',
      showStatus: true,
      statusText: isPlaying ? '播放中' : '待機中',
      statusColor: isPlaying ? 'text-green-600' : 'text-slate-500',
    };
  };

  const cardState = getCardState();

  return (
    <div
      className={`rounded-xl shadow-lg p-4 flex items-center gap-4 cursor-pointer hover:shadow-xl transition-all duration-300 ${cardState.bgColor} ${cardState.borderColor}`}
      onClick={handleClick}
      tabIndex={0}
      aria-label="點擊以開啟音樂控制中心"
    >
      {currentTrack ? (
        <>
          {/* 專輯封面區域 */}
          <div className="relative flex-shrink-0">
            <img
              src={currentTrack.albumImageUrl}
              alt={currentTrack.album}
              className="w-14 h-14 rounded-lg object-cover shadow-md"
            />
            {/* 播放狀態覆蓋層 */}
            {isPlaying && (
              <div className="absolute inset-0 bg-sky-500/10 rounded-lg flex items-center justify-center">
                <MusicWaveIcon isPlaying={true} />
              </div>
            )}
          </div>
          
          {/* 歌曲信息區域 */}
          <div className="flex-1 min-w-0">
            {/* 第一行：狀態標題 + 圖標 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {cardState.title}
              </span>
              {cardState.icon}
            </div>
            
            {/* 第二行：歌曲名稱 */}
            <div className="font-bold truncate text-slate-900 dark:text-slate-100 mb-1">
              {currentTrack.title}
            </div>
            
            {/* 第三行：藝術家 */}
            <div className="text-sm truncate text-slate-600 dark:text-slate-300 mb-1">
              {currentTrack.artist}
            </div>
            
            {/* 第四行：描述信息 */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {cardState.description}
            </div>
          </div>

          {/* 右側狀態指示器 */}
          <div className="flex flex-col items-end gap-2">
            {/* 播放狀態 */}
            {cardState.showStatus && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                }`}></div>
                <span className={`text-xs font-medium ${
                  cardState.statusColor || 'text-slate-500'
                }`}>
                  {cardState.statusText}
                </span>
              </div>
            )}
            
            {/* DJ名稱或副標題 */}
            {cardState.subtitle && cardState.subtitle !== cardState.title && (
              <div className="text-xs text-slate-400 text-right">
                {cardState.subtitle}
              </div>
            )}
          </div>
        </>
      ) : (
        // 無音樂時的顯示
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="text-center">
            <div className="mb-3 flex justify-center">{cardState.icon}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
              {cardState.title}
            </div>
            <div className="text-slate-700 dark:text-slate-200 text-sm mb-1">
              {cardState.subtitle}
            </div>
            <div className="text-xs text-slate-400">
              {cardState.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 