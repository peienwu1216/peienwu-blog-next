export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
  trackId: string;
  duration?: number;
}

export interface SpotifyContextProps {
  playTrack: (track: TrackInfo, isInterrupt?: boolean) => void;
  handlePlay: () => void;
  handlePlayRandom: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  handleSetVolume: (volume: number) => void;
  seek: (position: number) => void;
  loading: boolean;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: TrackInfo | null;
  volume: number;
  progress: number;
  duration: number;
  hasPlaybackInitiated: boolean;
  isControllable: boolean;
  expirationText: string;
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  item: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    external_urls: {
      spotify: string;
    };
    duration_ms: number;
  } | null;
  progress_ms: number;
  duration_ms: number;
}

export interface MasterDeviceResponse {
  masterDeviceId: string | null;
  ttl: number;
  success?: boolean;
  currentMasterId?: string;
}

export interface MasterDeviceConfig {
  expirationText: string;
}

export interface SpotifyPlayerState {
  device_id: string;
  track_window: {
    current_track: {
      id: string;
      name: string;
      artists: { name: string }[];
      album: {
        name: string;
        images: { url: string }[];
      };
    };
  };
  position: number;
  duration: number;
  paused: boolean;
}

export class PlaybackError extends Error {
  public type: 'PERMISSION_DENIED' | 'DEVICE_NOT_READY' | 'API_ERROR' | 'UNKNOWN';
  public deviceId?: string;
  public masterId?: string;

  constructor(
    message: string, 
    options?: { 
      cause?: string; 
      type?: PlaybackError['type']; 
      deviceId?: string; 
      masterId?: string;
    }
  ) {
    super(message);
    this.name = 'PlaybackError';
    this.type = options?.type || 'UNKNOWN';
    this.deviceId = options?.deviceId;
    this.masterId = options?.masterId;
    
    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export type NotificationState = {
  hasShownLocked: boolean;
  hasShownExpired: boolean;
}; 