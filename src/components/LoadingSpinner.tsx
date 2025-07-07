import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { theme } from '../utils/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = theme.colors.primary 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const borderWidth = {
    small: 2,
    medium: 3,
    large: 4,
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { width: sizeMap[size], height: sizeMap[size] }]}>
        <div
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            border: `${borderWidth[size]}px solid ${theme.colors.surface}`,
            borderTop: `${borderWidth[size]}px solid ${color}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.spinner,
        {
          width: sizeMap[size],
          height: sizeMap[size],
          borderWidth: borderWidth[size],
          borderTopColor: color,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderRadius: 999,
    borderColor: theme.colors.surface,
  },
});

export default LoadingSpinner;