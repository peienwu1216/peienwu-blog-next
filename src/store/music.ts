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
  currentTrack: TrackInfo | null;
  queue: TrackInfo[];
  setTrack: (track: TrackInfo | null) => void;
  setQueue: (tracks: TrackInfo[]) => void;
  // ✨ 專門處理插播的 action
  insertTrack: (track: TrackInfo) => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentTrack: null,
  queue: [],
  
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
}));