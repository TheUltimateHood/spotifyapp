
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface PlayerControlsProps {
  mini?: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ mini = false }) => {
  const context = useMusicContext();
  const {
    isPlaying,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    shuffleMode,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
  } = context;

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return Repeat1;
      case 'all':
        return Repeat;
      default:
        return Repeat;
    }
  };

  const getRepeatColor = () => {
    return repeatMode !== 'off' ? '#1db954' : '#666';
  };

  if (mini) {
    return (
      <View style={styles.miniContainer}>
        <TouchableOpacity
          style={styles.miniButton}
          onPress={skipToPrevious}
        >
          <SkipBack size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.miniButton, styles.playButton]}
          onPress={togglePlayback}
        >
          {isPlaying ? (
            <Pause size={24} color="#000" />
          ) : (
            <Play size={24} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.miniButton}
          onPress={skipToNext}
        >
          <SkipForward size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const RepeatIcon = getRepeatIcon();

  return (
    <View style={styles.container}>
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={toggleShuffle}
        >
          <Shuffle 
            size={24} 
            color={shuffleMode ? '#1db954' : '#666'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={toggleRepeat}
        >
          <RepeatIcon 
            size={24} 
            color={getRepeatColor()}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mainControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipToPrevious}
        >
          <SkipBack size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={togglePlayback}
        >
          {isPlaying ? (
            <Pause size={36} color="#000" />
          ) : (
            <Play size={36} color="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipToNext}
        >
          <SkipForward size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  miniButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#1db954',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

export default PlayerControls;
