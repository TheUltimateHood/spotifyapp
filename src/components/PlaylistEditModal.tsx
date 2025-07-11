
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Platform } from 'react-native';
import { Save, X, Edit3 } from 'lucide-react';

interface PlaylistEditModalProps {
  visible: boolean;
  playlist: any;
  onClose: () => void;
  onSave: (playlistId: string, newName: string) => void;
}

const PlaylistEditModal: React.FC<PlaylistEditModalProps> = ({
  visible,
  playlist,
  onClose,
  onSave,
}) => {
  const [playlistName, setPlaylistName] = useState(playlist?.name || '');

  React.useEffect(() => {
    if (playlist) {
      setPlaylistName(playlist.name);
    }
  }, [playlist]);

  const handleSave = () => {
    if (playlistName.trim() && playlist) {
      onSave(playlist.id, playlistName.trim());
      onClose();
    }
  };

  if (!visible || !playlist) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Edit3 size={24} color="#1db954" />
            <Text style={styles.title}>Edit Playlist</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Playlist Name</Text>
            <TextInput
              style={styles.input}
              value={playlistName}
              onChangeText={setPlaylistName}
              placeholder="Enter playlist name"
              placeholderTextColor="#666"
              autoFocus
              maxLength={50}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, !playlistName.trim() && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={!playlistName.trim()}
              >
                <Save size={16} color="#000" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#282828',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#404040',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#404040',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1db954',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PlaylistEditModal;
