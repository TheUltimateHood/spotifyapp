import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { 
  Trash2,
  Database,
  Info,
  ChevronRight,
  Download,
  Tag
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import TrackSelectionModal from '../components/TrackSelectionModal';
import MetadataManagementModal from '../components/MetadataManagementModal';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const context = useMusicContext();
  const { 
    tracks, 
    clearTracks,
    removeTrack,
    updateTrackMetadata
  } = context;

  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showDeleteSelectedConfirmation, setShowDeleteSelectedConfirmation] = useState(false);
  const [showTrackSelectionModal, setShowTrackSelectionModal] = useState(false);
  const [selectedTracksForDeletion, setSelectedTracksForDeletion] = useState<string[]>([]);

  const handleClearTracks = () => {
    setShowClearConfirmation(true);
  };

  const confirmClearTracks = () => {
    clearTracks();
    setShowClearConfirmation(false);
    Alert.alert('Success', 'All songs have been removed from your library');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLibrarySize = () => {
    // Estimate library size based on track count (approximate 4MB per track)
    const estimatedSize = tracks.length * 4 * 1024 * 1024;
    return formatFileSize(estimatedSize);
  };

  const handleDeleteSelectedTracks = () => {
    setShowTrackSelectionModal(true);
  };

  const handleTrackSelectionConfirm = (selectedTrackIds: string[]) => {
    setShowTrackSelectionModal(false);
    setShowDeleteSelectedConfirmation(true);
    setSelectedTracksForDeletion(selectedTrackIds);
  };

  const confirmDeleteSelectedTracks = () => {
    selectedTracksForDeletion.forEach(trackId => {
      removeTrack(trackId);
    });
    setShowDeleteSelectedConfirmation(false);
    setSelectedTracksForDeletion([]);
    Alert.alert('Success', `${selectedTracksForDeletion.length} song(s) have been removed from your library`);
  };

  const handleApplyMetadata = (updates: any[]) => {
    updates.forEach(update => {
      const track = tracks.find(t => t.id === update.trackId);
      if (track && updateTrackMetadata) {
        updateTrackMetadata(update.trackId, {
          artist: update.artistName || track.artist,
          artwork: update.albumArt || track.artwork,
          metadata: {
            spotifyId: update.spotifyId,
            artistName: update.artistName,
            albumArt: update.albumArt,
            isManuallyLabeled: update.isManuallyLabeled || false,
          }
        });
      }
    });
  };

  const renderSettingItem = (item: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={item.onPress}
      disabled={item.disabled}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {item.icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.showSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onToggle}
            trackColor={{ false: '#767577', true: '#1db954' }}
            thumbColor={item.switchValue ? '#fff' : '#f4f3f4'}
          />
        )}
        {item.showValue && (
          <Text style={styles.settingValue}>{item.value}</Text>
        )}
        {item.showChevron && (
          <ChevronRight size={16} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>

          {renderSettingItem({
            icon: <Database size={20} color="#fff" />,
            title: 'Library Size',
            subtitle: `${tracks.length} songs • ${getLibrarySize()}`,
            onPress: () => {},
            disabled: true,
          })}

          <TouchableOpacity 
            style={[styles.settingItem, styles.warningButton]} 
            onPress={handleDeleteSelectedTracks}
            disabled={tracks.length === 0}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, styles.warningIcon]}>
                <Trash2 size={20} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.warningButtonText, tracks.length === 0 && styles.disabledText]}>
                  Delete Selected Songs
                </Text>
                <Text style={[styles.warningButtonSubtitle, tracks.length === 0 && styles.disabledText]}>
                  {tracks.length === 0 ? 'No songs in library' : 'Choose specific songs to remove'}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={tracks.length === 0 ? "#666" : "#fff"} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.clearButton]} 
            onPress={handleClearTracks}
            disabled={tracks.length === 0}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, styles.destructiveIcon]}>
                <Trash2 size={20} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.clearButtonText, tracks.length === 0 && styles.disabledText]}>
                  Clear All Music
                </Text>
                <Text style={[styles.clearButtonSubtitle, tracks.length === 0 && styles.disabledText]}>
                  {tracks.length === 0 ? 'No songs in library' : 'Remove all songs from library'}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={tracks.length === 0 ? "#666" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Metadata Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metadata</Text>

          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('MetadataManagement', { initialStep: 'manual-edit-choice' })}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Tag size={20} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>Label Metadata</Text>
                <Text style={styles.settingSubtitle}>
                  Import Spotify metadata or manually label tracks
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>

          {renderSettingItem({
            icon: <Info size={20} color="#fff" />,
            title: 'Version',
            subtitle: 'Modern Music Player v1.0.0',
            onPress: () => {},
            disabled: true,
          })}

          {Platform.OS === 'web' && renderSettingItem({
            icon: <Download size={20} color="#fff" />,
            title: 'Platform',
            subtitle: 'Web Application',
            onPress: () => {},
            disabled: true,
          })}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showClearConfirmation}
        title="Clear All Music"
        message="This action will permanently remove all songs from your library. This cannot be undone."
        confirmationText="Delete all songs from storage"
        onConfirm={confirmClearTracks}
        onCancel={() => setShowClearConfirmation(false)}
        destructive={true}
      />

      <ConfirmationModal
        visible={showDeleteSelectedConfirmation}
        title="Delete Selected Songs"
        message={`This action will permanently remove ${selectedTracksForDeletion.length} song(s) from your library. This cannot be undone.`}
        confirmationText="Delete selected songs"
        onConfirm={confirmDeleteSelectedTracks}
        onCancel={() => setShowDeleteSelectedConfirmation(false)}
        destructive={true}
      />

      <TrackSelectionModal
        visible={showTrackSelectionModal}
        tracks={tracks}
        onConfirm={handleTrackSelectionConfirm}
        onCancel={() => setShowTrackSelectionModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 140 : 120, // Account for navbar
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b3b3b3',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: '#ff4444',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  settingRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#1db954',
    fontWeight: '600',
    marginRight: 8,
  },
  clearButton: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  clearButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonSubtitle: {
    fontSize: 14,
    color: '#ff6666',
    marginTop: 2,
  },
  warningButton: {
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ff8844',
  },
  warningIcon: {
    backgroundColor: '#ff8844',
  },
  warningButtonText: {
    color: '#ff8844',
    fontSize: 16,
    fontWeight: '600',
  },
  warningButtonSubtitle: {
    fontSize: 14,
    color: '#ffaa66',
    marginTop: 2,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default SettingsScreen;