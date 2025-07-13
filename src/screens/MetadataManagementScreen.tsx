
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Upload, 
  Search, 
  Tag, 
  Check,
  Music,
  User,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  Edit3,
  X
} from 'lucide-react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface MetadataItem {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  [key: string]: any;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  metadata?: {
    spotifyId?: string;
    artistName?: string;
    albumArt?: string;
    isManuallyLabeled?: boolean;
  };
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

type FlowStep = 'upload' | 'preview' | 'target-selection' | 'auto-label' | 'manual-assign' | 'manual-edit' | 'direct-edit';

const MetadataManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State management
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [metadataFile, setMetadataFile] = useState<MetadataItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Data
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(new Set());
  
  // Matching and editing
  const [autoMatches, setAutoMatches] = useState<Array<{track: Track, metadata: MetadataItem, confidence: number}>>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Array<{trackId: string, updates: Partial<Track>}>>([]);

  // Mock data - replace with actual data source
  useEffect(() => {
    setTracks([
      {
        id: '1',
        title: 'Shape of You',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        artwork: 'https://via.placeholder.com/300x300/1db954/ffffff?text=No+Cover',
      },
      {
        id: '2', 
        title: 'Blinding Lights',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        artwork: 'https://via.placeholder.com/300x300/1db954/ffffff?text=No+Cover',
      }
    ]);
    
    setPlaylists([
      {
        id: 'p1',
        name: 'My Playlist',
        tracks: [
          {
            id: '1',
            title: 'Shape of You',
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            artwork: 'https://via.placeholder.com/300x300/1db954/ffffff?text=No+Cover',
          }
        ]
      }
    ]);
  }, []);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setLoading(true);
        setFileName(result.name || 'metadata file');
        const fileUri = result.uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        
        let parsedData: MetadataItem[] = [];
        
        if (result.name?.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
          parsedData = extractTracksFromJson(jsonData);
        } else if (result.name?.endsWith('.csv')) {
          parsedData = parseCSVToMetadata(fileContent);
        }

        setMetadataFile(parsedData);
        setCurrentStep('preview');
        setLoading(false);
        Alert.alert('Success', `Loaded ${parsedData.length} items from ${result.name}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload metadata file');
      setLoading(false);
    }
  };

  const extractTracksFromJson = (jsonData: any): MetadataItem[] => {
    if (jsonData.tracks?.items) return jsonData.tracks.items;
    if (jsonData.items) return jsonData.items;
    if (Array.isArray(jsonData)) return jsonData;
    
    for (const key in jsonData) {
      if (Array.isArray(jsonData[key]) && jsonData[key][0]?.name) {
        return jsonData[key];
      }
    }
    
    return [];
  };

  const parseCSVToMetadata = (csvContent: string): MetadataItem[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const item: any = { id: `csv_${index}` };
      
      headers.forEach((header, idx) => {
        if (values[idx]) {
          if (header === 'name' || header === 'title') {
            item.name = values[idx];
          } else if (header === 'artist' || header === 'artists') {
            item.artists = [{ name: values[idx], id: `artist_${idx}` }];
          } else if (header === 'album') {
            item.album = { name: values[idx], images: [] };
          } else {
            item[header] = values[idx];
          }
        }
      });
      
      if (!item.artists) item.artists = [{ name: 'Unknown Artist', id: 'unknown' }];
      if (!item.album) item.album = { name: 'Unknown Album', images: [] };
      
      return item;
    }).filter(item => item.name);
  };

  const performAutoMatching = () => {
    const matches: Array<{track: Track, metadata: MetadataItem, confidence: number}> = [];
    
    const allTracks = selectedPlaylists.length > 0 
      ? selectedPlaylists.flatMap(p => p.tracks)
      : selectedTracks.length > 0 
        ? selectedTracks 
        : tracks;

    allTracks.forEach(track => {
      const normalizedTitle = track.title.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();

      metadataFile.forEach(metadata => {
        const normalizedMetaTitle = metadata.name.toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .trim();
        
        let confidence = 0;
        if (normalizedTitle === normalizedMetaTitle) confidence = 1.0;
        else if (normalizedTitle.includes(normalizedMetaTitle) || normalizedMetaTitle.includes(normalizedTitle)) confidence = 0.8;
        else if (levenshteinSimilarity(normalizedTitle, normalizedMetaTitle) > 0.7) confidence = 0.6;
        
        if (confidence > 0.5) {
          matches.push({ track, metadata, confidence });
        }
      });
    });

    // Keep only best matches per track
    const bestMatches = matches
      .sort((a, b) => b.confidence - a.confidence)
      .filter((match, index, arr) => 
        arr.findIndex(m => m.track.id === match.track.id) === index
      );

    setAutoMatches(bestMatches);
    setCurrentStep('auto-label');
  };

  const levenshteinSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[len2][len1];
    return 1 - distance / Math.max(len1, len2);
  };

  const applyAutoMatches = () => {
    const updates = autoMatches.map(match => ({
      trackId: match.track.id,
      updates: {
        title: match.metadata.name,
        artist: match.metadata.artists[0]?.name || match.track.artist,
        album: match.metadata.album?.name || match.track.album,
        artwork: match.metadata.album?.images[0]?.url || match.track.artwork,
        metadata: {
          spotifyId: match.metadata.id,
          artistName: match.metadata.artists[0]?.name,
          albumArt: match.metadata.album?.images[0]?.url,
          isManuallyLabeled: false,
        }
      }
    }));

    setPendingUpdates(updates);
    applyUpdates(updates);
    
    Alert.alert(
      'Auto-Labeling Complete',
      `Applied metadata to ${updates.length} tracks. Would you like to manually edit any tracks?`,
      [
        { text: 'No', onPress: () => setCurrentStep('upload') },
        { text: 'Yes', onPress: () => setCurrentStep('manual-edit') }
      ]
    );
  };

  const applyUpdates = (updates: Array<{trackId: string, updates: Partial<Track>}>) => {
    setTracks(prev => prev.map(track => {
      const update = updates.find(u => u.trackId === track.id);
      return update ? { ...track, ...update.updates } : track;
    }));

    setPlaylists(prev => prev.map(playlist => ({
      ...playlist,
      tracks: playlist.tracks.map(track => {
        const update = updates.find(u => u.trackId === track.id);
        return update ? { ...track, ...update.updates } : track;
      })
    })));
  };

  const togglePlaylistExpansion = (playlistId: string) => {
    setExpandedPlaylists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
  };

  const renderUploadStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Upload Metadata File</Text>
      <Text style={styles.stepDescription}>
        Upload a JSON or CSV file containing track metadata
      </Text>
      
      <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
        <Upload size={24} color="#1db954" />
        <Text style={styles.uploadButtonText}>
          {fileName || 'Choose Metadata File'}
        </Text>
      </TouchableOpacity>

      <View style={styles.orDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={styles.directEditButton}
        onPress={() => setCurrentStep('direct-edit')}
      >
        <Edit3 size={24} color="#007AFF" />
        <Text style={styles.directEditButtonText}>
          Direct Edit Track Metadata
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setCurrentStep('upload')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Preview Metadata</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Found {metadataFile.length} tracks in {fileName}
      </Text>

      <ScrollView style={styles.previewList} showsVerticalScrollIndicator={false}>
        {metadataFile.slice(0, 10).map((item, index) => (
          <View key={index} style={styles.metadataPreviewItem}>
            {item.album?.images?.[0]?.url && (
              <Image 
                source={{ uri: item.album.images[0].url }} 
                style={styles.previewArtwork}
              />
            )}
            <View style={styles.previewDetails}>
              <Text style={styles.previewTitle}>{item.name}</Text>
              <Text style={styles.previewArtist}>{item.artists[0]?.name}</Text>
              <Text style={styles.previewAlbum}>{item.album?.name}</Text>
            </View>
          </View>
        ))}
        {metadataFile.length > 10 && (
          <Text style={styles.moreText}>... and {metadataFile.length - 10} more</Text>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setCurrentStep('target-selection')}
        >
          <Text style={styles.primaryButtonText}>Continue to Auto Label</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentStep('manual-assign')}
        >
          <Text style={styles.secondaryButtonText}>Manual Assign from File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTargetSelectionStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <TouchableOpacity onPress={() => setCurrentStep('preview')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Select Target</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Choose which tracks or playlists to auto-label
      </Text>

      <ScrollView style={styles.selectionList} showsVerticalScrollIndicator={false}>
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          {playlists.map(playlist => (
            <View key={playlist.id}>
              <TouchableOpacity 
                style={styles.playlistSelectionItem}
                onPress={() => togglePlaylistExpansion(playlist.id)}
              >
                <View style={styles.playlistHeader}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      selectedPlaylists.some(p => p.id === playlist.id) && styles.checkboxSelected
                    ]}
                    onPress={() => {
                      setSelectedPlaylists(prev => 
                        prev.some(p => p.id === playlist.id)
                          ? prev.filter(p => p.id !== playlist.id)
                          : [...prev, playlist]
                      );
                    }}
                  >
                    {selectedPlaylists.some(p => p.id === playlist.id) && (
                      <Check size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.trackCount}>({playlist.tracks.length} tracks)</Text>
                  {expandedPlaylists.has(playlist.id) ? (
                    <ChevronDown size={20} color="#666" />
                  ) : (
                    <ChevronRight size={20} color="#666" />
                  )}
                </View>
              </TouchableOpacity>
              
              {expandedPlaylists.has(playlist.id) && (
                <View style={styles.playlistTracks}>
                  {playlist.tracks.map(track => (
                    <View key={track.id} style={styles.trackSelectionItem}>
                      <Image source={{ uri: track.artwork }} style={styles.trackArtwork} />
                      <View style={styles.trackDetails}>
                        <Text style={styles.trackTitle}>{track.title}</Text>
                        <Text style={styles.trackArtist}>{track.artist}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Individual Tracks</Text>
          {tracks.map(track => (
            <TouchableOpacity 
              key={track.id}
              style={styles.trackSelectionItem}
              onPress={() => {
                setSelectedTracks(prev => 
                  prev.some(t => t.id === track.id)
                    ? prev.filter(t => t.id !== track.id)
                    : [...prev, track]
                );
              }}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  selectedTracks.some(t => t.id === track.id) && styles.checkboxSelected
                ]}
              >
                {selectedTracks.some(t => t.id === track.id) && (
                  <Check size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Image source={{ uri: track.artwork }} style={styles.trackArtwork} />
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[
          styles.primaryButton,
          (selectedPlaylists.length === 0 && selectedTracks.length === 0) && styles.disabledButton
        ]}
        onPress={performAutoMatching}
        disabled={selectedPlaylists.length === 0 && selectedTracks.length === 0}
      >
        <Text style={styles.primaryButtonText}>
          Auto Label Selected ({selectedPlaylists.length + selectedTracks.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1db954" />
        </View>
      )}
      
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'target-selection' && renderTargetSelectionStep()}
      
      {/* Additional steps will be implemented in next parts */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#1db954',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 30,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#1db954',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#1db954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  orText: {
    color: '#666',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  directEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#282828',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  directEditButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  previewList: {
    flex: 1,
    marginBottom: 20,
  },
  metadataPreviewItem: {
    flexDirection: 'row',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  previewArtwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  previewDetails: {
    flex: 1,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  previewAlbum: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  moreText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1db954',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  selectionList: {
    flex: 1,
    marginBottom: 20,
  },
  selectionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  playlistSelectionItem: {
    marginBottom: 8,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1db954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#1db954',
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  trackCount: {
    color: '#666',
    fontSize: 14,
    marginRight: 12,
  },
  playlistTracks: {
    marginLeft: 32,
    marginTop: 8,
  },
  trackSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  trackArtwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  trackArtist: {
    color: '#b3b3b3',
    fontSize: 13,
    marginTop: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default MetadataManagementScreen;
