
import { Animated, Platform } from 'react-native';

export const createWebSafeAnimated = {
  timing: (value: Animated.Value, config: any) => {
    // Remove useNativeDriver for web platform
    const webConfig = Platform.OS === 'web' 
      ? { ...config, useNativeDriver: false }
      : config;
    
    return Animated.timing(value, webConfig);
  },
  
  spring: (value: Animated.Value, config: any) => {
    const webConfig = Platform.OS === 'web' 
      ? { ...config, useNativeDriver: false }
      : config;
    
    return Animated.spring(value, webConfig);
  },
  
  Value: Animated.Value,
  View: Animated.View,
};

export default createWebSafeAnimated;
