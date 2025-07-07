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
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentTrack: {
    backgroundColor: '#282828',
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  artworkPlaceholder: {
    fontSize: 20,
    color: '#b3b3b3',
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  currentText: {
    color: '#1db954',
  },
  currentSubText: {
    color: '#1db954',
  },
  duration: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  durationText: {
    fontSize: 14,
    color: '#b3b3b3',
  },
});

export default TrackItem;