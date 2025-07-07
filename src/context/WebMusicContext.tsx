import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    webAudioPlayer.setupPlayer();
    webAudioPlayer.setOnProgressUpdate((pos, dur) => {
      setPosition(pos);
      setDuration(dur);
    });
    webAudioPlayer.setOnStateChange((playing) => {
      setIsPlaying(playing);
    });
  }, []);

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

  const addTracks = (newTracks: Track[]) => {
    setTracks(prevTracks => [...prevTracks, ...newTracks]);
  };

  const removeTrack = (trackId: string) => {
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
    if (currentTrack?.id === trackId) {
      setCurrentTrack(null);
      webAudioPlayer.pause();
    }
  };

  const clearTracks = () => {
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

  const createPlaylist = (name: string, trackIds: string[]) => {
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      trackIds,
      createdAt: new Date(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
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