import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  variant?: 'default' | 'green' | 'primary';
}

const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  style, 
  elevated = false,
  variant = 'default'
}) => {
  const getWebClassName = () => {
    let className = 'modern-card';
    if (variant === 'green' || variant === 'primary') {
      className += ' green-bg-card';
    }
    return className;
  };

  return (
    <View style={[
      styles.card, 
      elevated && styles.elevated,
      variant === 'green' && styles.greenCard,
      variant === 'primary' && styles.greenCard,
      Platform.OS === 'web' && { className: getWebClassName() },
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
    minHeight: Platform.OS === 'web' ? 'auto' : 60,
  },
  elevated: {
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    }),
    backgroundColor: '#222',
    borderColor: '#444',
  },
  greenCard: {
    backgroundColor: '#1DB954',
    borderColor: '#1aa34a',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)',
    } : {
      shadowColor: '#1DB954',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    }),
  },
});

export default ModernCard;