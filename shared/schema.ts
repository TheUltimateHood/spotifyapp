import { pgTable, text, integer, timestamp, real, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tracks = pgTable('tracks', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album'),
  artwork: text('artwork'),
  duration: real('duration'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  format: text('format'),
  isVideo: boolean('is_video').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playlists = pgTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playlistTracks = pgTable('playlist_tracks', {
  id: text('id').primaryKey(),
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  trackId: text('track_id').notNull().references(() => tracks.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

// Relations
export const tracksRelations = relations(tracks, ({ many }) => ({
  playlistTracks: many(playlistTracks),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  playlistTracks: many(playlistTracks),
}));

export const playlistTracksRelations = relations(playlistTracks, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistTracks.playlistId],
    references: [playlists.id],
  }),
  track: one(tracks, {
    fields: [playlistTracks.trackId],
    references: [tracks.id],
  }),
}));

// Export types
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;
export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = typeof playlistTracks.$inferInsert;