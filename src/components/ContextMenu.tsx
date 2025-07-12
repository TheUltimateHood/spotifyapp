import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Play, Plus, Heart, MoreHorizontal, List } from 'lucide-react';

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onPlay: () => void;
  onAddToPlaylist: () => void;
  onAddToFavorites: () => void;
  onQueue: () => void;
  position: { x: number; y: number };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  onPlay,
  onAddToPlaylist,
  onAddToFavorites,
  onQueue,
  position,
}) => {
  if (!visible) return null;

  const menuWidth = 180;
  const menuHeight = 200;

  // Adjust position to keep menu within screen bounds
  let adjustedX = position.x;
  let adjustedY = position.y;

  if (position.x + menuWidth > screenWidth) {
    adjustedX = screenWidth - menuWidth - 10;
  }

  if (position.y + menuHeight > screenHeight) {
    adjustedY = position.y - menuHeight;
  }

  // Ensure menu doesn't go above screen
  if (adjustedY < 0) {
    adjustedY = 10;
  }

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.menu, { top: adjustedY, left: adjustedX }]}>
          <TouchableOpacity style={styles.menuItem} onPress={onPlay}>
            <Play size={20} color="#fff" />
            <Text style={styles.menuText}>Play Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onQueue}>
            <List size={20} color="#fff" />
            <Text style={styles.menuText}>Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onAddToPlaylist}>
            <Plus size={20} color="#fff" />
            <Text style={styles.menuText}>Add to Playlist</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onAddToFavorites}>
            <Heart size={20} color="#fff" />
            <Text style={styles.menuText}>Add to Favorites</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#282828',
    borderRadius: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 10000,
    borderWidth: 1,
    borderColor: '#404040',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default ContextMenu;