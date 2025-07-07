import { NowPlayingResponse, MasterDeviceResponse, MasterDeviceConfig, TrackInfo, PlaybackError, TransparentMasterDeviceResponse } from '@/types/spotify';

class SpotifyApiService {
  // Helper method for making API calls with retry logic
  private async makeApiCall<T>(
    url: string, 
    options: RequestInit = {}, 
    retries = 1
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          // Handle different error types
          if (response.status === 401 && attempt < retries) {
            // Token expired, wait briefly and retry
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          
          // Try to get error details from response
          let errorMessage = response.statusText;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch {
            // If JSON parsing fails, use status text
          }
          
          throw new PlaybackError(errorMessage, { cause: response.status.toString() });
        }
        
        // Handle successful responses
        const contentType = response.headers.get('content-type');
        if (response.status === 204 || response.status === 205) {
          return null as T;
        }
        
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return null as T;
      } catch (error) {
        if (attempt === retries) {
          // Last attempt failed, throw the error
          if (error instanceof PlaybackError) {
            throw error;
          }
          throw new PlaybackError(
            error instanceof Error ? error.message : 'Unknown error occurred',
            { cause: error instanceof Error ? error.message : 'Unknown error' }
          );
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw new PlaybackError('Max retries exceeded');
  }

  // Playback Control APIs
  async playPlaylist(deviceId: string, playlistId: string, options: { uris?: string[] } = {}) {
    const body = options.uris 
      ? { uris: options.uris }
      : { context_uri: `spotify:playlist:${playlistId}` };

    await this.makeApiCall(`/api/spotify/play?deviceId=${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 2); // Retry once for token expiration
  }

  async playTrackUris(deviceId: string, trackUris: string[]) {
    await this.makeApiCall(`/api/spotify/play?deviceId=${deviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: trackUris }),
    }, 2);
  }

  async addToQueue(trackUri: string) {
    await this.makeApiCall('/api/spotify/add-to-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackUri }),
    }, 2);
  }

  async nextTrack(deviceId: string) {
    await this.makeApiCall(`/api/spotify/next?deviceId=${deviceId}`, { 
      method: 'POST' 
    }, 2);
  }

  // State Management APIs
  async getNowPlaying(): Promise<NowPlayingResponse> {
    return await this.makeApiCall<NowPlayingResponse>('/api/spotify/now-playing', {}, 2);
  }

  async getAccessToken(): Promise<string> {
    const result = await this.makeApiCall<{ accessToken: string }>('/api/spotify/access-token', {}, 2);
    return result.accessToken;
  }

  // Master Device Management APIs
  async getMasterDevice(): Promise<TransparentMasterDeviceResponse> {
    return await this.makeApiCall<TransparentMasterDeviceResponse>('/api/spotify/master-device', {}, 2);
  }

  async claimMasterDevice(deviceId: string): Promise<TransparentMasterDeviceResponse> {
    return await this.makeApiCall<TransparentMasterDeviceResponse>('/api/spotify/master-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    }, 2);
  }

  /**
   * ✨ 透明化升級：重置 DJ 狀態的 TTL
   * 現在支援傳遞操作類型和詳情，實現完全透明的狀態管理
   */
  async resetMasterDeviceTTL(
    deviceId: string, 
    actionType?: string, 
    actionDetails?: string
  ): Promise<TransparentMasterDeviceResponse> {
    return await this.makeApiCall<TransparentMasterDeviceResponse>('/api/spotify/master-device', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        deviceId, 
        actionType: actionType || 'USER_ACTION',
        actionDetails: actionDetails || '用戶操作'
      }),
    }, 1); // 重置 TTL 不需要重試太多次
  }

  async getMasterDeviceConfig(): Promise<MasterDeviceConfig> {
    return await this.makeApiCall<MasterDeviceConfig>('/api/spotify/master-device/config', {}, 1);
  }

  // Playlist APIs
  async getPlaylist(playlistId: string): Promise<TrackInfo[]> {
    return await this.makeApiCall<TrackInfo[]>(`/api/spotify/playlist/${playlistId}`, {}, 2);
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