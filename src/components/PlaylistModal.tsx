import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string, trackIds: string[]) => void;
  tracks: any[];
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  visible,
  onClose,
  onCreatePlaylist,
  tracks,
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleCreate = () => {
    if (playlistName.trim() && selectedTracks.length > 0) {
      onCreatePlaylist(playlistName.trim(), selectedTracks);
      setPlaylistName('');
      setSelectedTracks([]);
      onClose();
    }
  };

  const renderTrack = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.trackItem,
        selectedTracks.includes(item.id) && styles.trackItemSelected,
      ]}
      onPress={() => toggleTrackSelection(item.id)}
    >
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <View style={styles.checkbox}>
        {selectedTracks.includes(item.id) && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Playlist</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Playlist name..."
            placeholderTextColor="#666"
            value={playlistName}
            onChangeText={setPlaylistName}
            autoFocus
          />

          <Text style={styles.subtitle}>
            Select tracks ({selectedTracks.length} selected)
          </Text>

          <FlatList
            data={tracks}
            renderItem={renderTrack}
            keyExtractor={(item) => item.id}
            style={styles.trackList}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={[
              styles.createButton,
              (!playlistName.trim() || selectedTracks.length === 0) &&
                styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!playlistName.trim() || selectedTracks.length === 0}
          >
            <Text style={styles.createButtonText}>Create Playlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  input: {
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 12,
  },
  trackList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 8,
    marginBottom: 8,
  },
  trackItemSelected: {
    backgroundColor: '#1db954',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 12,
    color: '#b3b3b3',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#1db954',
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#666',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlaylistModal;