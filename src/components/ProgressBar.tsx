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

  const WebSlider = () => {
    const progress = (position / (duration || 1)) * 100;
    
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newPosition = Math.max(0, Math.min((clickX / rect.width) * (duration || 1), duration || 1));
      handleSeek(newPosition);
    };

    return (
      <div 
        onClick={handleProgressClick}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const hoverX = e.clientX - rect.left;
          const hoverProgress = (hoverX / rect.width) * 100;
          e.currentTarget.style.setProperty('--hover-progress', `${hoverProgress}%`);
        }}
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#404040',
          borderRadius: 4,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'height 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.height = '10px'}
        onMouseLeave={(e) => e.currentTarget.style.height = '8px'}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #1ed760, #1db954)',
            borderRadius: 4,
            transition: 'width 0.1s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${progress}%`,
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(29, 185, 84, 0.4)',
            opacity: 0.9,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
        />
      </div>
    );
  };

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
    paddingHorizontal: 8,
  },
  sliderContainer: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    width: 16,
    height: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#b3b3b3',
    fontWeight: '500',
  },
});

export default ProgressBar;