import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../utils/theme';

interface AnimatedMusicNoteProps {
  delay?: number;
}

const { width } = Dimensions.get('window');

const AnimatedMusicNote: React.FC<AnimatedMusicNoteProps> = ({ delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              delay: 2000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue, fadeAnim, delay]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 20, 0],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1, 0.6],
  });

  return (
    <Animated.Text
      style={[
        styles.note,
        {
          opacity: fadeAnim,
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
        },
      ]}
    >
      ♪
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    fontSize: 24,
    color: theme.colors.primary,
  },
});

export default AnimatedMusicNote;