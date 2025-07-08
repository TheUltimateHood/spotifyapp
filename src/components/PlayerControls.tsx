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
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },

  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },

  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  miniTrackInfo: {
    flex: 1,
    marginRight: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  miniArtist: {
    fontSize: 12,
    color: '#b3b3b3',
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1db954',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default PlayerControls;