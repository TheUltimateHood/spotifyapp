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
import { useNavigation } from '@react-navigation/native';
import { ListMusic, Plus } from 'lucide-react';
import TrackItem from '../components/TrackItem';
import PlayerControls from '../components/PlayerControls';
import SearchBar from '../components/SearchBar';
import AudioVisualizer from '../components/AudioVisualizer';
import PlaylistModal from '../components/PlaylistModal';
import AnimatedMusicNote from '../components/AnimatedMusicNote';
import ModernButton from '../components/ModernButton';
import ModernCard from '../components/ModernCard';

// Platform-specific imports
let DocumentPicker: any;
let useMusicContext: any;
let Track: any;

if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
  Track = {} as any; // Web doesn't need Track type from react-native-track-player
  DocumentPicker = null; // Will use web file picker instead
} else {
  DocumentPicker = require('react-native-document-picker').default;
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
  Track = require('react-native-track-player').Track;
}

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation: navProp }) => {
  const navigation = Platform.OS === 'web' ? navProp : useNavigation();
  const context = useMusicContext();
  const { tracks, addTracks, currentTrack, isPlaying, playlists, createPlaylist } = context;
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickAudioFiles = async () => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // Web file picker
        if (!fileInputRef.current) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'audio/*,video/*,.mp3,.wav,.flac,.ogg,.m4a,.aac,.wma,.mp4,.avi,.mov,.mkv,.webm,.3gp,.wmv,.asf,.amr,.aiff,.opus';
          input.multiple = true;
          input.style.display = 'none';
          
          input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = Array.from(target.files || []);
            
            try {
              const { processMultipleAudioFiles } = await import('../utils/audioConverter');
              const { successful, failed } = await processMultipleAudioFiles(files);
              
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
        // Native file picker
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

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TrackItem
      track={item}
      onPress={() => navigation.navigate('Player' as never)}
      isCurrentTrack={currentTrack?.id === item.id}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Your Music</Text>
          <View style={styles.headerButtons}>
            {tracks.length > 0 && createPlaylist && (
              <ModernButton
                variant="secondary"
                size="small"
                onPress={() => setShowPlaylistModal(true)}
                style={styles.playlistButton}
              >
                <ListMusic size={18} color="#fff" />
              </ModernButton>
            )}
            <ModernButton
              variant="primary"
              size="medium"
              onPress={pickAudioFiles}
              disabled={loading}
              title={loading ? "Loading..." : "Add Music"}
              style={loading && { opacity: 0.7 }}
            >
              {!loading && <Plus size={18} color="#fff" style={{ marginRight: 8 }} />}
            </ModernButton>
          </View>
        </View>
        <SearchBar onSearch={handleSearch} />
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

      {currentTrack && (
        <ModernCard elevated style={styles.miniPlayer}>
          <TouchableOpacity 
            style={styles.miniPlayerTouch}
            onPress={() => navigation.navigate('Player' as never)}
            activeOpacity={0.9}
          >
            <View style={styles.miniPlayerContent}>
            <View style={styles.miniPlayerLeft}>
              <AudioVisualizer isPlaying={isPlaying} style={styles.miniVisualizer} />
              <View style={styles.miniTrackInfo}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.miniArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
              </View>
            </View>
            <PlayerControls mini={true} />
          </View>
          </TouchableOpacity>
        </ModernCard>
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
    backgroundColor: '#000000', // Deep black background
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1db954',
    letterSpacing: -1,
  },
  addButton: {
    backgroundColor: '#1db954',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#1db954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  playlistButton: {
    marginRight: 12,
    backgroundColor: '#323232',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 17,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  animatedNotesContainer: {
    height: 120,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  trackList: {
    flex: 1,
  },
  trackListContent: {
    paddingBottom: 100,
  },
  miniPlayer: {
    backgroundColor: '#282828',
    borderTopWidth: 1,
    borderTopColor: '#404040',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  miniPlayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniVisualizer: {
    marginRight: 16,
  },
  miniTrackInfo: {
    flex: 1,
    marginRight: 16,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  miniArtist: {
    fontSize: 14,
    color: '#b3b3b3',
    fontWeight: '500',
  },
});

export default HomeScreen;