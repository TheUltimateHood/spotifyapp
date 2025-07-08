import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface GradientBackgroundProps {
  style?: ViewStyle;
  colors?: string[];
  children?: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'diagonal';
  animated?: boolean;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  style, 
  colors = [theme.colors.background, theme.colors.backgroundSecondary, theme.colors.backgroundTertiary],
  children,
  direction = 'diagonal',
  animated = false
}) => {
  const getDirection = () => {
    switch (direction) {
      case 'vertical': return '180deg';
      case 'horizontal': return '90deg';
      case 'diagonal': return '135deg';
      default: return '135deg';
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          styles.container, 
          style,
          {
            background: `linear-gradient(${getDirection()}, ${colors.join(', ')})`,
            position: 'relative',
            overflow: 'hidden',
          } as any
        ]}
      >
        {animated && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(600px circle at 50% 50%, rgba(29, 185, 84, 0.05), transparent 40%),
                radial-gradient(800px circle at 80% 20%, rgba(255, 107, 107, 0.03), transparent 50%)
              `,
              zIndex: 0,
            } as any}
          />
        )}
        <View style={{ position: 'relative', zIndex: 1, flex: 1 } as any}>
          {children}
        </View>
      </View>
    );
  }

  // For React Native, we'll use a layered gradient effect
  return (
    <View style={[styles.container, style]}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors[0] }]} />
      <View 
        style={[
          StyleSheet.absoluteFillObject, 
          { 
            backgroundColor: colors[1], 
            opacity: 0.6,
            transform: [{ translateY: 50 }],
          }
        ]} 
      />
      <View 
        style={[
          StyleSheet.absoluteFillObject, 
          { 
            backgroundColor: colors[2] || colors[1], 
            opacity: 0.3,
            transform: [{ translateY: 100 }],
          }
        ]} 
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GradientBackground;