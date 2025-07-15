
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, Trash2, Check } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

interface TrackSelectionModalProps {
  visible: boolean;
  tracks: Track[];
  onConfirm: (selectedTrackIds: string[]) => void;
  onCancel: () => void;
}

const TrackSelectionModal: React.FC<TrackSelectionModalProps> = ({
  visible,
  tracks,
  onConfirm,
  onCancel,
}) => {
  const handleTrackSelect = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const handleTrackToggle = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTracks.length === tracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(tracks.map(track => track.id));
    }
  };

  const handleConfirm = () => {
    if (selectedTracks.length > 0) {
      onConfirm(selectedTracks);
      setSelectedTracks([]);
    }
  };

  const handleCancel = () => {
    setSelectedTracks([]);
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Songs to Delete</Text>
          <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
            <Text style={styles.selectAllText}>
              {selectedTracks.length === tracks.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {selectedTracks.length} of {tracks.length} songs selected
          </Text>
        </View>

        <ScrollView style={styles.trackList} showsVerticalScrollIndicator={false}>
          {tracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackItem,
                selectedTracks.includes(track.id) && styles.trackItemSelected
              ]}
              onPress={() => handleTrackToggle(track.id)}
            >
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist} • {formatDuration(track.duration)}
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                selectedTracks.includes(track.id) && styles.checkboxSelected
              ]}>
                {selectedTracks.includes(track.id) && (
                  <Check size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.deleteButton,
              selectedTracks.length === 0 && styles.deleteButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={selectedTracks.length === 0}
          >
            <Trash2 size={16} color="#fff" />
            <Text style={styles.deleteButtonText}>
              Delete {selectedTracks.length} Song{selectedTracks.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  selectAllButton: {
    padding: 8,
  },
  selectAllText: {
    color: '#1db954',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  summaryText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  trackList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginVertical: 4,
  },
  trackItemSelected: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#1db954',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1db954',
    borderColor: '#1db954',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#282828',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#404040',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrackSelectionModal;
