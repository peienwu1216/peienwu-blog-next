import { create } from 'zustand';
import { TrackInfo, DJStatus, TTLResetEvent } from '@/types/spotify';

export type { TrackInfo };

interface MusicState {
  // 播放器狀態
  isPlaying: boolean;
  isReady: boolean;
  progress: number;
  duration: number;
  volume: number;
  
  // 歌曲資料
  currentTrack: TrackInfo | null;
  queue: TrackInfo[];
  
  // ✨ 透明化升級：DJ 狀態管理
  djStatus: DJStatus | null;
  isMaster: boolean;
  isLocked: boolean;
  countdown: number;
  
  // ✨ 透明化升級：視覺反饋狀態
  lastTTLReset: TTLResetEvent | null;
  showTTLResetAnimation: boolean;
  djTransitionAnimation: {
    show: boolean;
    type: 'CLAIMED' | 'RELEASED' | 'EXPIRED' | null;
    djName?: string;
  };

  // Actions
  setTrack: (track: TrackInfo | null) => void;
  setQueue: (tracks: TrackInfo[]) => void;
  insertTrack: (track: TrackInfo) => void;
  
  // 播放器狀態 Actions
  setIsPlaying: (playing: boolean) => void;
  setIsReady: (ready: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  
  // ✨ 透明化升級：DJ 狀態 Actions
  setDJStatus: (djStatus: DJStatus | null) => void;
  setMasterInfo: (info: { isMaster: boolean; isLocked: boolean; ttl?: number }) => void;
  setCountdown: (seconds: number) => void;
  
  // ✨ 透明化升級：視覺反饋 Actions
  triggerTTLResetAnimation: (event: TTLResetEvent) => void;
  clearTTLResetAnimation: () => void;
  triggerDJTransition: (type: 'CLAIMED' | 'RELEASED' | 'EXPIRED', djName?: string) => void;
  clearDJTransition: () => void;

  // 便利方法
  resetPlayer: () => void;
  getCurrentDJName: () => string | null;
  getTimeSinceLastAction: () => number | null;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  // 初始狀態
  isPlaying: false,
  isReady: false,
  progress: 0,
  duration: 0,
  volume: 1,
  currentTrack: null,
  queue: [],
  isMaster: false,
  isLocked: false,
  countdown: 0,
  djStatus: null,
  lastTTLReset: null,
  showTTLResetAnimation: false,
  djTransitionAnimation: {
    show: false,
    type: null,
  },

  // 歌曲資料 Actions
  setTrack: (track) => set({ currentTrack: track }),
  
  setQueue: (tracks) => set({ queue: tracks }),
  
  // ✨ 核心修改：讓 insertTrack 只處理佇列，不改變當前播放的歌曲
  insertTrack: (track) => {
    set((state) => {
      const { queue, currentTrack } = state;

      // 如果當前沒有歌曲，則直接設定為新佇列並播放
      if (!currentTrack) {
        return { queue: [track], currentTrack: track, isPlaying: true };
      }

      // 否則，找到目前歌曲的位置並將新歌插入到它後面
      const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId);
      const newQueue = [...queue];
      
      // 如果找不到目前歌曲，就插在最前面
      const insertionIndex = currentIndex === -1 ? 0 : currentIndex + 1;
      newQueue.splice(insertionIndex, 0, track);
      
      // 只更新佇列，currentTrack 和 isPlaying 留給 Spotify 事件來更新
      return { queue: newQueue };
    });
  },
  
  // 播放器狀態 Actions
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setIsReady: (ready) => set({ isReady: ready }),
  
  setProgress: (progress) => set({ progress }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),

  // ✨ 透明化升級：DJ 狀態 Actions
  setDJStatus: (djStatus) => set({ djStatus }),

  // 控制權 Actions
  setMasterInfo: (info) => {
    set({
      isMaster: info.isMaster,
      isLocked: info.isLocked,
      countdown: info.ttl || 0,
    });
  },
  setCountdown: (seconds) => set({ countdown: seconds }),

  // ✨ 透明化升級：視覺反饋 Actions
  triggerTTLResetAnimation: (event) => set({ lastTTLReset: event }),
  clearTTLResetAnimation: () => set({ lastTTLReset: null, showTTLResetAnimation: false }),
  triggerDJTransition: (type, djName) => set({
    djTransitionAnimation: {
      show: true,
      type,
      djName,
    },
  }),
  clearDJTransition: () => set({
    djTransitionAnimation: {
      show: false,
      type: null,
    },
  }),

  // 便利方法：重置播放器狀態
  resetPlayer: () => set({
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTrack: null,
  }),

  getCurrentDJName: () => get().djStatus?.ownerName || null,
  getTimeSinceLastAction: () => {
    const state = get();
    if (state.djStatus?.lastActionAt) {
      const now = Date.now();
      const lastAction = state.djStatus.lastActionAt;
      return Math.floor((now - lastAction) / 1000);
    }
    return null;
  },
}));