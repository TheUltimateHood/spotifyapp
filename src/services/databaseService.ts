// Simple database service for web client
export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  format?: string;
  isVideo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
}

class DatabaseService {
  private baseUrl = '/api';

  async getAllTracks(): Promise<Track[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tracks`);
      if (!response.ok) throw new Error('Failed to fetch tracks');
      return await response.json();
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.getTracksFromStorage();
    }
  }

  async createTrack(track: Omit<Track, 'createdAt' | 'updatedAt'>): Promise<Track> {
    try {
      const response = await fetch(`${this.baseUrl}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track),
      });
      if (!response.ok) throw new Error('Failed to create track');
      return await response.json();
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.saveTrackToStorage(track);
    }
  }

  async deleteTrack(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tracks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete track');
      return true;
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.deleteTrackFromStorage(id);
    }
  }

  async clearAllTracks(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tracks`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear tracks');
      return true;
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.clearTracksFromStorage();
    }
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    try {
      const response = await fetch(`${this.baseUrl}/playlists`);
      if (!response.ok) throw new Error('Failed to fetch playlists');
      return await response.json();
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.getPlaylistsFromStorage();
    }
  }

  async createPlaylist(playlist: Omit<Playlist, 'createdAt' | 'updatedAt'>): Promise<Playlist> {
    try {
      const response = await fetch(`${this.baseUrl}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlist),
      });
      if (!response.ok) throw new Error('Failed to create playlist');
      return await response.json();
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.savePlaylistToStorage(playlist);
    }
  }

  async deletePlaylist(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/playlists/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete playlist');
      return true;
    } catch (error) {
      console.warn('Database not available, using localStorage');
      return this.deletePlaylistFromStorage(id);
    }
  }

  // LocalStorage fallback methods
  private getTracksFromStorage(): Track[] {
    try {
      const stored = localStorage.getItem('music_tracks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveTrackToStorage(track: Omit<Track, 'createdAt' | 'updatedAt'>): Track {
    const tracks = this.getTracksFromStorage();
    const newTrack: Track = {
      ...track,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tracks.push(newTrack);
    localStorage.setItem('music_tracks', JSON.stringify(tracks));
    return newTrack;
  }

  private deleteTrackFromStorage(id: string): boolean {
    const tracks = this.getTracksFromStorage();
    const filtered = tracks.filter(track => track.id !== id);
    localStorage.setItem('music_tracks', JSON.stringify(filtered));
    return true;
  }

  private clearTracksFromStorage(): boolean {
    localStorage.removeItem('music_tracks');
    return true;
  }

  private getPlaylistsFromStorage(): Playlist[] {
    try {
      const stored = localStorage.getItem('music_playlists');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private savePlaylistToStorage(playlist: Omit<Playlist, 'createdAt' | 'updatedAt'>): Playlist {
    const playlists = this.getPlaylistsFromStorage();
    const newPlaylist: Playlist = {
      ...playlist,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    playlists.push(newPlaylist);
    localStorage.setItem('music_playlists', JSON.stringify(playlists));
    return newPlaylist;
  }

  private deletePlaylistFromStorage(id: string): boolean {
    const playlists = this.getPlaylistsFromStorage();
    const filtered = playlists.filter(playlist => playlist.id !== id);
    localStorage.setItem('music_playlists', JSON.stringify(filtered));
    return true;
  }
}

export const databaseService = new DatabaseService();