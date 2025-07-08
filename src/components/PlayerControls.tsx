import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

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
  mini: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ mini }) => {
  const { 
    currentTrack, 
    isPlaying, 
    pauseTrack, 
    resumeTrack, 
    nextTrack, 
    previousTrack 
  } = useMusicContext();

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  if (!currentTrack) {
    return null;
  }

  if (mini) {
    return (
      <View style={styles.miniContainer}>
        <View style={styles.miniTrackInfo}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.miniArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <View style={styles.miniControls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.miniPlayButton}>
            {isPlaying ? (
              <Pause size={18} color="#fff" fill="#fff" />
            ) : (
              <Play size={18} color="#fff" fill="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity onPress={previousTrack} style={styles.controlButton}>
          <SkipBack size={24} color="#fff" fill="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          {isPlaying ? (
            <Pause size={32} color="#fff" fill="#fff" />
          ) : (
            <Play size={32} color="#fff" fill="#fff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={nextTrack} style={styles.controlButton}>
          <SkipForward size={24} color="#fff" fill="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#323232',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#404040',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#1ed760',
  },
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#282828',
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  miniTrackInfo: {
    flex: 1,
    marginRight: 16,
  },
  miniTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  miniArtist: {
    fontSize: 13,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default PlayerControls;