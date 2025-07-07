import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PlayerControls from '../components/PlayerControls';
import ProgressBar from '../components/ProgressBar';
import VolumeControl from '../components/VolumeControl';
import AudioVisualizer from '../components/AudioVisualizer';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

const { width } = Dimensions.get('window');

const PlayerScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentTrack, isPlaying } = useMusicContext();

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No track selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.artworkContainer}>
          <View style={styles.artwork}>
            <AudioVisualizer 
              isPlaying={isPlaying} 
              style={styles.visualizer}
            />
            <Text style={styles.artworkPlaceholder}>♪</Text>
          </View>
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar />
        </View>

        <View style={styles.controlsContainer}>
          <PlayerControls mini={false} />
        </View>
        
        <View style={styles.volumeContainer}>
          <VolumeControl />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300,
    maxHeight: 300,
  },
  artworkPlaceholder: {
    fontSize: 80,
    color: '#b3b3b3',
  },
  visualizer: {
    position: 'absolute',
    bottom: 20,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 18,
    color: '#b3b3b3',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 40,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  volumeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#b3b3b3',
  },
});

export default PlayerScreen;