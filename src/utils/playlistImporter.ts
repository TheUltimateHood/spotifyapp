
import { google } from 'googleapis';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface TrackData {
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  filePath: string;
  metadata: any;
}

interface PlaylistResult {
  playlistName: string;
  tracks: TrackData[];
  totalTracks: number;
  successfulDownloads: number;
  failedDownloads: string[];
}

/**
 * YouTube Playlist Importer
 * Downloads audio from YouTube playlist using yt-dlp
 */
export async function importYouTubePlaylist(playlistUrl: string, apiKey: string): Promise<PlaylistResult> {
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey
  });

  // Extract playlist ID from URL
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error('Invalid YouTube playlist URL');
  }

  // Create downloads directory
  const downloadDir = path.join(process.cwd(), 'downloads', 'youtube', playlistId);
  await fs.promises.mkdir(downloadDir, { recursive: true });

  try {
    // Get playlist info
    const playlistResponse = await youtube.playlists.list({
      part: ['snippet'],
      id: [playlistId]
    });

    const playlistName = playlistResponse.data.items?.[0]?.snippet?.title || 'Unknown Playlist';

    // Get all playlist items
    let allItems: any[] = [];
    let nextPageToken: string | undefined;

    do {
      const itemsResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      });

      if (itemsResponse.data.items) {
        allItems = allItems.concat(itemsResponse.data.items);
      }
      nextPageToken = itemsResponse.data.nextPageToken || undefined;
    } while (nextPageToken);

    const tracks: TrackData[] = [];
    const failedDownloads: string[] = [];

    // Download each track
    for (const item of allItems) {
      const videoId = item.contentDetails?.videoId;
      const title = item.snippet?.title || 'Unknown Title';
      const channelTitle = item.snippet?.videoOwnerChannelTitle || 'Unknown Artist';

      if (!videoId) {
        failedDownloads.push(`${title} - No video ID`);
        continue;
      }

      try {
        console.log(`Downloading: ${title}`);
        
        // Use yt-dlp to download audio
        const outputPath = path.join(downloadDir, `${videoId}.%(ext)s`);
        const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "https://www.youtube.com/watch?v=${videoId}"`;
        
        await execAsync(command);

        // Find the downloaded file
        const files = await fs.promises.readdir(downloadDir);
        const downloadedFile = files.find(file => file.startsWith(videoId) && file.endsWith('.mp3'));
        
        if (downloadedFile) {
          const filePath = path.join(downloadDir, downloadedFile);
          
          tracks.push({
            title: title,
            artist: channelTitle,
            filePath: filePath,
            metadata: {
              videoId: videoId,
              originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
              playlistId: playlistId,
              position: item.snippet?.position
            }
          });
        } else {
          failedDownloads.push(`${title} - Download completed but file not found`);
        }
      } catch (error) {
        console.error(`Failed to download ${title}:`, error);
        failedDownloads.push(`${title} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      playlistName,
      tracks,
      totalTracks: allItems.length,
      successfulDownloads: tracks.length,
      failedDownloads
    };

  } catch (error) {
    throw new Error(`Failed to import YouTube playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Spotify Playlist Importer
 * Gets metadata from Spotify and searches/downloads from YouTube
 */
export async function importSpotifyPlaylist(
  playlistUrl: string, 
  spotifyClientId: string, 
  spotifyClientSecret: string,
  youtubeApiKey: string
): Promise<PlaylistResult> {
  // Extract playlist ID from Spotify URL
  const playlistId = extractSpotifyPlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error('Invalid Spotify playlist URL');
  }

  // Create downloads directory
  const downloadDir = path.join(process.cwd(), 'downloads', 'spotify', playlistId);
  await fs.promises.mkdir(downloadDir, { recursive: true });

  try {
    // Get Spotify access token
    const spotifyToken = await getSpotifyAccessToken(spotifyClientId, spotifyClientSecret);
    
    // Get playlist info and tracks from Spotify
    const playlistData = await getSpotifyPlaylistData(playlistId, spotifyToken);
    
    const tracks: TrackData[] = [];
    const failedDownloads: string[] = [];

    // Search and download each track from YouTube
    for (const spotifyTrack of playlistData.tracks) {
      const searchQuery = `${spotifyTrack.name} ${spotifyTrack.artists.join(' ')}`;
      
      try {
        console.log(`Searching YouTube for: ${searchQuery}`);
        
        // Search YouTube for the track
        const youtubeVideoId = await searchYouTubeForTrack(searchQuery, youtubeApiKey);
        
        if (!youtubeVideoId) {
          failedDownloads.push(`${spotifyTrack.name} - Not found on YouTube`);
          continue;
        }

        // Download from YouTube
        const outputPath = path.join(downloadDir, `${youtubeVideoId}.%(ext)s`);
        const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "https://www.youtube.com/watch?v=${youtubeVideoId}"`;
        
        await execAsync(command);

        // Find the downloaded file
        const files = await fs.promises.readdir(downloadDir);
        const downloadedFile = files.find(file => file.startsWith(youtubeVideoId) && file.endsWith('.mp3'));
        
        if (downloadedFile) {
          const filePath = path.join(downloadDir, downloadedFile);
          
          tracks.push({
            title: spotifyTrack.name,
            artist: spotifyTrack.artists.join(', '),
            album: spotifyTrack.album,
            duration: spotifyTrack.duration_ms,
            filePath: filePath,
            metadata: {
              spotifyId: spotifyTrack.id,
              youtubeVideoId: youtubeVideoId,
              youtubeUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
              spotifyUrl: spotifyTrack.external_urls?.spotify,
              albumArt: spotifyTrack.album_art,
              popularity: spotifyTrack.popularity,
              explicit: spotifyTrack.explicit
            }
          });
        } else {
          failedDownloads.push(`${spotifyTrack.name} - Download completed but file not found`);
        }
      } catch (error) {
        console.error(`Failed to download ${spotifyTrack.name}:`, error);
        failedDownloads.push(`${spotifyTrack.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      playlistName: playlistData.name,
      tracks,
      totalTracks: playlistData.tracks.length,
      successfulDownloads: tracks.length,
      failedDownloads
    };

  } catch (error) {
    throw new Error(`Failed to import Spotify playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions

function extractPlaylistId(url: string): string | null {
  const match = url.match(/[&?]list=([^&]+)/);
  return match ? match[1] : null;
}

function extractSpotifyPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function getSpotifyAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await axios.post('https://accounts.spotify.com/api/token', 
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  return response.data.access_token;
}

async function getSpotifyPlaylistData(playlistId: string, accessToken: string) {
  const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const playlist = response.data;
  const tracks = playlist.tracks.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    artists: item.track.artists.map((artist: any) => artist.name),
    album: item.track.album.name,
    duration_ms: item.track.duration_ms,
    popularity: item.track.popularity,
    explicit: item.track.explicit,
    external_urls: item.track.external_urls,
    album_art: item.track.album.images?.[0]?.url
  }));

  return {
    name: playlist.name,
    tracks
  };
}

async function searchYouTubeForTrack(query: string, apiKey: string): Promise<string | null> {
  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey
  });

  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: 1,
      videoCategoryId: '10' // Music category
    });

    const items = response.data.items;
    if (items && items.length > 0) {
      return items[0].id?.videoId || null;
    }
    
    return null;
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

// Usage example:
export async function example() {
  try {
    // YouTube playlist import
    const youtubeResult = await importYouTubePlaylist(
      'https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID',
      'YOUR_YOUTUBE_API_KEY'
    );
    
    console.log('YouTube Import Result:', youtubeResult);

    // Spotify playlist import
    const spotifyResult = await importSpotifyPlaylist(
      'https://open.spotify.com/playlist/YOUR_PLAYLIST_ID',
      'YOUR_SPOTIFY_CLIENT_ID',
      'YOUR_SPOTIFY_CLIENT_SECRET',
      'YOUR_YOUTUBE_API_KEY'
    );
    
    console.log('Spotify Import Result:', spotifyResult);
    
  } catch (error) {
    console.error('Import error:', error);
  }
}
