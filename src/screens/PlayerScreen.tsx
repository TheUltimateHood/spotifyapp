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
import { ArrowLeft, Music } from 'lucide-react';
import PlayerControls from '../components/PlayerControls';
import ProgressBar from '../components/ProgressBar';
import VolumeControl from '../components/VolumeControl';
import AudioVisualizer from '../components/AudioVisualizer';
import GradientBackground from '../components/GradientBackground';

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

interface PlayerScreenProps {
  navigation?: any;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ navigation: navProp }) => {
  const navigation = Platform.OS === 'web' ? navProp : useNavigation();
  const context = useMusicContext();
  const { currentTrack, isPlaying, shuffleMode, repeatMode, toggleShuffle, toggleRepeat } = context;

  if (!currentTrack) {
    return (
      <GradientBackground style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyState}>
            <Music size={80} color="#404040" />
            <Text style={styles.emptyStateText}>No track selected</Text>
            <Text style={styles.emptyStateSubText}>Choose a song to start playing</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground style={styles.container} animated>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            className={Platform.OS === 'web' ? 'animated-button' : undefined}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.visualizerContainer}>
            <AudioVisualizer 
              isPlaying={isPlaying} 
              style={styles.visualizer}
            />
          </View>

          <View style={styles.trackInfo}>
            <Text style={[styles.trackTitle, Platform.OS === 'web' && { className: 'gradient-text' }]} numberOfLines={2}>
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
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#323232',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 40,
  },
  visualizer: {
    width: 200,
    height: 200,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  trackTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  trackArtist: {
    fontSize: 18,
    color: '#b3b3b3',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  controlsContainer: {
    marginBottom: 32,
  },
  shuffleRepeatContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  volumeContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#7d7d7d',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PlayerScreen;