import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Platform, View } from 'react-native';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ComponentType<any>;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  icon: Icon,
  style,
  textStyle,
  disabled = false,
  variant = 'primary'
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'danger' && styles.dangerButton,
    disabled && styles.disabledButton,
    style
  ];

  const titleStyle = [
    styles.text,
    variant === 'secondary' && styles.secondaryText,
    variant === 'danger' && styles.dangerText,
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {Icon && (
          <Icon 
            size={18} 
            color={variant === 'primary' ? '#000000' : variant === 'danger' ? '#ff4444' : '#FFFFFF'} 
            style={styles.icon}
          />
        )}
        <Text style={titleStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 48, // Improved touch target for mobile
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
      boxShadow: '0 3px 10px rgba(29, 185, 84, 0.4)',
      transition: 'all 0.2s ease',
    } : {
      shadowColor: '#1DB954',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  secondaryButton: {
    backgroundColor: '#333',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    }),
  },
  dangerButton: {
    backgroundColor: '#ff4444',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 3px 10px rgba(255, 68, 68, 0.4)',
    } : {
      shadowColor: '#ff4444',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    }),
  },
  disabledButton: {
    backgroundColor: '#666',
    ...(Platform.OS === 'web' ? {
      cursor: 'not-allowed',
      boxShadow: 'none',
    } : {
      shadowOpacity: 0,
      elevation: 0,
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#000000', // Always black for primary (green) buttons
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#999',
  },
});

export default ModernButton;