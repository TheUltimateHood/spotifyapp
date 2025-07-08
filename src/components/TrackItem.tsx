import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

// Platform-specific imports
let useMusicContext: any;
let Track: any;

if (Platform.OS === 'web') {
  const { useMusicContext: webContext, Track: WebTrack } = require('../context/WebMusicContext');
  useMusicContext = webContext;
  Track = WebTrack;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
  Track = require('react-native-track-player').Track;
}

interface TrackItemProps {
  track: Track;
  onPress: () => void;
  isCurrentTrack: boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, onPress, isCurrentTrack }) => {
  const { playTrack } = useMusicContext();

  const handlePress = async () => {
    await playTrack(track);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCurrentTrack && styles.currentTrack]}
      onPress={handlePress}
    >
      <View style={styles.artwork}>
        <Text style={styles.artworkPlaceholder}>♪</Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={[styles.title, isCurrentTrack && styles.currentText]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={[styles.artist, isCurrentTrack && styles.currentSubText]} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <View style={styles.duration}>
        <Text style={[styles.durationText, isCurrentTrack && styles.currentSubText]}>
          {isCurrentTrack ? '♪' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 8,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#282828',
  },
  currentTrack: {
    backgroundColor: '#282828',
    borderColor: '#1db954',
    borderWidth: 1,
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  artworkPlaceholder: {
    fontSize: 24,
    color: '#b3b3b3',
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  artist: {
    fontSize: 14,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  currentText: {
    color: '#1ed760',
    fontWeight: '700',
  },
  currentSubText: {
    color: '#1ed760',
    fontWeight: '600',
  },
  duration: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#323232',
  },
  durationText: {
    fontSize: 16,
    color: '#1db954',
    fontWeight: '600',
  },
});

export default TrackItem;