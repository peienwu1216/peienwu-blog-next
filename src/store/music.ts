import { create } from 'zustand';

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  trackId: string;
  duration?: number;
}

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
  
  // 便利方法
  resetPlayer: () => void;
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
  
  // 歌曲資料 Actions
  setTrack: (track) => set({ currentTrack: track }),
  
  setQueue: (tracks) => set({ queue: tracks }),
  
  // ✨ 插播邏輯 - 只處理歌曲資料，不處理播放狀態
  insertTrack: (track) => {
    const { queue, currentTrack } = get();
    if (!currentTrack) {
      // 如果當前沒有歌曲，就直接設定這首歌為當前歌曲
      set({ queue: [track], currentTrack: track });
      return;
    }

    const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId);
    const newQueue = [...queue];
    
    // 將新歌插入到目前歌曲的下一首
    newQueue.splice(currentIndex + 1, 0, track);
    
    set({
      queue: newQueue,
      currentTrack: track, // 立刻切換到新歌
    });
  },
  
  // 播放器狀態 Actions
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setIsReady: (ready) => set({ isReady: ready }),
  
  setProgress: (progress) => set({ progress }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),
  
  // 便利方法：重置播放器狀態
  resetPlayer: () => set({
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTrack: null,
  }),
}));