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
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
  queue: TrackInfo[];
  volume: number;
  progress: number;
  duration: number;
  play: (track: TrackInfo) => void;
  pause: () => void;
  setTrack: (track: TrackInfo | null) => void;
  setQueue: (tracks: TrackInfo[]) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  // ✨ 新增：專門處理插播的 action
  insertTrack: (track: TrackInfo) => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  isPlaying: false,
  currentTrack: null,
  queue: [],
  volume: 1,
  progress: 0,
  duration: 0,
  play: (track) => set({ isPlaying: true, currentTrack: track, progress: 0 }),
  pause: () => set({ isPlaying: false }),
  setTrack: (track) => set({ currentTrack: track }),
  setQueue: (tracks) => set({ queue: tracks }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  
  // ✨ 新增的插播邏輯
  insertTrack: (track) => {
    const { queue, currentTrack } = get();
    if (!currentTrack) {
      // 如果當前沒有歌曲，就直接播放這首歌
      set({ queue: [track], currentTrack: track, isPlaying: true, progress: 0, duration: track.duration || 0 });
      return;
    }

    const currentIndex = queue.findIndex(t => t.trackId === currentTrack.trackId);
    const newQueue = [...queue];
    
    // 將新歌插入到目前歌曲的下一首
    newQueue.splice(currentIndex + 1, 0, track);
    
    set({
      queue: newQueue,
      currentTrack: track, // 立刻切換到新歌
      isPlaying: true,
      progress: 0,
      duration: track.duration || 0,
    });
  },
}));