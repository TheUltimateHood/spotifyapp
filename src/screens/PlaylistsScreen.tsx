import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Music, Trash2, Play, MoreVertical } from 'lucide-react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import TrackItem from '../components/TrackItem';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface PlaylistsScreenProps {
  onTrackSelect: (track: any) => void;
}

const PlaylistsScreen: React.FC<PlaylistsScreenProps> = ({ onTrackSelect }) => {
  const context = useMusicContext();
  const { playlists, tracks, createPlaylist, deletePlaylist, currentTrack } = context;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlaylistTracks, setShowPlaylistTracks] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim(), selectedTracks);
      setNewPlaylistName('');
      setSelectedTracks([]);
      setShowCreateModal(false);
    } else {
      Alert.alert('Error', 'Please enter a playlist name');
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(playlistId) },
      ]
    );
  };

  const getPlaylistTracks = (playlist: any) => {
    return playlist.trackIds.map((id: string) => 
      tracks.find((track: any) => track.id === id)
    ).filter(Boolean);
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const renderPlaylistItem = ({ item: playlist }: { item: any }) => {
    const playlistTracks = getPlaylistTracks(playlist);
    
    return (
      <ModernCard style={styles.playlistCard}>
        <TouchableOpacity 
          style={styles.playlistContent}
          onPress={() => setShowPlaylistTracks(playlist.id)}
        >
          <View style={styles.playlistIcon}>
            <Music size={32} color="#1db954" />
          </View>
          
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.playlistStats}>
              {playlistTracks.length} {playlistTracks.length === 1 ? 'song' : 'songs'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeletePlaylist(playlist.id)}
          >
            <Trash2 size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ModernCard>
    );
  };

  const renderTrackItem = ({ item }: { item: any }) => (
    <TrackItem
      track={item}
      onPress={() => {
        context.playTrack(item);
        onTrackSelect(item);
      }}
      isCurrentTrack={currentTrack?.id === item.id}
    />
  );

  const renderTrackSelectionItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.trackSelectionItem,
        selectedTracks.includes(item.id) && styles.trackSelectionItemSelected
      ]}
      onPress={() => toggleTrackSelection(item.id)}
    >
      <View style={[
        styles.selectionIndicator,
        selectedTracks.includes(item.id) && styles.selectionIndicatorSelected
      ]}>
        {selectedTracks.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.trackSelectionTitle}>{item.title}</Text>
      <Text style={styles.trackSelectionArtist}>{item.artist}</Text>
    </TouchableOpacity>
  );

  if (showPlaylistTracks) {
    const playlist = playlists.find((p: any) => p.id === showPlaylistTracks);
    const playlistTracks = getPlaylistTracks(playlist);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowPlaylistTracks(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.playlistTitle}>{playlist?.name}</Text>
          <TouchableOpacity>
            <MoreVertical size={24} color="#1db954" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={playlistTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Playlists</Text>
        <ModernButton
          variant="primary"
          size="small"
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#fff" />
        </ModernButton>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Music size={80} color="#666" />
          <Text style={styles.emptyStateTitle}>No Playlists Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first playlist to organize your music
          </Text>
          <ModernButton
            variant="primary"
            title="Create Playlist"
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          />
        </View>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter playlist name"
              placeholderTextColor="#666"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            
            <Text style={styles.sectionTitle}>Select Songs (Optional)</Text>
            <FlatList
              data={tracks}
              renderItem={renderTrackSelectionItem}
              keyExtractor={(item) => item.id}
              style={styles.trackSelectionList}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.modalButtons}>
              <ModernButton
                variant="outline"
                title="Cancel"
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                  setSelectedTracks([]);
                }}
                style={styles.modalButton}
              />
              <ModernButton
                variant="primary"
                title="Create"
                onPress={handleCreatePlaylist}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#1db954',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1db954',
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1db954',
  },
  backButton: {
    fontSize: 16,
    color: '#1db954',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  playlistCard: {
    marginBottom: 12,
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  playlistIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playlistStats: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '80%',
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1db954',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  trackSelectionList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  trackSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8,
  },
  trackSelectionItemSelected: {
    backgroundColor: '#1db954',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  checkmark: {
    color: '#1db954',
    fontWeight: 'bold',
  },
  trackSelectionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  trackSelectionArtist: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default PlaylistsScreen;