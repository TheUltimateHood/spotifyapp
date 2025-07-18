import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import {
  Upload,
  Eye,
  Zap,
  Edit3,
  Music,
  Album,
  User,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  SelectAll,
} from 'lucide-react';
import ModernButton from '../components/ModernButton';
import ModernCard from '../components/ModernCard';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface MetadataTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  duration?: string;
  genre?: string;
  year?: string;
  trackNumber?: number;
}

interface PlaylistWithSelection {
  id: string;
  name: string;
  tracks: any[];
  expanded: boolean;
  selectedTracks: Set<string>;
}

type ManagementStep = 
  | 'initial-choice'  // New initial step
  | 'upload'
  | 'preview'
  | 'choose-method'
  | 'auto-label'
  | 'manual-edit-choice'
  | 'manual-edit-single'
  | 'manual-edit-mass'
  | 'post-auto-edit';

interface MetadataManagementScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id?: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
  };
}

interface SpotifyMetadata {
  tracks?: { items: SpotifyTrack[] } | SpotifyTrack[];
  items?: SpotifyTrack[];
  [key: string]: any;
}

const MetadataManagementScreen: React.FC<MetadataManagementScreenProps> = ({ navigation }) => {
  const { tracks, playlists, updateTrack, createPlaylist } = useMusicContext();

  const [currentStep, setCurrentStep] = useState<ManagementStep>('initial-choice');
  const [uploadedMetadata, setUploadedMetadata] = useState<MetadataTrack[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<'auto' | 'manual' | null>(null);
  const [playlistsWithSelection, setPlaylistsWithSelection] = useState<PlaylistWithSelection[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [autoLabelMatches, setAutoLabelMatches] = useState<Map<string, string>>(new Map());
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [massEditData, setMassEditData] = useState({
    artist: '',
    album: '',
    genre: '',
    year: '',
  });
  const [autoLabelResults, setAutoLabelResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [massEditSelection, setMassEditSelection] = useState<{ [playlistId: string]: string[] }>({});


  // Initialize playlists with selection state
  React.useEffect(() => {
    const playlistsWithSel = playlists.map(playlist => ({
      ...playlist,
      expanded: false,
      selectedTracks: new Set<string>(),
    }));
    setPlaylistsWithSelection(playlistsWithSel);
  }, [playlists]);

  const handleMetadataUpload = async () => {
    if (Platform.OS === 'web') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,.txt,.csv,text/plain,application/json,text/csv,*';

      // Reset the input value to allow selecting the same file again
      fileInput.value = '';

      fileInput.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) return;

        const file = target.files[0];
        console.log('Selected file:', file.name, 'size:', file.size, 'type:', file.type);

        try {
          const text = await file.text();
          console.log('File content loaded, length:', text.length);

          let metadata: any;
          if (file.name.endsWith('.json')) {
            console.log('Parsing JSON file...');
            const parsedData = JSON.parse(text);
            console.log('Parsed JSON data type:', typeof parsedData);

            // Extract tracks from Spotify-style metadata
            const spotifyTracks = extractSpotifyTracks(parsedData);
            console.log('Extracted Spotify tracks:', spotifyTracks.length);

            if (spotifyTracks.length > 0) {
              metadata = spotifyTracks.map(spotifyTrack => {
                // Sort images by size (largest first) and take the first one
                const albumImages = spotifyTrack.album?.images || [];
                const albumArtUrl = spotifyTrack.album?.images?.[0]?.url;

                console.log('Processing track:', spotifyTrack.name);
                console.log('Selected album art URL:', albumArtUrl || 'none');
                return {
                  id: spotifyTrack.id || `spotify_${Math.random().toString(36).substr(2, 9)}`,
                  title: spotifyTrack.name || 'Unknown Track',
                  artist: spotifyTrack.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist',
                  album: spotifyTrack.album?.name || 'Unknown Album',
                  artwork: albumArtUrl, // Using 'artwork' to match WebMusicContext Track interface
                  albumArt: albumArtUrl, // Also keeping 'albumArt' for backward compatibility
                  duration: spotifyTrack.duration_ms ? 
                    `${Math.floor(spotifyTrack.duration_ms / 60000)}:${Math.floor((spotifyTrack.duration_ms % 60000) / 1000).toString().padStart(2, '0')}` : 
                    '0:00',
                  durationMs: spotifyTrack.duration_ms || 0,
                  year: spotifyTrack.album?.release_date ? 
                    new Date(spotifyTrack.album.release_date).getFullYear().toString() : 
                    new Date().getFullYear().toString(),
                  trackNumber: spotifyTrack.track_number || 1,
                };
              });
              console.log('Processed Spotify tracks:', metadata.length);
            } else {
              console.log('No Spotify tracks found, trying direct format...');
              // Try to handle the data as-is if it's already in the right format
              if (Array.isArray(parsedData)) {
                metadata = parsedData;
              } else if (typeof parsedData === 'object' && parsedData !== null) {
                // If it's a single track object, wrap it in an array
                metadata = [parsedData];
              } else {
                throw new Error('Unsupported JSON format');
              }
            }
          } else {
            // Parse CSV or TXT format
            metadata = parseTextMetadata(text);
          }

          console.log('Final metadata:', metadata);

          if (!metadata || metadata.length === 0) {
            throw new Error('No valid tracks found in the uploaded file');
          }

          setUploadedMetadata(metadata);
          setCurrentStep('preview');

          // Show success message
          Alert.alert(
            'Success', 
            `Successfully loaded ${metadata.length} track(s) from ${file.name}`,
            [{ text: 'OK' }]
          );

        } catch (error) {
          console.error('Error parsing metadata file:', error);
          Alert.alert(
            'Error', 
            `Failed to parse metadata file: ${error.message || 'Unknown error'}`,
            [{ text: 'OK' }]
          );
        } finally {
          // Clean up the file input
          fileInput.value = '';
        }
      };

      fileInput.click();
    } else {
      // Mobile implementation would go here
      Alert.alert('Info', 'File upload is currently only supported on web');
    }
  };

  const parseTextMetadata = (text: string): MetadataTrack[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const metadata: MetadataTrack[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 3) {
        metadata.push({
          id: `meta_${index}`,
          title: parts[0] || '',
          artist: parts[1] || '',
          album: parts[2] || '',
          genre: parts[3] || '',
          year: parts[4] || '',
          duration: parts[5] || '',
        });
      }
    });

    return metadata;
  };

  const extractSpotifyTracks = (metadata: SpotifyMetadata): SpotifyTrack[] => {
    console.log('Extracting tracks from metadata');
    // Log just the structure without the full content to avoid huge logs
    console.log('Metadata type:', typeof metadata);
    console.log('Metadata keys:', Object.keys(metadata));

    // Log a sample track if available
    if (metadata.tracks?.items?.[0]) {
      const sampleTrack = metadata.tracks.items[0];
      console.log('Sample track:', {
        name: sampleTrack.name,
        album: sampleTrack.album?.name,
        images: sampleTrack.album?.images?.map(img => ({
          width: img.width,
          height: img.height,
          url: img.url ? `${img.url.substring(0, 30)}...` : 'none'
        }))
      });
    }

    // Handle direct track array
    if (Array.isArray(metadata)) {
      console.log('Found root array format, length:', metadata.length);
      return metadata;
    }

    // Handle playlist with tracks.items
    if (metadata.tracks?.items) {
      console.log('Found tracks.items format, length:', metadata.tracks.items.length);
      const items = metadata.tracks.items;
      // Check if items have a nested track object (playlist format)
      if (items[0]?.track) {
        return items.map((item: any) => item.track).filter(Boolean);
      }
      return items;
    }

    // Handle direct tracks array
    if (metadata.tracks && Array.isArray(metadata.tracks)) {
      console.log('Found tracks array format, length:', metadata.tracks.length);
      return metadata.tracks;
    }

    // Handle items array (could be tracks or playlist items)
    if (metadata.items) {
      console.log('Found items format, length:', metadata.items.length);
      const items = metadata.items;
      // Check if items have a nested track object (playlist format)
      if (items[0]?.track) {
        return items.map((item: any) => item.track).filter(Boolean);
      }
      return items;
    }

    // Look for tracks in any array property
    for (const key in metadata) {
      if (Array.isArray(metadata[key])) {
        const array = metadata[key];
        console.log(`Found array in property "${key}" with length:`, array.length);

        if (array.length === 0) continue;

        const firstItem = array[0];

        // Handle playlist items with nested track objects
        if (firstItem?.track) {
          console.log('Found nested track objects in property:', key);
          return array.map((item: any) => item.track).filter(Boolean);
        }
        // Handle direct track objects
        else if (firstItem?.name && firstItem?.artists) {
          console.log('Found direct track objects in property:', key);
          return array;
        }
      }
    }

    console.log('No tracks found in metadata');
    return [];
  };

  const handleAutoLabel = async () => {
    if (!uploadedMetadata) return;

    const tracksToProcess = selectedPlaylist 
      ? playlists.find(p => p.id === selectedPlaylist)?.tracks || []
      : selectedTracks.size > 0 
        ? Array.from(selectedTracks).map(trackId => tracks.find(track => track.id === trackId))
        : tracks;

    const tracksWithExistingMetadata = tracksToProcess.filter(
      track => track.artist || track.album || track.genre || track.year
    );

    if (tracksWithExistingMetadata.length > 0) {
      Alert.alert(
        'Overwrite Warning',
        `This will overwrite existing metadata for ${tracksWithExistingMetadata.length} track(s). Are you sure you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => proceedWithAutoLabel(tracksToProcess) },
        ]
      );
    } else {
      proceedWithAutoLabel(tracksToProcess);
    }
  };

  const proceedWithAutoLabel = async (tracksToProcess: any[]) => {
    setIsLoading(true);
    try {
      const matches: any[] = [];

      // Auto-match logic based on title similarity
      tracksToProcess.forEach(track => {
        const bestMatch = uploadedMetadata.find(meta => {
          const trackTitle = track.title?.toLowerCase().replace(/\s+/g, '') || '';
          const metaTitle = meta.title?.toLowerCase().replace(/\s+/g, '') || '';

          // Simple similarity check - could be enhanced with fuzzy matching
          return trackTitle.includes(metaTitle) || 
                 metaTitle.includes(trackTitle) ||
                 trackTitle === metaTitle;
        });

        if (bestMatch) {
          matches.push({
            track,
            metadata: bestMatch,
            confidence: calculateMatchConfidence(track, bestMatch)
          });
        }
      });

      // Apply matched metadata
      matches.forEach(match => {
        const updatedTrack = {
          ...match.track,
          title: match.metadata.title || match.track.title,
          artist: match.metadata.artist || match.track.artist,
          album: match.metadata.album || match.track.album,
          artwork: match.metadata.artwork || match.metadata.albumArt || match.track.artwork || match.track.albumArt,
          year: match.metadata.year || match.track.year,
          genre: match.metadata.genre || match.track.genre,
          duration: match.metadata.duration || match.track.duration
        };

        updateTrack(updatedTrack.id, updatedTrack);
      });

      setAutoLabelResults(matches);
      setCurrentStep('post-auto-edit');
    } catch (error) {
      console.error('Auto-labeling failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMatchConfidence = (track: any, metadata: any): number => {
    let confidence = 0;
    const trackTitle = track.title?.toLowerCase() || '';
    const metaTitle = metadata.title?.toLowerCase() || '';

    if (trackTitle === metaTitle) confidence += 0.6;
    else if (trackTitle.includes(metaTitle) || metaTitle.includes(trackTitle)) confidence += 0.4;

    if (track.artist?.toLowerCase() === metadata.artist?.toLowerCase()) confidence += 0.3;
    if (track.album?.toLowerCase() === metadata.album?.toLowerCase()) confidence += 0.1;

    return Math.min(confidence, 1.0);
  };

  const handleManualEdit = (trackId: string, field: string, value: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const updatedTrack = {
      ...track,
      [field]: value
    };

    updateTrack(trackId, updatedTrack);
  };

  const handleMassEdit = (playlistId: string, field: string, value: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const selectedTrackIds = massEditSelection[playlistId] || [];
    const tracksToUpdate = selectedTrackIds.length > 0 
      ? playlist.tracks.filter(t => selectedTrackIds.includes(t.id))
      : playlist.tracks;

    tracksToUpdate.forEach(track => {
      const updatedTrack = {
        ...track,
        [field]: value
      };
      updateTrack(track.id, updatedTrack);
    });
  };

  const toggleMassEditSelection = (playlistId: string, trackId: string) => {
    setMassEditSelection(prev => {
      const currentSelection = prev[playlistId] || [];
      const isSelected = currentSelection.includes(trackId);

      return {
        ...prev,
        [playlistId]: isSelected
          ? currentSelection.filter(id => id !== trackId)
          : [...currentSelection, trackId]
      };
    });
  };

  const selectAllTracksForMassEdit = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    setMassEditSelection(prev => ({
      ...prev,
      [playlistId]: playlist.tracks.map(t => t.id)
    }));
  };

  const deselectAllTracksForMassEdit = (playlistId: string) => {
    setMassEditSelection(prev => ({
      ...prev,
      [playlistId]: []
    }));
  };

  const togglePlaylistExpansion = (playlistId: string) => {
    setPlaylistsWithSelection(prev => 
      prev.map(p => 
        p.id === playlistId ? { ...p, expanded: !p.expanded } : p
      )
    );
  };

  const toggleAllTracksInPlaylist = (playlistId: string) => {
    setPlaylistsWithSelection(prev => 
      prev.map(p => {
        if (p.id === playlistId) {
          const allSelected = p.selectedTracks.size === p.tracks.length;
          const newSelectedTracks = allSelected 
            ? new Set<string>()
            : new Set(p.tracks.map(t => t.id));
          return { ...p, selectedTracks: newSelectedTracks };
        }
        return p;
      })
    );
  };

  const toggleTrackSelection = (playlistId: string, trackId: string) => {
    setPlaylistsWithSelection(prev => 
      prev.map(p => {
        if (p.id === playlistId) {
          const newSelected = new Set(p.selectedTracks);
          if (newSelected.has(trackId)) {
            newSelected.delete(trackId);
          } else {
            newSelected.add(trackId);
          }
          return { ...p, selectedTracks: newSelected };
        }
        return p;
      })
    );
  };

  const applyMassEdit = () => {
    const tracksToUpdate: any[] = [];
    playlistsWithSelection.forEach(playlist => {
      playlist.selectedTracks.forEach(trackId => {
        const track = playlist.tracks.find(t => t.id === trackId);
        if (track) {
          tracksToUpdate.push(track);
        }
      });
    });

    const tracksWithExistingMetadata = tracksToUpdate.filter(
      track => track.artist || track.album || track.genre || track.year
    );

    if (tracksWithExistingMetadata.length > 0) {
      Alert.alert(
        'Overwrite Warning',
        `This will overwrite existing metadata for ${tracksWithExistingMetadata.length} track(s). Are you sure you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => proceedWithMassEdit(tracksToUpdate),
          },
        ]
      );
    } else {
      proceedWithMassEdit(tracksToUpdate);
    }
  };

  const proceedWithMassEdit = (tracksToUpdate: any[]) => {
    let updatedCount = 0;

    tracksToUpdate.forEach(track => {
      const updates: any = {};
      if (massEditData.artist) updates.artist = massEditData.artist;
      if (massEditData.album) updates.album = massEditData.album;
      if (massEditData.genre) updates.genre = massEditData.genre;
      if (massEditData.year) updates.year = massEditData.year;

      if (Object.keys(updates).length > 0) {
        updateTrack(track.id, updates);
        updatedCount++;
      }
    });

    // Reset mass edit form after successful update
    setMassEditData({
      artist: '',
      album: '',
      genre: '',
      year: ''
    });

    // Show success message with options
    Alert.alert(
      'Mass Edit Complete', 
      `Successfully updated ${updatedCount} track${updatedCount !== 1 ? 's' : ''}.`, 
      [
        {
          text: 'Edit More Tracks',
          onPress: () => {
            // Stay on the current screen to make more edits
          }
        },
        {
          text: 'Back to Menu',
          onPress: () => setCurrentStep('manual-edit-choice'),
          style: 'cancel'
        }
      ]
    );
  };

  const renderUploadStep = () => (
    <ModernCard style={styles.uploadStepCard}>
      <Text style={styles.uploadStepTitle}>Upload Metadata File</Text>
      <Text style={styles.uploadStepDescription}>
        Upload a JSON, CSV, or TXT file containing track metadata
      </Text>

      <ModernButton
        title="Choose Metadata File"
        onPress={handleMetadataUpload}
        icon={Upload}
        style={styles.uploadButton}
      />

      <View style={styles.formatInfo}>
        <Text style={styles.formatTitle}>Supported formats:</Text>
        <Text style={styles.formatText}>• JSON: Spotify Web API format</Text>
        <Text style={styles.formatText}>• CSV/TXT: title,artist,album,genre,year,duration</Text>
      </View>
    </ModernCard>
  );

  const renderPreviewStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard style={styles.stepCard}>
        <Text style={styles.stepTitle}>Metadata Preview</Text>
        <Text style={styles.stepDescription}>
          Found {uploadedMetadata.length} tracks in metadata file
        </Text>
      </ModernCard>

      <ScrollView style={styles.metadataListFixed}>
        {uploadedMetadata.map(track => (
          <ModernCard key={track.id} style={styles.trackPreviewSmall}>
            <View style={styles.trackPreviewContentSmall}>
              {track.albumArt && (
                <Image source={{ uri: track.albumArt }} style={styles.albumArtSmall} />
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitleSmall}>{track.title}</Text>
                <Text style={styles.trackArtistSmall}>{track.artist}</Text>
                <Text style={styles.trackAlbumSmall}>{track.album}</Text>
              </View>
            </View>
          </ModernCard>
        ))}
      </ScrollView>

      <View style={styles.fixedNavigationButtons}>
        <ModernButton
          title="Back"
          onPress={() => setCurrentStep('upload')}
          style={styles.backButtonNav}
        />
        <ModernButton
          title="Continue"
          onPress={() => setCurrentStep('choose-method')}
          icon={ChevronRight}
        />
      </View>
    </View>
  );

  const renderChooseMethodStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard style={styles.stepCard}>
        <Text style={styles.stepTitle}>Choose Labeling Method</Text>
        <Text style={styles.stepDescription}>
          How would you like to apply the metadata?
        </Text>
      </ModernCard>

      <ModernCard style={styles.methodCard}>
        <TouchableOpacity
          style={[styles.methodOption, selectedMethod === 'auto' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('auto')}
        >
          <Zap size={24} color={selectedMethod === 'auto' ? "#000000" : "#1DB954"} />
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, selectedMethod === 'auto' && { color: '#000000' }]}>Auto Label</Text>
            <Text style={[styles.methodDescription, selectedMethod === 'auto' && { color: '#000000', opacity: 0.8 }]}>
              Automatically match metadata to songs based on title similarity
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodOption, selectedMethod === 'manual' && styles.selectedMethod]}
          onPress={() => setSelectedMethod('manual')}
        >
          <Edit3 size={24} color={selectedMethod === 'manual' ? "#000000" : "#1DB954"} />
          <View style={styles.methodInfo}>
            <Text style={[styles.methodTitle, selectedMethod === 'manual' && { color: '#000000' }]}>Manual Edit</Text>
            <Text style={[styles.methodDescription, selectedMethod === 'manual' && { color: '#000000', opacity: 0.8 }]}>
              Manually edit track metadata with your own data
            </Text>
          </View>
        </TouchableOpacity>
      </ModernCard>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          onPress={() => setCurrentStep('preview')}
          style={styles.backButton}
        />
        <ModernButton
          title="Continue"
          onPress={() => {
            if (selectedMethod === 'auto') {
              setCurrentStep('auto-label');
            } else if (selectedMethod === 'manual') {
              setCurrentStep('manual-edit-choice');
            }
          }}
          disabled={!selectedMethod}
          icon={ChevronRight}
        />
      </View>
    </View>
  );

  const renderAutoLabelStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard style={styles.stepCard}>
        <Text style={styles.stepTitle}>Auto Label Configuration</Text>
        <Text style={styles.stepDescription}>
          Choose playlists or specific tracks to auto-label
        </Text>
      </ModernCard>

      <View style={styles.selectionOptions}>
        <ModernButton
          title="Label All Tracks"
          onPress={() => {
            setSelectedTracks(new Set(tracks.map(t => t.id)));
            handleAutoLabel();
          }}
          icon={SelectAll}
          style={styles.selectionButton}
          textStyle={styles.selectionButtonText}
        />

        <ModernButton
          title="Label Selected Playlists"
          onPress={() => setCurrentStep('manual-edit-mass')}
          icon={Album}
          style={styles.selectionButton}
          textStyle={styles.selectionButtonText}
        />
      </View>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          onPress={() => setCurrentStep('choose-method')}
          style={styles.backButtonWithText}
        />
      </View>
    </View>
  );

  const renderMassEditStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard style={styles.stepCard}>
        <Text style={styles.stepTitle}>Mass Edit Playlists</Text>
        <Text style={styles.stepDescription}>
          Select tracks in playlists to mass edit their metadata
        </Text>
      </ModernCard>

      <ScrollView style={styles.playlistsList}>
        {playlistsWithSelection.map(playlist => (
          <ModernCard key={playlist.id} style={styles.playlistCard}>
            <TouchableOpacity
              style={styles.playlistHeader}
              onPress={() => togglePlaylistExpansion(playlist.id)}
            >
              <View style={styles.playlistInfo}>
                <Album size={20} color="#1DB954" />
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.trackCount}>({playlist.tracks.length} tracks)</Text>
              </View>
              {playlist.expanded ? (
                <ChevronDown size={20} color="#FFFFFF" />
              ) : (
                <ChevronRight size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {playlist.expanded && (
              <View style={styles.playlistTracks}>
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={() => toggleAllTracksInPlaylist(playlist.id)}
                >
                  <Check size={16} color="#1DB954" />
                  <Text style={styles.selectAllText}>
                    {playlist.selectedTracks.size === playlist.tracks.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>

                {playlist.tracks.map(track => (
                  <TouchableOpacity
                    key={track.id}
                    style={[
                      styles.trackItem,
                      playlist.selectedTracks.has(track.id) && styles.selectedTrack
                    ]}
                    onPress={() => toggleTrackSelection(playlist.id, track.id)}
                  >
                    <View style={styles.trackContent}>
                      {track.artwork && (
                        <Image source={{ uri: track.artwork }} style={styles.smallAlbumArt} />
                      )}
                      <View style={styles.trackDetails}>
                        <Text style={styles.trackTitle}>{track.title}</Text>
                        <Text style={styles.trackArtist}>{track.artist || 'Unknown Artist'}</Text>
                      </View>
                    </View>
                    {playlist.selectedTracks.has(track.id) && (
                      <Check size={20} color="#1DB954" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ModernCard>
        ))}
      </ScrollView>

      <ModernCard style={styles.massEditForm}>
        <Text style={styles.formTitle}>Mass Edit Fields</Text>
        <TextInput
          style={styles.input}
          placeholder="Artist Name"
          placeholderTextColor="#666"
          value={massEditData.artist}
          onChangeText={text => setMassEditData(prev => ({ ...prev, artist: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Album Name"
          placeholderTextColor="#666"
          value={massEditData.album}
          onChangeText={text => setMassEditData(prev => ({ ...prev, album: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Genre"
          placeholderTextColor="#666"
          value={massEditData.genre}
          onChangeText={text => setMassEditData(prev => ({ ...prev, genre: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Year"
          placeholderTextColor="#666"
          value={massEditData.year}
          onChangeText={text => setMassEditData(prev => ({ ...prev, year: text }))}
        />
      </ModernCard>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          onPress={handleBack}
          style={styles.backButton}
        />
        <ModernButton
          title="Apply Mass Edit"
          onPress={applyMassEdit}
          icon={Check}
          disabled={!playlistsWithSelection.some(playlist => playlist.selectedTracks.size > 0)}
        />
      </View>
    </View>
  );

  const renderManualEditChoiceStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard style={styles.stepCard}>
        <Text style={styles.stepTitle}>Manual Edit</Text>
        <Text style={styles.stepDescription}>
          Choose how you want to edit your metadata.
        </Text>
      </ModernCard>

      <View style={styles.selectionOptions}>
        <ModernButton
          title="Edit Single Tracks"
          onPress={() => setCurrentStep('manual-edit-single')}
          icon={Edit3}
          style={styles.selectionButton}
          textStyle={styles.selectionButtonText}
        />

        <ModernButton
          title="Mass Edit Playlists"
          onPress={() => setCurrentStep('manual-edit-mass')}
          icon={Album}
          style={styles.selectionButton}
          textStyle={styles.selectionButtonText}
        />
      </View>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Back"
          onPress={() => setCurrentStep('choose-method')}
          style={styles.backButtonWithText}
        />
      </View>
    </View>
  );

  const renderManualEditStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard style={styles.stepCard}>
        <Text style={styles.stepTitle}>Manual Edit Tracks</Text>
        <Text style={styles.stepDescription}>
          Click on any track to edit its metadata
        </Text>
      </ModernCard>

      <ScrollView style={styles.tracksList}>
        {tracks.map(track => (
          <TouchableOpacity
            key={track.id}
            style={styles.editableTrackItem}
            onPress={() => setEditingTrack(track)}
          >
            <View style={styles.trackContent}>
              {track.artwork && (
                <Image source={{ uri: track.artwork }} style={styles.smallAlbumArt} />
              )}
              <View style={styles.trackDetails}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist || 'Unknown Artist'}</Text>
                <Text style={styles.trackAlbum}>{track.album || 'Unknown Album'}</Text>
              </View>
            </View>
            <Edit3 size={20} color="#1DB954" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ModernButton
        title="Done"
        onPress={() => setCurrentStep('upload')}
        style={styles.doneButton}
      />
    </View>
  );

  const renderEditModal = () => {
    if (!editingTrack) return null;

    return (
      <View style={styles.modalOverlay}>
        <ModernCard style={styles.editModal}>
          <Text style={styles.modalTitle}>Edit Track Metadata</Text>

          <TextInput
            style={styles.input}
            placeholder="Track Title"
            placeholderTextColor="#666"
            value={editingTrack.title}
            onChangeText={text => setEditingTrack(prev => ({ ...prev, title: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Artist"
            placeholderTextColor="#666"
            value={editingTrack.artist || ''}
            onChangeText={text => setEditingTrack(prev => ({ ...prev, artist: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Album"
            placeholderTextColor="#666"
            value={editingTrack.album || ''}
            onChangeText={text => setEditingTrack(prev => ({ ...prev, album: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Genre"
            placeholderTextColor="#666"
            value={editingTrack.genre || ''}
            onChangeText={text => setEditingTrack(prev => ({ ...prev, genre: text }))}
          />

          <View style={styles.modalButtons}>
            <ModernButton
              title="Cancel"
              onPress={() => setEditingTrack(null)}
              style={styles.cancelButton}
            />
            <ModernButton
              title="Save"
              onPress={() => {
                updateTrack(editingTrack.id, editingTrack);
                setEditingTrack(null);
              }}
              icon={Check}
            />
          </View>
        </ModernCard>
      </View>
    );
  };

  const renderPostAutoLabel = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Auto-Labeling Complete</Text>
      <Text style={styles.stepDescription}>
        Successfully matched {autoLabelResults.length} tracks. Would you like to manually edit the metadata?
      </Text>

      <ScrollView style={styles.metadataList}>
        {autoLabelResults.map((result, index) => (
          <ModernCard key={index} style={styles.trackPreview}>
            <View style={styles.trackPreviewContent}>
              {result.metadata.albumArt && (
                <Image source={{ uri: result.metadata.albumArt }} style={styles.albumArt} />
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{result.metadata.title}</Text>
                <Text style={styles.trackArtist}>{result.metadata.artist}</Text>
                <Text style={styles.trackAlbum}>
                Match confidence: {(result.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </ModernCard>
        ))}
      </ScrollView>

      <View style={styles.navigationButtons}>
        <ModernButton
          title="Manual Edit"
          onPress={() => setCurrentStep('manual-edit-choice')}
          style={styles.backButton}
        />
        <ModernButton
          title="Done"
          onPress={() => setCurrentStep('upload')}
          icon={Check}
        />
      </View>
    </View>
  );

  const renderInitialChoiceStep = () => (
    <View style={styles.stepContainer}>
      <ModernCard variant="dark" style={styles.darkStepCard}>
        <Text style={styles.darkStepTitle}>Edit Metadata</Text>
        <Text style={styles.darkStepDescription}>
          Choose how you want to edit your metadata
        </Text>
      </ModernCard>

      <View style={styles.selectionOptions}>
        <ModernButton
          title="Upload Metadata File"
          onPress={() => setCurrentStep('upload')}
          icon={Upload}
          style={styles.selectionButton}
          textStyle={styles.selectionButtonText}
        />

        <ModernButton
          title="Manual Edit"
          onPress={() => setCurrentStep('manual-edit-choice')}
          icon={Edit3}
          style={styles.selectionButton}
          textStyle={styles.selectionButtonText}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'initial-choice':
        return renderInitialChoiceStep();
      case 'upload':
        return renderUploadStep();
      case 'preview':
        return renderPreviewStep();
      case 'choose-method':
        return renderChooseMethodStep();
      case 'auto-label':
        return renderAutoLabelStep();
      case 'manual-edit-choice':
        return renderManualEditChoiceStep();
      case 'manual-edit-single':
        return renderManualEditStep();
      case 'manual-edit-mass':
        return renderMassEditStep();
      case 'post-auto-edit':
        return renderPostAutoLabel();
      default:
        return renderUploadStep();
    }
  };

  const handleBack = () => {
    if (currentStep === 'initial-choice') {
      // Exit the metadata screen entirely and go back to Settings
      if (Platform.OS === 'web') {
        // For web, we need to set the current screen back to Settings
        window.dispatchEvent(new CustomEvent('navigateToSettings'));
      } else {
        navigation?.navigate('Settings');
      }
    } else if (currentStep === 'upload') {
      setCurrentStep('initial-choice');
    } else if (currentStep === 'preview') {
      setCurrentStep('upload');
    } else if (currentStep === 'choose-method') {
      setCurrentStep('preview');
    } else if (currentStep === 'auto-label') {
      setCurrentStep('choose-method');
    } else if (currentStep === 'manual-edit-choice') {
      setCurrentStep('choose-method');
    } else if (currentStep === 'manual-edit-single') {
      setCurrentStep('manual-edit-choice');
    } else if (currentStep === 'manual-edit-mass') {
      setCurrentStep('manual-edit-choice');
    } else if (currentStep === 'post-auto-edit') {
      setCurrentStep('auto-label');
    } else {
      setCurrentStep('initial-choice');
    }
  };

  const handleExit = () => {
    // Exit the metadata screen entirely
    if (Platform.OS === 'web') {
      // For web, we need to set the current screen back to Settings
      window.dispatchEvent(new CustomEvent('navigateToSettings'));
    } else {
      navigation?.navigate('Settings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleExit}
          style={styles.backButton}
        >
          <X size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Metadata Management</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {currentStep === 'initial-choice' && 'Choose Action'}
            {currentStep === 'upload' && 'Upload Metadata'}
            {currentStep === 'preview' && 'Preview'}
            {currentStep === 'choose-method' && 'Choose Method'}
            {currentStep === 'auto-label' && 'Auto Label'}
            {currentStep === 'manual-edit-choice' && 'Manual Edit'}
            {currentStep === 'manual-edit-single' && 'Single Track Edit'}
            {currentStep === 'manual-edit-mass' && 'Mass Edit'}
            {currentStep === 'post-auto-edit' && 'Review Changes'}
          </Text>
        </View>
      </View>

      {renderCurrentStep()}
      {editingTrack && renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    minHeight: '100vh',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  stepIndicator: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  stepText: {
    color: '#B3B3B3',
    fontSize: 12,
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
  },
  stepCard: {
    marginBottom: 16,
    backgroundColor: '#1DB954',
    padding: 16,
    borderRadius: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    opacity: 0.8,
  },
  darkStepCard: {
    marginBottom: 16,
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
  },
  darkStepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  darkStepDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.8,
  },
  uploadStepCard: {
    marginBottom: 16,
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
  },
  uploadStepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadStepDescription: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 20,
  },
  uploadButton: {
    marginTop: 20,
    backgroundColor: '#1DB954',
  },
  formatInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  formatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formatText: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 4,
  },
  metadataList: {
    flex: 1,
    marginBottom: 16,
  },
  metadataListFixed: {
    flex: 1,
    marginBottom: 0,
    maxHeight: 400,
  },
  trackPreview: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#282828',
    borderRadius: 8,
  },
  trackPreviewSmall: {
    marginBottom: 6,
    padding: 8,
  },
  trackPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackPreviewContentSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  albumArtSmall: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 8,
  },
  smallAlbumArt: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackTitleSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#E6E6E6',
    marginTop: 5,
    marginBottom: 2,
  },
  trackArtistSmall: {
    fontSize: 12,
    color: '#E6E6E6',
    marginBottom: 1,
  },
  trackAlbum: {
    fontSize: 12,
    color: '#666666',
  },
  trackAlbumSmall: {
    fontSize: 11,
    color: '#666666',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  backButtonNav: {
    flex: 1,
    backgroundColor: '#333333',
    minWidth: 120,
  },
  fixedNavigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#000000',
  },
  methodCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#282828',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  selectedMethod: {
    backgroundColor: '#1DB954',
  },
  methodInfo: {
    marginLeft: 12,
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 18,
  },
  selectionOptions: {
    gap: 12,
    marginBottom: 20,
  },
  selectionButton: {
    marginBottom: 12,
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  selectionButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  backButtonWithText: {
    backgroundColor: '#282828',
    borderColor: '#282828',
    flex: 1,
  },
  playlistsList: {
    flex: 1,
    marginBottom: 16,
  },
  playlistCard: {
    marginBottom: 8,
    padding: 0,
    overflow: 'hidden',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    marginRight: 8,
  },
  trackCount: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  playlistTracks: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    backgroundColor: '#1A1A1A',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  selectAllText: {
    fontSize: 14,
    color: '#1DB954',
    marginLeft: 8,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  selectedTrack: {
    backgroundColor: '#1A4A2E',
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackDetails: {
    flex: 1,
  },
  massEditForm: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#1DB954',
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#282828',
    color: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  tracksList: {
    flex: 1,
    marginBottom: 16,
  },
  editableTrackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 8,
  },
  doneButton: {
    backgroundColor: '#1DB954',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editModal: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#282828',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#535353',
    borderColor: '#535353',
  },
  resultItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultInfo: {
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  resultConfidence: {
    fontSize: 12,
    color: '#666666',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default MetadataManagementScreen;