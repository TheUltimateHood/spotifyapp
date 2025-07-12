export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  metadata?: {
    spotifyId?: string;
    artistName?: string;
    albumArt?: string;
    isManuallyLabeled?: boolean;
  };
}

export interface PlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
  bufferedPosition: number;
}

export interface MusicState {
  currentTrack: Track | null;
  tracks: Track[];
  playbackState: PlaybackState;
  isLoading: boolean;
}

export type RootStackParamList = {
  Home: undefined;
  Player: undefined;
};