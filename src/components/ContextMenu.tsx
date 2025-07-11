
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Plus, PlayCircle, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  track: any;
  onClose: () => void;
  onAddToQueue: (track: any) => void;
  onPlayNext: (track: any) => void;
  onRemoveFromPlaylist?: (track: any) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  track,
  onClose,
  onAddToQueue,
  onPlayNext,
  onRemoveFromPlaylist,
}) => {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Adjust position to stay within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 200;
      const menuHeight = 150;
      
      let adjustedX = x;
      let adjustedY = y;
      
      if (x + menuWidth > viewportWidth) {
        adjustedX = viewportWidth - menuWidth - 10;
      }
      
      if (y + menuHeight > viewportHeight) {
        adjustedY = viewportHeight - menuHeight - 10;
      }
      
      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  if (!visible) return null;

  const menuItems = [
    {
      label: 'Add to Queue',
      icon: Plus,
      action: () => {
        onAddToQueue(track);
        onClose();
      },
    },
    {
      label: 'Play Next',
      icon: PlayCircle,
      action: () => {
        onPlayNext(track);
        onClose();
      },
    },
  ];

  if (onRemoveFromPlaylist) {
    menuItems.push({
      label: 'Remove from Playlist',
      icon: Trash2,
      action: () => {
        onRemoveFromPlaylist(track);
        onClose();
      },
    });
  }

  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            backgroundColor: '#282828',
            borderRadius: 8,
            padding: 8,
            minWidth: 180,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            border: '1px solid #404040',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <IconComponent size={16} color="#fff" style={{ marginRight: 12 }} />
                <span style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, { left: position.x, top: position.y }]}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
                <IconComponent size={16} color="#fff" />
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default ContextMenu;
