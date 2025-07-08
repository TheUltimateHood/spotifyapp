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
} from 'react-native';
import { ListMusic, Plus } from 'lucide-react';
import TrackItem from '../components/TrackItem';
import SearchBar from '../components/SearchBar';
import AnimatedMusicNote from '../components/AnimatedMusicNote';
import PlaylistModal from '../components/PlaylistModal';

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

const LibraryScreen: React.FC<LibraryScreenProps> = ({ onTrackSelect }) => {
  const context = useMusicContext();
  const { tracks, addTracks, currentTrack, playlists, createPlaylist } = context;
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePlaylist = (name: string, trackIds: string[]) => {
    if (createPlaylist) {
      createPlaylist(name, trackIds);
    }
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
          input.accept = 'audio/*';
          input.multiple = true;
          input.style.display = 'none';
          
          input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = Array.from(target.files || []);
            
            const newTracks = files.map((file, index) => ({
              id: `track_${Date.now()}_${index}`,
              url: URL.createObjectURL(file),
              title: file.name.replace(/\.[^/.]+$/, '') || 'Unknown Track',
              artist: 'Unknown Artist',
              album: 'Unknown Album',
              file: file,
            }));
            
            addTracks(newTracks);
            Alert.alert('Success', `Added ${newTracks.length} track(s) to your library`);
            setLoading(false);
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
          type: [DocumentPicker.types.audio],
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

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TrackItem
      track={item}
      onPress={() => onTrackSelect(item)}
      isCurrentTrack={currentTrack?.id === item.id}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Your Library</Text>
          <View style={styles.headerButtons}>
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
          </View>
        </View>
        <SearchBar onSearch={handleSearch} placeholder="Search your library..." />
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
        <PlaylistModal
          visible={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          onCreatePlaylist={handleCreatePlaylist}
          tracks={tracks}
        />
      )}
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
});

export default LibraryScreen;