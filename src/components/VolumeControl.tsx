import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

const VolumeControl: React.FC = () => {
  const context = useMusicContext();
  const volume = context.volume || 1;
  const setVolume = context.setVolume;

  if (!setVolume) return null;

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return '🔇';
    if (volume < 0.5) return '🔉';
    return '🔊';
  };

  const WebVolumeSlider = () => (
    <View style={styles.webSliderContainer}>
      <TouchableOpacity onPress={() => handleVolumeChange(volume === 0 ? 1 : 0)}>
        <Text style={styles.volumeIcon}>{getVolumeIcon()}</Text>
      </TouchableOpacity>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => handleVolumeChange(Number(e.target.value))}
        style={{
          width: 120,
          height: 6,
          background: `linear-gradient(to right, #1ed760 0%, #1db954 ${volume * 100}%, #404040 ${volume * 100}%, #404040 100%)`,
          borderRadius: 3,
          outline: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer',
          marginLeft: 12,
          transition: 'all 0.2s ease',
        }}
        className="web-slider volume-slider"
      />
    </View>
  );

  if (Platform.OS === 'web') {
    return <WebVolumeSlider />;
  }

  // For native, we'll use buttons for now
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleVolumeChange(Math.max(0, volume - 0.1))}>
        <Text style={styles.volumeButton}>-</Text>
      </TouchableOpacity>
      <Text style={styles.volumeIcon}>{getVolumeIcon()}</Text>
      <TouchableOpacity onPress={() => handleVolumeChange(Math.min(1, volume + 0.1))}>
        <Text style={styles.volumeButton}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  webSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  volumeIcon: {
    fontSize: 22,
    marginHorizontal: 8,
  },
  volumeButton: {
    fontSize: 20,
    color: '#1db954',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '600',
  },
});

export default VolumeControl;