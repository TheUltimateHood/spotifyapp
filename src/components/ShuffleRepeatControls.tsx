import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Shuffle, Repeat, Repeat1 } from 'lucide-react';

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
        return <Repeat1 size={20} color={repeatMode !== 'off' ? '#1db954' : '#666'} />;
      case 'all':
        return <Repeat size={20} color={repeatMode !== 'off' ? '#1db954' : '#666'} />;
      default:
        return <Repeat size={20} color="#666" />;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, shuffleMode && styles.buttonActive]}
        onPress={onToggleShuffle}
      >
        <Shuffle size={20} color={shuffleMode ? '#1db954' : '#666'} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, repeatMode !== 'off' && styles.buttonActive]}
        onPress={onToggleRepeat}
      >
        {getRepeatIcon()}
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

});

export default ShuffleRepeatControls;