import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';

interface AudioVisualizerProps {
  isPlaying: boolean;
  style?: any;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, style }) => {
  const bars = Array.from({ length: 5 });
  const animations = useRef(bars.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isPlaying) {
      animations.forEach((anim, index) => {
        const createAnimation = () => {
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 200 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 200 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (isPlaying) {
              createAnimation();
            }
          });
        };
        
        setTimeout(() => createAnimation(), index * 100);
      });
    } else {
      animations.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying, animations]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        {bars.map((_, index) => (
          <div
            key={index}
            style={{
              width: 4,
              height: 30,
              backgroundColor: '#1db954',
              marginHorizontal: 2,
              borderRadius: 2,
              transformOrigin: 'bottom',
              transform: `scaleY(${isPlaying ? 1 : 0.3})`,
              animation: isPlaying ? `visualizer-bar ${0.5 + index * 0.1}s ease-in-out infinite alternate` : 'none',
            }}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    paddingHorizontal: 8,
  },
  bar: {
    width: 4,
    height: 30,
    backgroundColor: '#1db954',
    marginHorizontal: 2,
    borderRadius: 2,
  },
});

export default AudioVisualizer;