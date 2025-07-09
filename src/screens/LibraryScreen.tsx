import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Dimensions,
} from 'react-native';
import { ListMusic, Plus, Trash2 } from 'lucide-react';
import TrackItem from '../components/TrackItem';
import SearchBar from '../components/SearchBar';
import AnimatedMusicNote from '../components/AnimatedMusicNote';
import PlaylistManagementModal from '../components/PlaylistManagementModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { processMultipleAudioFiles } from '../utils/audioConverter';

// Platform-specific imports
let DocumentPicker: any;
let useMusicContext: any;
let Track: any;

if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
  Track = {} as any;
  DocumentPicker = null;
} else {
  DocumentPicker = require('react-native-document-picker').default;
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
  Track = require('react-native-track-player').Track;
}

interface LibraryScreenProps {
  onTrackSelect: (track: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isDesktop = screenWidth > 1024;

const LibraryScreen: React.FC<LibraryScreenProps> = ({ onTrackSelect }) => {
  const context = useMusicContext();
  const { tracks, addTracks, currentTrack, playlists, createPlaylist, clearTracks, removeTrack } = context;
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePlaylist = (name: string, trackIds: string[]) => {
    if (createPlaylist) {
      createPlaylist(name, trackIds);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTracks([]);
  };

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

  const deleteSelectedTracks = () => {
    if (selectedTracks.length === 0) return;

    Alert.alert(
      'Delete Songs',
      `Are you sure you want to delete ${selectedTracks.length} selected song(s) from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedTracks.forEach(trackId => removeTrack(trackId));
            setSelectedTracks([]);
            setIsSelectionMode(false);
            Alert.alert('Success', `Deleted ${selectedTracks.length} song(s) from your library`);
          },
        },
      ]
    );
  };

  const handleClearAllTracks = () => {
    setShowClearConfirmation(true);
  };

  const confirmClearAllTracks = () => {
    clearTracks();
    setShowClearConfirmation(false);
    setIsSelectionMode(false);
    setSelectedTracks([]);
    Alert.alert('Success', 'All songs have been removed from your library');
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTracks(tracks);
    } else {
      const filtered = tracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTracks(filtered);
    }
  }, [searchQuery, tracks]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to play music files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickAudioFiles = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        if (!fileInputRef.current) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'audio/*,video/*,.mp3,.wav,.flac,.ogg,.m4a,.aac,.wma,.mp4,.avi,.mov,.mkv,.webm,.3gp,.wmv,.asf,.amr,.aiff,.opus';
          input.multiple = true;
          input.style.display = 'none';
          
          input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = Array.from(target.files || []);
            
            console.log(`Starting to process ${files.length} files...`);
            
            try {
              const { successful, failed } = await processMultipleAudioFiles(files);
              
              console.log(`Processing complete: ${successful.length} successful, ${failed.length} failed`);
              
              if (successful.length > 0) {
                addTracks(successful);
              }
              
              let message = '';
              if (successful.length > 0) {
                message += `Added ${successful.length} track(s) to your library`;
              }
              if (failed.length > 0) {
                message += successful.length > 0 ? '\n' : '';
                message += `Failed to process ${failed.length} file(s): ${failed.map(f => f.file.name).join(', ')}`;
              }
              
              Alert.alert(successful.length > 0 ? 'Success' : 'Error', message);
            } catch (error) {
              console.error('Error processing files:', error);
              Alert.alert('Error', 'Failed to process audio files. Please try again.');
            } finally {
              setLoading(false);
            }
          };
          
          document.body.appendChild(input);
          fileInputRef.current = input;
        }
        
        fileInputRef.current.click();
      } else {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert('Permission Required', 'Storage permission is required to access music files.');
          return;
        }

        const results = await DocumentPicker.pick({
          type: [
            DocumentPicker.types.audio,
            'video/mp4',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav',
            'audio/flac',
            'audio/ogg',
            'audio/m4a',
            'audio/aac',
            'audio/wma',
            'public.audio'
          ],
          allowMultiSelection: true,
        });

        const newTracks = results.map((result, index) => ({
          id: `track_${Date.now()}_${index}`,
          url: result.uri,
          title: result.name?.replace(/\.[^/.]+$/, '') || 'Unknown Track',
          artist: 'Unknown Artist',
          album: 'Unknown Album',
          artwork: undefined,
        }));

        addTracks(newTracks);
        Alert.alert('Success', `Added ${newTracks.length} track(s) to your library`);
      }
    } catch (error) {
      if (Platform.OS !== 'web' && DocumentPicker?.isCancel(error)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking files:', error);
        Alert.alert('Error', 'Failed to pick audio files. Please try again.');
      }
    } finally {
      if (Platform.OS !== 'web') {
        setLoading(false);
      }
    }
  };

  const renderTrackItem = ({ item }: { item: Track }) => {
    const isSelected = selectedTracks.includes(item.id);
    
    return (
      <View style={[styles.trackItemContainer, isSelected && styles.trackItemSelected]}>
        {isSelectionMode && (
          <TouchableOpacity
            style={styles.selectionCheckbox}
            onPress={() => toggleTrackSelection(item.id)}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.trackItemContent}>
          <TrackItem
            track={item}
            onPress={async () => {
              if (isSelectionMode) {
                toggleTrackSelection(item.id);
              } else {
                await context.playTrack(item);
                onTrackSelect(item);
              }
            }}
            isCurrentTrack={currentTrack?.id === item.id}
            showDeleteOption={!isSelectionMode}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>
            {isSelectionMode ? `${selectedTracks.length} Selected` : 'Your Library'}
          </Text>
          <View style={styles.headerButtons}>
            {isSelectionMode ? (
              <>
                <TouchableOpacity
                  style={[styles.headerButton, styles.selectAllButton]}
                  onPress={selectAllTracks}
                >
                  <Text style={styles.headerButtonText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerButton, styles.clearButton]}
                  onPress={clearSelection}
                >
                  <Text style={styles.headerButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerButton, styles.deleteButton]}
                  onPress={deleteSelectedTracks}
                  disabled={selectedTracks.length === 0}
                >
                  <Trash2 size={16} color={selectedTracks.length > 0 ? "#fff" : "#666"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerButton, styles.cancelButton]}
                  onPress={toggleSelectionMode}
                >
                  <Text style={styles.headerButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {tracks.length > 0 && (
                  <TouchableOpacity
                    style={[styles.headerButton, styles.selectionModeButton]}
                    onPress={toggleSelectionMode}
                  >
                    <Trash2 size={16} color="#fff" />
                  </TouchableOpacity>
                )}
                {tracks.length > 0 && createPlaylist && (
                  <TouchableOpacity 
                    style={[styles.addButton, styles.playlistButton]} 
                    onPress={() => setShowPlaylistModal(true)}
                  >
                    <ListMusic size={16} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={pickAudioFiles}
                  disabled={loading}
                >
                  {loading ? (
                    <Text style={styles.addButtonText}>Loading...</Text>
                  ) : (
                    <>
                      <Plus size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.addButtonText}>Add Music</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        {!isSelectionMode && (
          <SearchBar onSearch={handleSearch} placeholder="Search your library..." />
        )}
      </View>

      {tracks.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.animatedNotesContainer}>
            <AnimatedMusicNote delay={0} />
            <AnimatedMusicNote delay={500} />
            <AnimatedMusicNote delay={1000} />
          </View>
          <Text style={styles.emptyStateTitle}>No Music Added</Text>
          <Text style={styles.emptyStateText}>
            Tap "Add Music" to choose audio files from your device
          </Text>
        </View>
      ) : filteredTracks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          style={styles.trackList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.trackListContent}
        />
      )}
      
      {createPlaylist && (
        <PlaylistManagementModal
          visible={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          onCreatePlaylist={handleCreatePlaylist}
          tracks={tracks}
        />
      )}
      
      <ConfirmationModal
        visible={showClearConfirmation}
        title="Clear All Music"
        message="This action will permanently remove all songs from your library. This cannot be undone."
        confirmationText="Delete all songs in library"
        onConfirm={confirmClearAllTracks}
        onCancel={() => setShowClearConfirmation(false)}
        destructive={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#1db954',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  playlistButton: {
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trackList: {
    flex: 1,
  },
  trackListContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  animatedNotesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 24,
  },
  trackItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  trackItemSelected: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  selectionCheckbox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1db954',
    borderColor: '#1db954',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trackItemContent: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectAllButton: {
    backgroundColor: '#1db954',
  },
  clearButton: {
    backgroundColor: '#333',
  },
  deleteButton: {
    backgroundColor: '#e22134',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  selectionModeButton: {
    backgroundColor: '#333',
  },
});

export default LibraryScreen;