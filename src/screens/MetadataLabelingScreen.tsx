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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface Metadata {
  [key: string]: string | number | undefined;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: string;
  trackNumber: number;
  year: number;
  genre: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: string;
  trackNumber: number;
  year: number;
  genre: string;
}

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  selected: boolean;
}

const MetadataLabelingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [metadataFile, setMetadataFile] = useState<Metadata[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isAutoLabeling, setIsAutoLabeling] = useState(false);
  const [isManualLabeling, setIsManualLabeling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMetadataUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setLoading(true);
        const fileUri = result.uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        
        // Parse CSV content
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',');
        const metadata = lines.slice(1).map(line => {
          const values = line.split(',');
          const song: Metadata = {};
          headers.forEach((header, index) => {
            if (header && values[index]) {
              song[header.trim()] = values[index].trim();
            }
          });
          return song;
        });

        setMetadataFile(metadata);
        setLoading(false);
        Alert.alert('Success', 'Metadata file uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading metadata:', error);
      Alert.alert('Error', 'Failed to upload metadata file');
      setLoading(false);
    }
  };

  const handleAutoLabel = async () => {
    if (metadataFile.length === 0) {
      Alert.alert('Error', 'Please upload a metadata file first');
      return;
    }

    setLoading(true);
    try {
      // Implement matching algorithm
      const matchedSongs = metadataFile.map((meta, index) => ({
        ...meta,
        id: `auto_${index}`,
        albumArt: 'default_album_art.png',
      }));

      // Find matches between metadata and existing songs
      const matches = matchedSongs.map(meta => {
        const matchingSongs = playlists.flatMap(playlist => 
          playlist.songs.filter(song => 
            song.title.toLowerCase().includes(meta.title.toLowerCase()) ||
            song.artist.toLowerCase().includes(meta.artist.toLowerCase())
          )
        );
        return {
          metadata: meta,
          matches: matchingSongs
        };
      });

      // Show matching results
      setSelectedSongs(matches.flatMap(match => match.matches));
      setIsAutoLabeling(true);
      setLoading(false);

      Alert.alert(
        'Auto-Labeling Complete',
        'Songs have been automatically labeled. Would you like to manually adjust any labels?',
        [
          {
            text: 'Yes',
            onPress: () => setIsManualLabeling(true),
          },
          {
            text: 'No',
            onPress: () => {
              setIsAutoLabeling(false);
              // Apply the matched metadata to songs
              matches.forEach(match => {
                if (match.matches.length > 0) {
                  // Apply metadata to all matches
                  const updatedSongs = match.matches.map(song => ({
                    ...song,
                    ...match.metadata
                  }));

                  // Update playlists with new metadata
                  playlists.forEach(playlist => {
                    const updatedSongsInPlaylist = playlist.songs.map(song => {
                      const matchIndex = match.matches.findIndex(m => m.id === song.id);
                      if (matchIndex !== -1) {
                        return updatedSongs[matchIndex];
                      }
                      return song;
                    });
                    playlist.songs = updatedSongsInPlaylist;
                  });
                }
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error auto-labeling:', error);
      Alert.alert('Error', 'Failed to auto-label songs');
      setLoading(false);
    }
  };

  const handleManualLabel = () => {
    if (selectedSongs.length === 0) {
      Alert.alert('Error', 'Please select songs to manually label');
      return;
    }

    // Show available metadata options
    Alert.alert(
      'Select Metadata',
      'Choose which metadata to apply to selected songs:',
      metadataFile.map((meta, index) => ({
        text: `${meta.title} - ${meta.artist}`,
        onPress: () => {
          // Apply selected metadata to all selected songs
          const updatedSongs = selectedSongs.map(song => ({
            ...song,
            ...meta,
          }));

          // Update playlists with new metadata
          playlists.forEach(playlist => {
            const updatedSongsInPlaylist = playlist.songs.map(song => {
              const matchIndex = selectedSongs.findIndex(s => s.id === song.id);
              if (matchIndex !== -1) {
                return updatedSongs[matchIndex];
              }
              return song;
            });
            playlist.songs = updatedSongsInPlaylist;
          });

          Alert.alert('Success', 'Metadata applied successfully');
          setIsManualLabeling(false);
        },
      }))
    );
  };

  const handleMassEditPlaylist = () => {
    if (!selectedPlaylist) return;

    Alert.prompt(
      'Mass Edit Playlist',
      'Enter the artist name to apply to all selected songs:',
      (artistName) => {
        if (!artistName) return;

        const updatedSongs = selectedPlaylist.songs.map(song => ({
          ...song,
          artist: artistName,
        }));

        const updatedPlaylist = {
          ...selectedPlaylist,
          songs: updatedSongs,
        };

        setPlaylists(playlists.map(p => 
          p.id === selectedPlaylist.id ? updatedPlaylist : p
        ));

        Alert.alert('Success', 'Artist name updated for selected songs');
      }
    );
  };

  const renderSongItem = (song: Song, isEditable: boolean, metadata?: Metadata, isSelected: boolean = false) => (
    <View style={[
      styles.songItem,
      isSelected && styles.songSelected
    ]}>
      <Image 
        source={{ uri: song.albumArt }} 
        style={styles.albumArt}
      />
      <View style={styles.songDetails}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.artistName}>{song.artist}</Text>
        <Text style={styles.album}>{song.album}</Text>
        <Text style={styles.trackInfo}>
          {song.trackNumber} • {song.duration} • {song.year}
        </Text>
        <Text style={styles.genre}>{song.genre}</Text>
        {metadata && (
          <View style={styles.metadataPreview}>
            <Text style={styles.metadataLabel}>Preview:</Text>
            <Text style={styles.metadataValue}>
              {metadata.title} - {metadata.artist}
            </Text>
          </View>
        )}
      </View>
      {isEditable && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            Alert.prompt(
              'Edit Metadata',
              'Enter new metadata values:',
              (newMetadata) => {
                if (!newMetadata) return;
                try {
                  const metadata = JSON.parse(newMetadata);
                  const updatedSong = {
                    ...song,
                    ...metadata,
                  };
                  setSelectedSongs(prev => 
                    prev.map(s => s.id === song.id ? updatedSong : s)
                  );
                } catch (error) {
                  Alert.alert('Error', 'Invalid metadata format');
                }
              },
              'plain-text',
              JSON.stringify(song, null, 2)
            );
          }}
        >
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPlaylist = (playlist: Playlist) => (
    <View style={styles.playlist}>
      <TouchableOpacity
        onPress={() => setSelectedPlaylist(playlist)}
        style={[
          styles.playlistHeader,
          playlist.selected && styles.playlistSelected
        ]}
      >
        <View style={styles.playlistHeaderContent}>
          <TextInput
            style={styles.playlistNameInput}
            value={playlist.name}
            onChangeText={(text) => {
              const updatedPlaylist = {
                ...playlist,
                name: text,
              };
              setPlaylists(playlists.map(p => 
                p.id === playlist.id ? updatedPlaylist : p
              ));
            }}
          />
          <TouchableOpacity
            onPress={() => {
              const updatedPlaylist = {
                ...playlist,
                selected: !playlist.selected,
              };
              setPlaylists(playlists.map(p => 
                p.id === playlist.id ? updatedPlaylist : p
              ));
            }}
            style={[
              styles.selectButton,
              playlist.selected && styles.selectButtonSelected
            ]}
          >
            <MaterialIcons 
              name={playlist.selected ? 'check-circle' : 'radio-button-unchecked'} 
              size={24} 
              color={playlist.selected ? '#fff' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {selectedPlaylist?.id === playlist.id && (
        <View style={styles.playlistSongs}>
          {playlist.songs.map((song, index) => (
            <View key={index} style={styles.songCheckbox}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  selectedSongs.includes(song) && styles.checkboxSelected
                ]}
                onPress={() => {
                  setSelectedSongs((prev) =>
                    prev.includes(song)
                      ? prev.filter(s => s !== song)
                      : [...prev, song]
                  );
                }}
              >
                {selectedSongs.includes(song) && (
                  <MaterialIcons name="check" size={20} color="white" />
                )}
              </TouchableOpacity>
              {renderSongItem(song, false)}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleMetadataUpload}
        >
          <MaterialIcons name="upload" size={24} color="white" />
          <Text style={styles.uploadButtonText}>Upload Metadata</Text>
        </TouchableOpacity>
      </View>

      {isAutoLabeling ? (
        <View style={styles.labelingContainer}>
          <Text style={styles.sectionTitle}>Auto-Label Preview</Text>
          <ScrollView style={styles.scrollContainer}>
            {selectedSongs.map((song, index) => (
              <View key={index}>
                {renderSongItem(song, true)}
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.metadataButton]}
              onPress={() => {
                setIsAutoLabeling(false);
                handleManualLabel();
              }}
            >
              <Text style={styles.metadataButtonText}>Manual Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.metadataButton]}
              onPress={() => setIsAutoLabeling(false)}
            >
              <Text style={styles.metadataButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isManualLabeling ? (
        <View style={styles.labelingContainer}>
          <Text style={styles.sectionTitle}>Manual Labeling</Text>
          <ScrollView style={styles.scrollContainer}>
            {selectedSongs.map((song, index) => (
              <View key={index}>
                {renderSongItem(song, true)}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          <ScrollView style={styles.scrollContainer}>
            {/* TODO: Map over playlists */}
            {renderPlaylist({
              id: '1',
              name: 'Sample Playlist',
              songs: []
            })}
          </ScrollView>
        </View>
      )}

      {selectedPlaylist && (
        <View style={styles.massEditContainer}>
          <TouchableOpacity
            style={[styles.massEditButton, styles.metadataButton]}
            onPress={handleMassEditPlaylist}
          >
            <Text style={styles.metadataButtonText}>Mass Edit Playlist</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  uploadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  playlistNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectButton: {
    padding: 8,
    borderRadius: 4,
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  selectButtonSelected: {
    backgroundColor: '#007AFF',
  },
  playlistSelected: {
    backgroundColor: '#f0f8ff',
  },
  button: {
    padding: 12,
    borderRadius: 20,
    margin: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  metadataButton: {
    backgroundColor: '#1DB954',
  },
  metadataButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  massEditButton: {
    padding: 16,
    borderRadius: 20,
    margin: 16,
    alignItems: 'center',
  },
  massEditContainer: {
    padding: 16,
  },
});

export default MetadataLabelingScreen;
