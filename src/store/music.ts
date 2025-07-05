import { create } from 'zustand';

export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  trackId: string;
}

interface MusicState {
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
  play: (track: TrackInfo) => void;
  pause: () => void;
  setTrack: (track: TrackInfo | null) => void;
}

export const useMusicStore = create<MusicState>((set) => ({
  isPlaying: false,
  currentTrack: null,
  play: (track) => set({ isPlaying: true, currentTrack: track }),
  pause: () => set((state) => ({ ...state, isPlaying: false })),
  setTrack: (track) => set((state) => ({ ...state, currentTrack: track })),
})); 