import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface GradientBackgroundProps {
  style?: ViewStyle;
  colors?: string[];
  children?: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  style, 
  colors = [theme.colors.background, '#1a1a1a', '#242424'],
  children 
}) => {
  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          styles.container, 
          style,
          {
            background: `linear-gradient(135deg, ${colors.join(', ')})`,
          } as any
        ]}
      >
        {children}
      </View>
    );
  }

  // For React Native, we'll use a simple gradient effect with overlapping views
  return (
    <View style={[styles.container, style]}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors[0] }]} />
      <View 
        style={[
          StyleSheet.absoluteFillObject, 
          { 
            backgroundColor: colors[1], 
            opacity: 0.5,
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