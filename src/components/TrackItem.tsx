import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Trash2, MoreVertical } from 'lucide-react';
import ModernCard from './ModernCard';

// Platform-specific imports
let useMusicContext: any;
let Track: any;

if (Platform.OS === 'web') {
  const { useMusicContext: webContext, Track: WebTrack } = require('../context/WebMusicContext');
  useMusicContext = webContext;
  Track = WebTrack;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
  Track = require('react-native-track-player').Track;
}

interface TrackItemProps {
  track: Track;
  onPress: () => void;
  isCurrentTrack: boolean;
  showDeleteOption?: boolean;
}

const TrackItem: React.FC<TrackItemProps> = ({ 
  track, 
  onPress, 
  isCurrentTrack, 
  showDeleteOption = true 
}) => {
  const { playTrack, removeTrack } = useMusicContext();
  const [showMenu, setShowMenu] = useState(false);

  const handlePress = async () => {
    if (!showMenu) {
      onPress(); // Let the parent component handle selection mode vs playing
    }
    setShowMenu(false); // Close menu if it was open
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Song',
      `Are you sure you want to remove "${track.title}" from your library?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTrack(track.id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMenuPress = (e: any) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <ModernCard elevated={isCurrentTrack}>
      <View style={[styles.container, isCurrentTrack && styles.currentTrack]}>
        <TouchableOpacity
          style={styles.mainContent}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.trackInfo}>
            <Text style={[styles.title, isCurrentTrack && styles.currentText]} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={[styles.artist, isCurrentTrack && styles.currentSubText]} numberOfLines={1}>
              {track.artist}
            </Text>
          </View>
          <View style={[styles.status, isCurrentTrack && styles.currentStatus]}>
            <Text style={[styles.statusText, isCurrentTrack && styles.currentSubText]}>
              {isCurrentTrack ? '▶' : ''}
            </Text>
          </View>
        </TouchableOpacity>
        
        {showDeleteOption && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <MoreVertical size={16} color="#666" />
            </TouchableOpacity>
            
            {showMenu && (
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDeletePress}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#ff4444" />
                  <Text style={styles.menuItemText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    position: 'relative',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
    paddingLeft: 16,
    paddingVertical: 12,
  },
  currentTrack: {
    // ModernCard handles the styling now
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  artist: {
    fontSize: Platform.OS === 'web' ? 14 : 15,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  currentText: {
    color: '#fff',
    fontWeight: '700',
  },
  currentSubText: {
    color: '#e0e0e0',
    fontWeight: '600',
  },
  status: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
  currentStatus: {
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: 16,
    color: '#1db954',
    fontWeight: '700',
  },
  menuContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 120,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default TrackItem;