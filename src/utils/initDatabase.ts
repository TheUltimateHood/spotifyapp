import { sql } from 'drizzle-orm';

export const createTables = async (db: any) => {
  // Create tracks table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      artwork TEXT,
      duration REAL,
      file_name TEXT,
      file_size INTEGER,
      mime_type TEXT,
      format TEXT,
      is_video BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // Create playlists table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  // Create playlist_tracks junction table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id TEXT PRIMARY KEY,
      playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
      track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  console.log('Database tables created successfully');
};