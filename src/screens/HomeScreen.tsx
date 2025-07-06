import React, { useState } from 'react';
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
import DocumentPicker from 'react-native-document-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Track } from 'react-native-track-player';
import { useMusicContext } from '../context/MusicContext';
import TrackItem from '../components/TrackItem';
import PlayerControls from '../components/PlayerControls';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { tracks, addTracks, currentTrack, isPlaying } = useMusicContext();
  const [loading, setLoading] = useState(false);

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
      
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Storage permission is required to access music files.');
        return;
      }

      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        allowMultiSelection: true,
      });

      const newTracks: Track[] = results.map((result, index) => ({
        id: `track_${Date.now()}_${index}`,
        url: result.uri,
        title: result.name?.replace(/\.[^/.]+$/, '') || 'Unknown Track',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        artwork: undefined,
      }));

      addTracks(newTracks);
      Alert.alert('Success', `Added ${newTracks.length} track(s) to your library`);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking files:', error);
        Alert.alert('Error', 'Failed to pick audio files. Please try again.');
      }
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>Your Music</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={pickAudioFiles}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Loading...' : '+ Add Music'}
          </Text>
        </TouchableOpacity>
      </View>

      {tracks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Music Added</Text>
          <Text style={styles.emptyStateText}>
            Tap "Add Music" to choose audio files from your device
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          style={styles.trackList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {currentTrack && (
        <View style={styles.miniPlayer}>
          <PlayerControls mini={true} />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 22,
  },
  trackList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  miniPlayer: {
    backgroundColor: '#282828',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});

export default HomeScreen;