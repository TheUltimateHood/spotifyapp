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
          width: 100,
          height: 4,
          background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume * 100}%, #404040 ${volume * 100}%, #404040 100%)`,
          borderRadius: 2,
          outline: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer',
          marginLeft: 8,
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
    padding: 8,
  },
  webSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  volumeIcon: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  volumeButton: {
    fontSize: 24,
    color: '#1db954',
    paddingHorizontal: 12,
  },
});

export default VolumeControl;