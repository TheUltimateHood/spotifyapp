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
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#252525',
  },
});

export default ModernCard;