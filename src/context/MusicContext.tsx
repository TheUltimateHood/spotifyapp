import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TrackPlayer, { State, Track, usePlaybackState, useProgress, Event } from 'react-native-track-player';

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  tracks: Track[];
  position: number;
  duration: number;
  playTrack: (track: Track) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  addTracks: (newTracks: Track[]) => void;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  updateTrackMetadata?: (trackId: string, metadata: Partial<Track>) => void;
  clearTracks?: () => void;
  removeTrack?: (trackId: string) => void;
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

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const isPlaying = playbackState.state === State.Playing;

  useEffect(() => {
    const getCurrentTrack = async () => {
      try {
        const trackIndex = await TrackPlayer.getActiveTrackIndex();
        if (trackIndex !== undefined) {
          const track = await TrackPlayer.getTrack(trackIndex);
          setCurrentTrack(track);
        }
      } catch (error) {
        console.log('Error getting current track:', error);
      }
    };

    getCurrentTrack();

    // Set up event listener for track ended to auto-play next
    const trackEndedListener = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      try {
        const queue = await TrackPlayer.getQueue();
        const currentIndex = await TrackPlayer.getActiveTrackIndex();
        
        if (currentIndex !== undefined && currentIndex < queue.length - 1) {
          await TrackPlayer.skipToNext();
        }
      } catch (error) {
        console.log('Error auto-playing next track:', error);
      }
    });

    const trackChangedListener = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (data) => {
      if (data.track) {
        setCurrentTrack(data.track);
      }
    });

    return () => {
      trackEndedListener.remove();
      trackChangedListener.remove();
    };
  }, [playbackState]);

  const playTrack = async (track: Track) => {
    try {
      await TrackPlayer.reset();
      // Add all tracks to the queue for seamless playback
      if (tracks.length > 0) {
        await TrackPlayer.add(tracks);
        // Find the index of the selected track and skip to it
        const trackIndex = tracks.findIndex(t => t.id === track.id);
        if (trackIndex >= 0) {
          await TrackPlayer.skip(trackIndex);
        }
      } else {
        await TrackPlayer.add(track);
      }
      await TrackPlayer.play();
      setCurrentTrack(track);
    } catch (error) {
      console.log('Error playing track:', error);
    }
  };

  const pauseTrack = async () => {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.log('Error pausing track:', error);
    }
  };

  const resumeTrack = async () => {
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.log('Error resuming track:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.log('Error seeking:', error);
    }
  };

  const addTracks = (newTracks: Track[]) => {
    setTracks(prevTracks => [...prevTracks, ...newTracks]);
  };

  const nextTrack = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.log('Error skipping to next track:', error);
    }
  };

  const previousTrack = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.log('Error skipping to previous track:', error);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        tracks,
        position: progress.position,
        duration: progress.duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        seekTo,
        addTracks,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};