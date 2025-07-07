import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Platform-specific imports
let Slider: any;
let useMusicContext: any;

if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
  // For web, we'll create a custom slider
} else {
  Slider = require('react-native-slider').default;
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

const ProgressBar: React.FC = () => {
  const { position, duration, seekTo } = useMusicContext();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number) => {
    seekTo(value);
  };

  const WebSlider = () => (
    <input
      type="range"
      min={0}
      max={duration || 1}
      value={position}
      onChange={(e) => handleSeek(Number(e.target.value))}
      style={{
        width: '100%',
        height: 6,
        background: `linear-gradient(to right, #1db954 0%, #1db954 ${(position / (duration || 1)) * 100}%, #404040 ${(position / (duration || 1)) * 100}%, #404040 100%)`,
        borderRadius: 3,
        outline: 'none',
        WebkitAppearance: 'none',
        cursor: 'pointer',
      }}
      className="web-slider"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        {Platform.OS === 'web' ? (
          <WebSlider />
        ) : (
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#1db954"
            maximumTrackTintColor="#404040"
            thumbStyle={styles.thumb}
          />
        )}
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    width: 15,
    height: 15,
    backgroundColor: '#1db954',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#b3b3b3',
  },
});

export default ProgressBar;