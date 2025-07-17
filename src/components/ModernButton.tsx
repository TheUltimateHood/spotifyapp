import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  icon: Icon,
}) => {
  // Determine text color based on background color
  const getTextColor = () => {
    if (textStyle?.color) return textStyle.color;
    if (disabled) return '#666666';

    // Check if style has a dark background
    const backgroundColor = style?.backgroundColor;
    if (backgroundColor === '#282828' || backgroundColor === '#333333' || backgroundColor === '#535353') {
      return '#FFFFFF';
    }

    // Default to black for green backgrounds
    return '#000000';
  };

  const getIconColor = () => {
    if (disabled) return '#666666';

    const backgroundColor = style?.backgroundColor;
    if (backgroundColor === '#282828' || backgroundColor === '#333333' || backgroundColor === '#535353') {
      return '#FFFFFF';
    }

    return '#000000';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      {Icon && <Icon size={20} color={getIconColor()} />}
      <Text style={[
        styles.buttonText,
        { color: getTextColor() },
        textStyle,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#282828',
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ModernButton;