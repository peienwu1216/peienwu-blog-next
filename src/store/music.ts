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
  
  // 便利方法：重置播放器狀態
  resetPlayer: () => set({
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTrack: null,
  }),
}));