import { tracks, playlists, playlistTracks, type Track, type InsertTrack, type Playlist, type InsertPlaylist, type PlaylistTrack, type InsertPlaylistTrack } from '../shared/schema';
import { db } from './db';
import { eq, desc, asc } from 'drizzle-orm';

export interface IStorage {
  // Track operations
  getAllTracks(): Promise<Track[]>;
  getTrack(id: string): Promise<Track | undefined>;
  createTrack(insertTrack: InsertTrack): Promise<Track>;
  updateTrack(id: string, updates: Partial<InsertTrack>): Promise<Track | undefined>;
  deleteTrack(id: string): Promise<boolean>;
  clearAllTracks(): Promise<boolean>;

  // Playlist operations
  getAllPlaylists(): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  
  // Playlist-Track operations
  getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]>;
  addTrackToPlaylist(playlistId: string, trackId: string, position?: number): Promise<PlaylistTrack>;
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<boolean>;
  clearPlaylist(playlistId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Track operations
  async getAllTracks(): Promise<Track[]> {
    return await db.select().from(tracks).orderBy(desc(tracks.createdAt));
  }

  async getTrack(id: string): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track || undefined;
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const [track] = await db
      .insert(tracks)
      .values({
        ...insertTrack,
        updatedAt: new Date(),
      })
      .returning();
    return track;
  }

  async updateTrack(id: string, updates: Partial<InsertTrack>): Promise<Track | undefined> {
    const [track] = await db
      .update(tracks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, id))
      .returning();
    return track || undefined;
  }

  async deleteTrack(id: string): Promise<boolean> {
    const result = await db.delete(tracks).where(eq(tracks.id, id));
    return result.rowCount > 0;
  }

  async clearAllTracks(): Promise<boolean> {
    const result = await db.delete(tracks);
    return result.rowCount >= 0; // Even 0 rows deleted is considered success
  }

  // Playlist operations
  async getAllPlaylists(): Promise<Playlist[]> {
    return await db.select().from(playlists).orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist || undefined;
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db
      .insert(playlists)
      .values({
        ...insertPlaylist,
        updatedAt: new Date(),
      })
      .returning();
    return playlist;
  }

  async updatePlaylist(id: string, updates: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const [playlist] = await db
      .update(playlists)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(playlists.id, id))
      .returning();
    return playlist || undefined;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const result = await db.delete(playlists).where(eq(playlists.id, id));
    return result.rowCount > 0;
  }

  // Playlist-Track operations
  async getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    return await db
      .select()
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(asc(playlistTracks.position));
  }

  async addTrackToPlaylist(playlistId: string, trackId: string, position: number = 0): Promise<PlaylistTrack> {
    const [playlistTrack] = await db
      .insert(playlistTracks)
      .values({
        id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        playlistId,
        trackId,
        position,
      })
      .returning();
    return playlistTrack;
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    const result = await db
      .delete(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId) && eq(playlistTracks.trackId, trackId));
    return result.rowCount > 0;
  }

  async clearPlaylist(playlistId: string): Promise<boolean> {
    const result = await db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
    return result.rowCount >= 0;
  }
}

export const storage = new DatabaseStorage();