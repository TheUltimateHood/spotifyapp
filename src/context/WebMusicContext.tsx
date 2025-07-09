import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { webAudioPlayer } from '../utils/webAudioPlayer';
import { databaseService } from '../services/databaseService';

export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  file?: File;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: Date;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  tracks: Track[];
  position: number;
  duration: number;
  volume: number;
  shuffleMode: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playlists: Playlist[];
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  addTracks: (newTracks: Track[]) => void;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  removeTrack: (trackId: string) => void;
  clearTracks: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  createPlaylist: (name: string, trackIds: string[]) => void;
  deletePlaylist: (playlistId: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const WebMusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playQueue, setPlayQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    // Initialize audio player
    webAudioPlayer.setupPlayer();
    webAudioPlayer.setOnProgressUpdate((pos, dur) => {
      setPosition(pos);
      setDuration(dur);
    });
    webAudioPlayer.setOnStateChange((playing) => {
      setIsPlaying(playing);
    });

    // Load persisted data
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [persistedTracks, persistedPlaylists] = await Promise.all([
        databaseService.getAllTracks(),
        databaseService.getAllPlaylists(),
      ]);

      if (persistedTracks.length > 0) {
        setTracks(persistedTracks);
        console.log(`Loaded ${persistedTracks.length} tracks from storage`);
      }

      if (persistedPlaylists.length > 0) {
        setPlaylists(persistedPlaylists);
        console.log(`Loaded ${persistedPlaylists.length} playlists from storage`);
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  };

  const playTrack = async (track: Track) => {
    try {
      await webAudioPlayer.play(track.url, track.id);
      setCurrentTrack(track);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const pauseTrack = async () => {
    await webAudioPlayer.pause();
  };

  const resumeTrack = async () => {
    await webAudioPlayer.resume();
  };

  const seekTo = async (position: number) => {
    await webAudioPlayer.seekTo(position);
  };

  const setVolume = async (vol: number) => {
    await webAudioPlayer.setVolume(vol);
    setVolumeState(vol);
  };

  const addTracks = async (newTracks: Track[]) => {
    const savedTracks: Track[] = [];
    
    // Save each track to database/storage
    for (const track of newTracks) {
      try {
        const trackData = {
          id: track.id,
          url: track.url,
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork: track.artwork,
          duration: track.duration,
          fileName: track.file?.name,
          fileSize: track.file?.size,
          mimeType: track.file?.type,
          format: track.file?.name.split('.').pop()?.toUpperCase(),
          isVideo: track.file?.type.startsWith('video/') || false,
        };
        
        const savedTrack = await databaseService.createTrack(trackData);
        savedTracks.push({ ...track, ...savedTrack });
      } catch (error) {
        console.error('Error saving track:', error);
        savedTracks.push(track); // Fallback to memory-only
      }
    }
    
    setTracks(prevTracks => [...prevTracks, ...savedTracks]);
  };

  const removeTrack = async (trackId: string) => {
    try {
      await databaseService.deleteTrack(trackId);
    } catch (error) {
      console.error('Error deleting track from storage:', error);
    }
    
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      webAudioPlayer.pause();
    }
  };

  const clearTracks = async () => {
    try {
      await databaseService.clearAllTracks();
    } catch (error) {
      console.error('Error clearing tracks from storage:', error);
    }
    
    setTracks([]);
    setCurrentTrack(null);
    webAudioPlayer.pause();
  };

  const getNextTrack = () => {
    const queue = playQueue.length > 0 ? playQueue : tracks;
    if (queue.length === 0) return null;

    if (repeatMode === 'one') {
      return currentTrack;
    }

    let nextIndex: number;
    if (shuffleMode) {
      const availableIndices = queue
        .map((_, index) => index)
        .filter(index => index !== queueIndex);
      
      if (availableIndices.length === 0) {
        return repeatMode === 'all' ? queue[0] : null;
      }
      
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
      if (nextIndex === 0 && repeatMode !== 'all') {
        return null;
      }
    }

    setQueueIndex(nextIndex);
    return queue[nextIndex];
  };

  const nextTrack = async () => {
    const next = getNextTrack();
    if (next) {
      await playTrack(next);
    }
  };

  const previousTrack = async () => {
    const queue = playQueue.length > 0 ? playQueue : tracks;
    if (!currentTrack || queue.length === 0) return;
    
    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIndex);
    await playTrack(queue[prevIndex]);
  };

  const toggleShuffle = () => {
    setShuffleMode(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      switch (prev) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': return 'off';
      }
    });
  };

  const createPlaylist = async (name: string, trackIds: string[]) => {
    try {
      const playlistData = {
        id: `playlist_${Date.now()}`,
        name,
        trackIds,
      };
      
      const savedPlaylist = await databaseService.createPlaylist(playlistData);
      const newPlaylist: Playlist = {
        ...savedPlaylist,
        createdAt: new Date(savedPlaylist.createdAt),
      };
      
      setPlaylists(prev => [...prev, newPlaylist]);
    } catch (error) {
      console.error('Error saving playlist:', error);
      // Fallback to memory-only
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`,
        name,
        trackIds,
        createdAt: new Date(),
      };
      setPlaylists(prev => [...prev, newPlaylist]);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      await databaseService.deletePlaylist(playlistId);
    } catch (error) {
      console.error('Error deleting playlist from storage:', error);
    }
    
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        tracks,
        position,
        duration,
        volume,
        shuffleMode,
        repeatMode,
        playlists,
        playTrack,
        pauseTrack,
        resumeTrack,
        seekTo,
        setVolume,
        addTracks,
        nextTrack,
        previousTrack,
        removeTrack,
        clearTracks,
        toggleShuffle,
        toggleRepeat,
        createPlaylist,
        deletePlaylist,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};