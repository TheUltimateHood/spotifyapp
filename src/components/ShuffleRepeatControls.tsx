import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ShuffleRepeatControlsProps {
  shuffleMode: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

const ShuffleRepeatControls: React.FC<ShuffleRepeatControlsProps> = ({
  shuffleMode,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return '🔂';
      case 'all':
        return '🔁';
      default:
        return '↻';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, shuffleMode && styles.buttonActive]}
        onPress={onToggleShuffle}
      >
        <Text style={[styles.icon, shuffleMode && styles.iconActive]}>🔀</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, repeatMode !== 'off' && styles.buttonActive]}
        onPress={onToggleRepeat}
      >
        <Text style={[styles.icon, repeatMode !== 'off' && styles.iconActive]}>
          {getRepeatIcon()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
  },
  icon: {
    fontSize: 20,
    color: '#666',
  },
  iconActive: {
    color: '#1db954',
  },
});

export default ShuffleRepeatControls;