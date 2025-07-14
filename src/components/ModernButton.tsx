
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
    paddingVertical: 12,
    borderRadius: 25,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#555555',
  },
  dangerButton: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  disabledButton: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  dangerText: {
    color: '#ff4444',
  },
  disabledText: {
    color: '#666666',
  },
});

export default ModernButton;
