import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'green' | 'dark';
}

const ModernCard: React.FC<ModernCardProps> = ({ children, style, variant = 'default' }) => {
  const cardStyle = [
    styles.card,
    variant === 'green' && styles.greenCard,
    variant === 'dark' && styles.darkCard,
    style
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greenCard: {
    backgroundColor: '#1DB954',
  },
  darkCard: {
    backgroundColor: '#282828',
  },
});

export default ModernCard;