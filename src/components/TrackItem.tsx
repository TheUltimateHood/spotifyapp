import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Play, Pause, MoreVertical } from 'lucide-react';
import ContextMenu from './ContextMenu';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface TrackItemProps {
  track: any;
  onPress: () => void;
  isCurrentTrack?: boolean;
  onRemoveFromPlaylist?: (track: any) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  onPress,
  isCurrentTrack = false,
  onRemoveFromPlaylist,
}) => {
  const context = useMusicContext();
  const { isPlaying, addToQueue, playNext } = context;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleMorePress = (event: any) => {
    if (Platform.OS === 'web') {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.right - 200, y: rect.bottom });
    } else {
      setMenuPosition({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    }
    setShowContextMenu(true);
  };

  const isTrackPlaying = isCurrentTrack && isPlaying;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          isCurrentTrack && styles.currentTrack,
        ]}
        onPress={async () => {
          // Play the track using context
          if (context?.playTrack) {
            await context.playTrack(track);
          }
          // Call the original onPress if provided
          if (onPress) {
            onPress();
          }
        }}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPress}
        >
          {isTrackPlaying ? (
            <Pause size={16} color="#1db954" />
          ) : (
            <Play size={16} color="#1db954" />
          )}
        </TouchableOpacity>

        <View style={styles.trackInfo}>
          <Text 
            style={[
              styles.trackTitle,
              isCurrentTrack && styles.currentTrackTitle,
            ]} 
            numberOfLines={1}
          >
            {track.title}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={handleMorePress}
        >
          <MoreVertical size={20} color="#b3b3b3" />
        </TouchableOpacity>
      </TouchableOpacity>

      <ContextMenu
        visible={showContextMenu}
        x={menuPosition.x}
        y={menuPosition.y}
        track={track}
        onClose={() => setShowContextMenu(false)}
        onAddToQueue={() => {
          setShowContextMenu(false);
          if (context?.addToQueue) {
            context.addToQueue(track);
          }
        }}
        onPlayNext={playNext}
        onRemoveFromPlaylist={onRemoveFromPlaylist}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    marginBottom: 1,
    borderRadius: 8,
  },
  currentTrack: {
    backgroundColor: '#2a2a2a',
    borderLeftWidth: 4,
    borderLeftColor: '#1db954',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  currentTrackTitle: {
    color: '#1db954',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TrackItem;