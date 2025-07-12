
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { 
  X, 
  Upload, 
  Search, 
  Tag, 
  Check,
  Music,
  User,
  Image as ImageIcon
} from 'lucide-react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

interface SpotifyMetadata {
  tracks?: {
    items?: SpotifyTrack[];
  };
  items?: SpotifyTrack[];
  // Direct array of tracks
  [key: string]: any;
}

interface MetadataManagementModalProps {
  visible: boolean;
  onClose: () => void;
  tracks: any[];
  playlists: any[];
  onApplyMetadata: (updates: any[]) => void;
}

const MetadataManagementModal: React.FC<MetadataManagementModalProps> = ({
  visible,
  onClose,
  tracks,
  playlists,
  onApplyMetadata,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'preview'>('upload');
  const [metadataFile, setMetadataFile] = useState<SpotifyMetadata | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [pendingUpdates, setPendingUpdates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        setMetadataFile(jsonData);
        
        // Auto-detect metadata immediately after upload
        const spotifyTracks = extractSpotifyTracks(jsonData);
        const updates: any[] = [];

        tracks.forEach(track => {
          const normalizedTitle = track.title.toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s]/g, '')
            .trim();

          const match = spotifyTracks.find(spotifyTrack => {
            const normalizedSpotifyTitle = spotifyTrack.name.toLowerCase()
              .replace(/\s+/g, ' ')
              .replace(/[^\w\s]/g, '')
              .trim();
            
            return normalizedSpotifyTitle.includes(normalizedTitle) || 
                   normalizedTitle.includes(normalizedSpotifyTitle);
          });

          if (match) {
            updates.push({
              trackId: track.id,
              artistName: match.artists[0]?.name || track.artist,
              albumArt: match.album.images[0]?.url || track.artwork,
              spotifyId: match.id,
              isAutoDetected: true,
            });
          }
        });

        setPendingUpdates(updates);
        
        // Switch to preview tab to show results
        setActiveTab('preview');
        
        Alert.alert('Success', `Loaded metadata from ${file.name}\nFound matches for ${updates.length} tracks`);
      } catch (error) {
        Alert.alert('Error', 'Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const extractSpotifyTracks = (metadata: SpotifyMetadata): SpotifyTrack[] => {
    // Handle different Spotify API response formats
    if (metadata.tracks?.items) return metadata.tracks.items;
    if (metadata.items) return metadata.items;
    if (Array.isArray(metadata)) return metadata;
    
    // Look for tracks in any property
    for (const key in metadata) {
      if (Array.isArray(metadata[key]) && metadata[key][0]?.name) {
        return metadata[key];
      }
    }
    
    return [];
  };

  const rerunAutoDetection = () => {
    if (!metadataFile) {
      Alert.alert('Error', 'Please upload a metadata file first');
      return;
    }

    const spotifyTracks = extractSpotifyTracks(metadataFile);
    const updates: any[] = [];

    tracks.forEach(track => {
      const normalizedTitle = track.title.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();

      const match = spotifyTracks.find(spotifyTrack => {
        const normalizedSpotifyTitle = spotifyTrack.name.toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .trim();
        
        return normalizedSpotifyTitle.includes(normalizedTitle) || 
               normalizedTitle.includes(normalizedSpotifyTitle);
      });

      if (match) {
        updates.push({
          trackId: track.id,
          artistName: match.artists[0]?.name || track.artist,
          albumArt: match.album.images[0]?.url || track.artwork,
          spotifyId: match.id,
          isAutoDetected: true,
        });
      }
    });

    setPendingUpdates(updates);
    setActiveTab('preview');
    Alert.alert('Re-detection Complete', `Found metadata for ${updates.length} tracks`);
  };

  const applyManualMetadata = (trackId: string, artistName: string, albumArt: string) => {
    const existingIndex = pendingUpdates.findIndex(update => update.trackId === trackId);
    const newUpdate = {
      trackId,
      artistName,
      albumArt,
      isManuallyLabeled: true,
    };

    if (existingIndex >= 0) {
      const newUpdates = [...pendingUpdates];
      newUpdates[existingIndex] = newUpdate;
      setPendingUpdates(newUpdates);
    } else {
      setPendingUpdates([...pendingUpdates, newUpdate]);
    }
  };

  const applyAllUpdates = () => {
    if (pendingUpdates.length === 0) {
      Alert.alert('No Changes', 'No metadata updates to apply');
      return;
    }

    onApplyMetadata(pendingUpdates);
    setPendingUpdates([]);
    onClose();
    Alert.alert('Success', `Applied metadata to ${pendingUpdates.length} tracks`);
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUploadTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Upload a JSON file with Spotify Web API format metadata
      </Text>
      
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={() => fileInputRef.current?.click()}
      >
        <Upload size={24} color="#1db954" />
        <Text style={styles.uploadButtonText}>
          {fileName || 'Choose Metadata File'}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      )}

      {metadataFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoText}>
            ✓ Loaded: {fileName}
          </Text>
          <Text style={styles.fileInfoSubtext}>
            Found {extractSpotifyTracks(metadataFile).length} tracks in file
          </Text>
          <Text style={styles.fileInfoSubtext}>
            Matched {pendingUpdates.length} tracks from your library
          </Text>
        </View>
      )}

      {metadataFile && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={rerunAutoDetection}
        >
          <Search size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Re-run Auto Detection</Text>
        </TouchableOpacity>
      )}

      {!metadataFile && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How it works:</Text>
          <Text style={styles.instructionsText}>
            1. Upload a JSON file with Spotify metadata
          </Text>
          <Text style={styles.instructionsText}>
            2. We'll automatically match your tracks
          </Text>
          <Text style={styles.instructionsText}>
            3. Review and apply the matches
          </Text>
        </View>
      )}
    </View>
  );

  const renderManualTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Manually label tracks with artist name and cover art
      </Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracks..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.tracksList} showsVerticalScrollIndicator={false}>
        {filteredTracks.map(track => {
          const existingUpdate = pendingUpdates.find(update => update.trackId === track.id);
          
          return (
            <View key={track.id} style={styles.trackItem}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.labelButton}
                onPress={() => {
                  // For simplicity, using prompts - in production, you'd want proper input modals
                  if (Platform.OS === 'web') {
                    const artistName = window.prompt('Enter artist name:', track.artist) || track.artist;
                    const albumArt = window.prompt('Enter cover art URL:', track.artwork || '') || track.artwork || '';
                    applyManualMetadata(track.id, artistName, albumArt);
                  }
                }}
              >
                {existingUpdate ? (
                  <Check size={16} color="#1db954" />
                ) : (
                  <Tag size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderPreviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Review detected matches and choose how to apply them
      </Text>

      {pendingUpdates.length > 0 ? (
        <>
          <View style={styles.previewHeader}>
            <Text style={styles.previewStats}>
              {pendingUpdates.length} track(s) matched
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  applyAllUpdates();
                }}
              >
                <Check size={16} color="#fff" />
                <Text style={styles.quickActionText}>Apply All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.secondaryButton]}
                onPress={() => {
                  setPendingUpdates([]);
                  Alert.alert('Cleared', 'All pending updates cleared');
                }}
              >
                <X size={16} color="#fff" />
                <Text style={styles.quickActionText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.updatesList} showsVerticalScrollIndicator={false}>
            {pendingUpdates.map((update, index) => {
              const track = tracks.find(t => t.id === update.trackId);
              return (
                <View key={index} style={styles.updateItem}>
                  <View style={styles.updateInfo}>
                    <Text style={styles.updateTrackTitle}>{track?.title}</Text>
                    <Text style={styles.updateDetails}>
                      Artist: {update.artistName}
                    </Text>
                    {update.albumArt && (
                      <Text style={styles.updateDetails}>
                        ✓ Cover art included
                      </Text>
                    )}
                  </View>
                  <View style={styles.updateActions}>
                    <TouchableOpacity 
                      style={styles.individualApplyButton}
                      onPress={() => {
                        onApplyMetadata([update]);
                        setPendingUpdates(prev => prev.filter((_, i) => i !== index));
                        Alert.alert('Applied', 'Metadata applied to track');
                      }}
                    >
                      <Check size={14} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.individualRemoveButton}
                      onPress={() => {
                        setPendingUpdates(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <X size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Music size={48} color="#666" />
          <Text style={styles.emptyStateText}>No metadata matches found</Text>
          <Text style={styles.emptyStateSubtext}>
            Upload a metadata file or use manual labeling
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Label Metadata</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
            onPress={() => setActiveTab('upload')}
          >
            <Upload size={16} color={activeTab === 'upload' ? '#1db954' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
              Upload
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
            onPress={() => setActiveTab('manual')}
          >
            <Tag size={16} color={activeTab === 'manual' ? '#1db954' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'manual' && styles.activeTabText]}>
              Manual
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'preview' && styles.activeTab]}
            onPress={() => setActiveTab('preview')}
          >
            <Search size={16} color={activeTab === 'preview' ? '#1db954' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'preview' && styles.activeTabText]}>
              Preview ({pendingUpdates.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'manual' && renderManualTab()}
          {activeTab === 'preview' && renderPreviewTab()}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.applyButton, pendingUpdates.length === 0 && styles.disabledButton]}
            onPress={applyAllUpdates}
            disabled={pendingUpdates.length === 0}
          >
            <Text style={styles.applyButtonText}>
              Apply {pendingUpdates.length > 0 ? `(${pendingUpdates.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1db954',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1db954',
  },
  content: {
    flex: 1,
    minHeight: 300,
  },
  tabContent: {
    padding: 20,
    flex: 1,
  },
  tabDescription: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#1db954',
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadButtonText: {
    color: '#1db954',
    fontSize: 16,
    fontWeight: '500',
  },
  fileInfo: {
    backgroundColor: '#0f4a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  fileInfoText: {
    color: '#1db954',
    fontSize: 14,
    fontWeight: '500',
  },
  fileInfoSubtext: {
    color: '#88c999',
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1db954',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  tracksList: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  trackArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  labelButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  updatesList: {
    flex: 1,
  },
  updateItem: {
    flexDirection: 'row',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  updateInfo: {
    flex: 1,
  },
  updateTrackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  updateDetails: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  updateStatus: {
    alignItems: 'flex-end',
  },
  autoDetectedTag: {
    backgroundColor: '#1db954',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  manualTag: {
    backgroundColor: '#ff8844',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  instructionsContainer: {
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  instructionsTitle: {
    color: '#1db954',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  previewStats: {
    color: '#1db954',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1db954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  updateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  individualApplyButton: {
    backgroundColor: '#1db954',
    padding: 8,
    borderRadius: 6,
  },
  individualRemoveButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#1db954',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MetadataManagementModal;
