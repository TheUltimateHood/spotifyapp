import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Switch,
} from 'react-native';
import { 
  Settings, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Download,
  Info,
  ChevronRight 
} from 'lucide-react';

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
    shuffleMode, 
    repeatMode, 
    toggleShuffle, 
    toggleRepeat,
    clearTracks 
  } = context;

  const settingsItems = [
    {
      icon: <Volume2 size={20} color="#fff" />,
      title: 'Audio Quality',
      subtitle: 'High quality streaming',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Shuffle size={20} color="#fff" />,
      title: 'Shuffle Mode',
      subtitle: shuffleMode ? 'On' : 'Off',
      onPress: toggleShuffle,
      showSwitch: true,
      switchValue: shuffleMode || false,
    },
    {
      icon: <Repeat size={20} color="#fff" />,
      title: 'Repeat Mode',
      subtitle: repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One',
      onPress: toggleRepeat,
      showChevron: true,
    },
    {
      icon: <Download size={20} color="#fff" />,
      title: 'Storage',
      subtitle: `${tracks.length} songs in library`,
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: <Info size={20} color="#fff" />,
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => {},
      showChevron: true,
    },
  ];

  const renderSettingItem = (item: any, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.settingItem} 
      onPress={item.onPress}
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
            onValueChange={item.onPress}
            trackColor={{ false: '#767577', true: '#1db954' }}
            thumbColor={item.switchValue ? '#fff' : '#f4f3f4'}
          />
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

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          {settingsItems.slice(0, 3).map(renderSettingItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          {settingsItems.slice(3, 4).map((item, index) => renderSettingItem(item, index + 3))}
          
          {tracks.length > 0 && (
            <TouchableOpacity 
              style={[styles.settingItem, styles.clearButton]} 
              onPress={clearTracks}
            >
              <Text style={styles.clearButtonText}>Clear All Music</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          {settingsItems.slice(4).map((item, index) => renderSettingItem(item, index + 4))}
        </View>
      </View>
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
  clearButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SettingsScreen;