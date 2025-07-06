import { NowPlayingResponse, MasterDeviceResponse, MasterDeviceConfig, TrackInfo, PlaybackError } from '@/types/spotify';

class SpotifyApiService {
  // Playback Control APIs
  async playPlaylist(deviceId: string, playlistId: string, options: { uris?: string[] } = {}) {
    const body = options.uris 
      ? { uris: options.uris }
      : { context_uri: `spotify:playlist:${playlistId}` };

    const response = await fetch(`/api/spotify/play?deviceId=${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new PlaybackError('Failed to play playlist', { cause: response.statusText });
    }
  }

  async playTrackUris(deviceId: string, trackUris: string[]) {
    const response = await fetch(`/api/spotify/play?deviceId=${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: trackUris }),
    });

    if (!response.ok) {
      throw new PlaybackError('Failed to play track URIs', { cause: response.statusText });
    }
  }

  async addToQueue(trackUri: string) {
    const response = await fetch('/api/spotify/add-to-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackUri }),
    });

    if (!response.ok) {
      throw new PlaybackError('Failed to add track to queue', { cause: response.statusText });
    }
  }

  async nextTrack(deviceId: string) {
    const response = await fetch(`/api/spotify/next?deviceId=${deviceId}`, { 
      method: 'POST' 
    });

    if (!response.ok) {
      throw new PlaybackError('Failed to skip to next track', { cause: response.statusText });
    }
  }

  // State Management APIs
  async getNowPlaying(): Promise<NowPlayingResponse> {
    const response = await fetch('/api/spotify/now-playing');
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new PlaybackError('Authentication expired', { cause: 'UNAUTHORIZED' });
      }
      throw new PlaybackError('Failed to get now playing', { cause: response.statusText });
    }

    return response.json();
  }

  async getAccessToken(): Promise<string> {
    const response = await fetch('/api/spotify/access-token');
    
    if (!response.ok) {
      throw new PlaybackError('Failed to get access token', { cause: response.statusText });
    }

    const { accessToken } = await response.json();
    return accessToken;
  }

  // Master Device Management APIs
  async getMasterDevice(): Promise<MasterDeviceResponse> {
    const response = await fetch('/api/spotify/master-device');
    
    if (!response.ok) {
      throw new PlaybackError('Failed to get master device', { cause: response.statusText });
    }

    return response.json();
  }

  async claimMasterDevice(deviceId: string): Promise<MasterDeviceResponse> {
    const response = await fetch('/api/spotify/master-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });

    if (!response.ok) {
      throw new PlaybackError('Failed to claim master device', { cause: response.statusText });
    }

    return response.json();
  }

  async getMasterDeviceConfig(): Promise<MasterDeviceConfig> {
    const response = await fetch('/api/spotify/master-device/config');
    
    if (!response.ok) {
      throw new PlaybackError('Failed to get master device config', { cause: response.statusText });
    }

    return response.json();
  }

  // Playlist APIs
  async getPlaylist(playlistId: string): Promise<TrackInfo[]> {
    const response = await fetch(`/api/spotify/playlist/${playlistId}`);
    
    if (!response.ok) {
      throw new PlaybackError('Failed to load playlist', { cause: response.statusText });
    }

    return response.json();
  }

  // Utility Methods
  createTrackUri(trackId: string): string {
    return `spotify:track:${trackId}`;
  }

  createPlaylistUri(playlistId: string): string {
    return `spotify:playlist:${playlistId}`;
  }

  createTrackInfo(spotifyTrack: any, state?: any): TrackInfo {
    return {
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map((a: any) => a.name).join(', '),
      album: spotifyTrack.album.name,
      albumImageUrl: spotifyTrack.album.images[0]?.url || '/images/placeholder.png',
      songUrl: `https://open.spotify.com/track/${spotifyTrack.id}`,
      trackId: spotifyTrack.id,
      duration: state ? state.duration / 1000 : undefined,
    };
  }
}

// Singleton instance
export const spotifyApiService = new SpotifyApiService();
export default spotifyApiService; 