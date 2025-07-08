import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  Volume2, 
  Trash2,
  Database,
  Info,
  ChevronRight,
  Repeat,
  Shuffle,
  Download
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

const SettingsScreen: React.FC = () => {
  const context = useMusicContext();
  const { 
    tracks, 
    clearTracks,
    shuffleMode,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    removeTrack,
    volume,
    setVolume
  } = context;

  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

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

  const getRepeatModeText = () => {
    switch (repeatMode) {
      case 'off': return 'Off';
      case 'all': return 'All';
      case 'one': return 'One';
      default: return 'Off';
    }
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
        {/* Playback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          
          {renderSettingItem({
            icon: <Shuffle size={20} color="#fff" />,
            title: 'Shuffle',
            subtitle: 'Randomize playback order',
            showSwitch: true,
            switchValue: shuffleMode,
            onToggle: toggleShuffle,
          })}
          
          {renderSettingItem({
            icon: <Repeat size={20} color="#fff" />,
            title: 'Repeat',
            subtitle: 'Control repeat behavior',
            showValue: true,
            value: getRepeatModeText(),
            onPress: toggleRepeat,
          })}
          
          {Platform.OS === 'web' && renderSettingItem({
            icon: <Volume2 size={20} color="#fff" />,
            title: 'Volume',
            subtitle: `Audio output level: ${Math.round(volume * 100)}%`,
            showValue: true,
            value: `${Math.round(volume * 100)}%`,
            onPress: () => {},
            disabled: true,
          })}
        </View>

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
          
          {tracks.length > 0 && (
            <TouchableOpacity 
              style={[styles.settingItem, styles.clearButton]} 
              onPress={handleClearTracks}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, styles.destructiveIcon]}>
                  <Trash2 size={20} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.clearButtonText}>Clear All Music</Text>
                  <Text style={styles.clearButtonSubtitle}>Remove all songs from library</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#fff" />
            </TouchableOpacity>
          )}
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
        confirmationText="Delete all songs in library"
        onConfirm={confirmClearTracks}
        onCancel={() => setShowClearConfirmation(false)}
        destructive={true}
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
});

export default SettingsScreen;