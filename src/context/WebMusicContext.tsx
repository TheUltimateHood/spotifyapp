import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { webAudioPlayer } from '../utils/webAudioPlayer';

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
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
  updatePlaylistName?: (playlistId: string, newName: string) => void;
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
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
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

    // Set up auto-play next track when current track ends
    webAudioPlayer.setOnTrackEnded(() => {
      const currentQueue = playQueue.length > 0 ? playQueue : tracks;
      if (currentQueue.length > 0) {
        let nextIndex;
        if (shuffleMode) {
          // Random next track
          nextIndex = Math.floor(Math.random() * currentQueue.length);
        } else {
          // Sequential next track
          nextIndex = queueIndex + 1;
          if (nextIndex >= currentQueue.length) {
            if (repeatMode === 'all') {
              nextIndex = 0; // Loop back to first track
            } else {
              return; // End of playlist
            }
          }
        }

        if (nextIndex < currentQueue.length) {
          const nextTrack = currentQueue[nextIndex];
          setCurrentTrack(nextTrack);
          setQueueIndex(nextIndex);
          webAudioPlayer.loadTrack(nextTrack);
          webAudioPlayer.play();
        }
      }
    });

    // Load persisted data
    loadPersistedData();
  }, []);

  const loadPersistedData = () => {
    try {
      // Load tracks from localStorage
      const storedTracks = localStorage.getItem('music_tracks');
      if (storedTracks) {
        const parsedTracks = JSON.parse(storedTracks);
        setTracks(parsedTracks);
        console.log(`Loaded ${parsedTracks.length} tracks from localStorage`);
      }

      // Load playlists from localStorage  
      const storedPlaylists = localStorage.getItem('music_playlists');
      if (storedPlaylists) {
        const parsedPlaylists = JSON.parse(storedPlaylists).map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
        setPlaylists(parsedPlaylists);
        console.log(`Loaded ${parsedPlaylists.length} playlists from localStorage`);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  const playTrack = async (track: Track) => {
    try {
      await webAudioPlayer.play(track.url, track.id);
      setCurrentTrack(track);
    } catch (error) {
      console.error('Error playing track:', error);
      // You could add a toast notification here
      if (typeof window !== 'undefined') {
        window.alert(`Failed to play "${track.title}". The file may be corrupted or in an unsupported format.`);
      }
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

  const addTracks = (newTracks: Track[]) => {
    setTracks(prevTracks => {
      const updatedTracks = [...prevTracks, ...newTracks];
      // Save to localStorage
      localStorage.setItem('music_tracks', JSON.stringify(updatedTracks));
      return updatedTracks;
    });
  };

  const removeTrack = (trackId: string) => {
    setTracks(prevTracks => {
      const updatedTracks = prevTracks.filter(track => track.id !== trackId);
      // Save to localStorage
      localStorage.setItem('music_tracks', JSON.stringify(updatedTracks));
      return updatedTracks;
    });

    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      webAudioPlayer.pause();
    }
  };

  const clearTracks = () => {
    setTracks([]);
    setCurrentTrack(null);
    webAudioPlayer.pause();
    // Clear from localStorage
    localStorage.removeItem('music_tracks');
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
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const createPlaylist = (name: string, trackIds: string[]) => {
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      trackIds,
      createdAt: new Date(),
    };

    setPlaylists(prevPlaylists => {
      const updatedPlaylists = [...prevPlaylists, newPlaylist];
      // Save to localStorage
      localStorage.setItem('music_playlists', JSON.stringify(updatedPlaylists));
      return updatedPlaylists;
    });
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = prevPlaylists.filter(p => p.id !== playlistId);
      // Save to localStorage
      localStorage.setItem('music_playlists', JSON.stringify(updatedPlaylists));
      return updatedPlaylists;
    });
  };

  const addToQueue = (track: Track) => {
    setPlayQueue(prevQueue => [...prevQueue, track]);
  };

  const playNext = (track: Track) => {
    setPlayQueue(prevQueue => {
      const newQueue = [...prevQueue];
      newQueue.splice(queueIndex + 1, 0, track);
      return newQueue;
    });
  };

  const clearQueue = () => {
    setPlayQueue([]);
    setQueueIndex(0);
  };

  const removeFromQueue = (index: number) => {
    setPlayQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
    if (queueIndex >= index && queueIndex > 0) {
      setQueueIndex(prev => prev - 1);
    }
  };

  const updatePlaylistName = (playlistId: string, newName: string) => {
    setPlaylists(prevPlaylists => {
      const updatedPlaylists = prevPlaylists.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, name: newName }
          : playlist
      );
      // Save to localStorage
      localStorage.setItem('music_playlists', JSON.stringify(updatedPlaylists));
      return updatedPlaylists;
    });
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
        addToQueue,
        playNext,
        clearQueue,
        removeFromQueue,
        updatePlaylistName,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};