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
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  elevated: {
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    }),
    backgroundColor: '#222',
    borderColor: '#444',
  },
});

export default ModernCard;