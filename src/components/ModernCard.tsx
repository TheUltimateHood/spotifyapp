import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({ children, style, elevated = false }) => {
  return (
    <View style={[
      styles.card, 
      elevated && styles.elevated,
      Platform.OS === 'web' && { className: 'modern-card' },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#404040',
  },
  elevated: {
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: '#333333',
    borderColor: '#1db954',
  },
});

export default ModernCard;