import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface MiniPlayerProps {
  onPress: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isDesktop = screenWidth > 1024;

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
  const { 
    currentTrack, 
    isPlaying, 
    pauseTrack, 
    resumeTrack, 
    nextTrack, 
    previousTrack 
  } = useMusicContext();

  const handlePlayPause = async (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  };

  const handleNext = async (e: any) => {
    e.stopPropagation();
    await nextTrack();
  };

  const handlePrevious = async (e: any) => {
    e.stopPropagation();
    await previousTrack();
  };

  if (!currentTrack) return null;

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <TouchableOpacity 
        style={styles.trackInfoSection}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <AudioVisualizer isPlaying={isPlaying} style={styles.visualizer} />
        <View style={styles.trackInfo}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop]} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={[styles.artist, isDesktop && styles.artistDesktop]} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.secondaryButton]} 
          onPress={handlePrevious}
          activeOpacity={0.7}
        >
          <SkipBack size={isDesktop ? 20 : 18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={handlePlayPause}
          activeOpacity={0.7}
        >
          {isPlaying ? (
            <Pause size={isDesktop ? 24 : 20} color="#000" />
          ) : (
            <Play size={isDesktop ? 24 : 20} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.secondaryButton]} 
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <SkipForward size={isDesktop ? 20 : 18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282828',
    borderTopWidth: 1,
    borderTopColor: '#404040',
    paddingHorizontal: isDesktop ? 24 : 16,
    paddingVertical: isDesktop ? 12 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        position: 'relative',
      },
      default: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 90 : 70, // Above bottom navigation
        left: 0,
        right: 0,
      },
    }),
  },
  containerDesktop: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  trackInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  visualizer: {
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  title: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  titleDesktop: {
    fontSize: 18,
  },
  artist: {
    fontSize: isTablet ? 14 : 12,
    color: '#b3b3b3',
  },
  artistDesktop: {
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isDesktop ? 16 : 12,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  playButton: {
    width: isDesktop ? 44 : 40,
    height: isDesktop ? 44 : 40,
    backgroundColor: '#1db954',
  },
  secondaryButton: {
    width: isDesktop ? 36 : 32,
    height: isDesktop ? 36 : 32,
    backgroundColor: '#404040',
  },
});

export default MiniPlayer;