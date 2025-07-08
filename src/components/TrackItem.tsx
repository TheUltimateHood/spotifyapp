import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import ModernCard from './ModernCard';

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
    <ModernCard elevated={isCurrentTrack}>
      <TouchableOpacity
        style={[styles.container, isCurrentTrack && styles.currentTrack]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.artwork, isCurrentTrack && styles.currentArtwork]}>
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
        <View style={[styles.duration, isCurrentTrack && styles.currentDuration]}>
          <Text style={[styles.durationText, isCurrentTrack && styles.currentSubText]}>
            {isCurrentTrack ? '▶' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  currentTrack: {
    // ModernCard handles the styling now
  },
  artwork: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  currentArtwork: {
    backgroundColor: '#1db954',
  },
  artworkPlaceholder: {
    fontSize: 26,
    color: '#b3b3b3',
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  artist: {
    fontSize: 16,
    color: '#b3b3b3',
    fontWeight: '600',
  },
  currentText: {
    color: '#fff',
    fontWeight: '700',
  },
  currentSubText: {
    color: '#e0e0e0',
    fontWeight: '600',
  },
  duration: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  currentDuration: {
    backgroundColor: '#1db954',
  },
  durationText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});

export default TrackItem;