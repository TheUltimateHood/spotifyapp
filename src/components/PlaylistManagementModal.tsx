import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Music, 
  Check,
  Edit3 
} from 'lucide-react';

interface PlaylistManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string, trackIds: string[]) => void;
  tracks: any[];
  existingPlaylist?: any;
  isEditing?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isDesktop = screenWidth > 1024;

const PlaylistManagementModal: React.FC<PlaylistManagementModalProps> = ({
  visible,
  onClose,
  onCreatePlaylist,
  tracks,
  existingPlaylist,
  isEditing = false,
}) => {
  const [playlistName, setPlaylistName] = useState(existingPlaylist?.name || '');
  const [selectedTracks, setSelectedTracks] = useState<string[]>(
    existingPlaylist?.trackIds || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState(tracks);

  useEffect(() => {
    if (existingPlaylist) {
      setPlaylistName(existingPlaylist.name);
      setSelectedTracks(existingPlaylist.trackIds || []);
    }
  }, [existingPlaylist]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = tracks.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTracks(filtered);
    } else {
      setFilteredTracks(tracks);
    }
  }, [searchQuery, tracks]);

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const selectAllTracks = () => {
    setSelectedTracks(filteredTracks.map(track => track.id));
  };

  const clearSelection = () => {
    setSelectedTracks([]);
  };

  const handleSave = () => {
    if (playlistName.trim() && selectedTracks.length > 0) {
      onCreatePlaylist(playlistName.trim(), selectedTracks);
      resetForm();
      onClose();
    } else {
      Alert.alert(
        'Invalid Playlist',
        'Please enter a playlist name and select at least one track.'
      );
    }
  };

  const resetForm = () => {
    setPlaylistName('');
    setSelectedTracks([]);
    setSearchQuery('');
  };

  const handleClose = () => {
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  const renderTrack = ({ item }: { item: any }) => {
    const isSelected = selectedTracks.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.trackItem,
          isSelected && styles.trackItemSelected,
        ]}
        onPress={() => toggleTrackSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.trackIcon}>
          <Music size={isDesktop ? 20 : 16} color="#666" />
        </View>
        
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isSelected && styles.trackTitleSelected]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.trackArtist, isSelected && styles.trackArtistSelected]} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={16} color="#000" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            {isEditing ? (
              <Edit3 size={24} color="#1db954" />
            ) : (
              <Plus size={24} color="#1db954" />
            )}
          </View>
          <Text style={styles.title}>
            {isEditing ? 'Edit Playlist' : 'Create Playlist'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter playlist name..."
          placeholderTextColor="#666"
          value={playlistName}
          onChangeText={setPlaylistName}
          autoFocus={!isEditing}
        />

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracks..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.selectionControls}>
          <Text style={styles.selectionText}>
            {selectedTracks.length} of {filteredTracks.length} tracks selected
          </Text>
          <View style={styles.selectionButtons}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={selectAllTracks}
              activeOpacity={0.7}
            >
              <Text style={styles.selectionButtonText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={clearSelection}
              activeOpacity={0.7}
            >
              <Text style={styles.selectionButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleClose}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!playlistName.trim() || selectedTracks.length === 0) && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={!playlistName.trim() || selectedTracks.length === 0}
        activeOpacity={0.7}
      >
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Save Changes' : 'Create Playlist'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          {renderHeader()}
          
          <FlatList
            data={filteredTracks}
            renderItem={renderTrack}
            keyExtractor={(item) => item.id}
            style={styles.trackList}
            contentContainerStyle={styles.trackListContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
          
          {renderFooter()}
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
  content: {
    flex: 1,
  },
  contentDesktop: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  headerContainer: {
    backgroundColor: '#1a1a1a',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isDesktop ? 32 : 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: isDesktop ? 28 : isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  formContainer: {
    paddingHorizontal: isDesktop ? 32 : 20,
  },
  nameInput: {
    backgroundColor: '#282828',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isDesktop ? 16 : 14,
    fontSize: isDesktop ? 18 : 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isDesktop ? 12 : 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: isDesktop ? 16 : 14,
    color: '#fff',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  selectionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: isDesktop ? 16 : 14,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#404040',
    borderRadius: 20,
  },
  selectionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  trackList: {
    flex: 1,
  },
  trackListContent: {
    paddingHorizontal: isDesktop ? 32 : 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isDesktop ? 12 : 10,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trackItemSelected: {
    backgroundColor: '#1db954',
    borderColor: '#1db954',
  },
  trackIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: isDesktop ? 16 : 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  trackTitleSelected: {
    color: '#000',
  },
  trackArtist: {
    fontSize: isDesktop ? 14 : 12,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  trackArtistSelected: {
    color: '#000',
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: isDesktop ? 32 : 20,
    paddingVertical: 20,
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: isDesktop ? 16 : 14,
    backgroundColor: '#404040',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: isDesktop ? 18 : 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: isDesktop ? 16 : 14,
    backgroundColor: '#1db954',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: isDesktop ? 18 : 16,
    fontWeight: '600',
  },
});

export default PlaylistManagementModal;