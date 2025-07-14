import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'react-native';
import NewHomeScreen from './screens/NewHomeScreen';
import SearchScreen from './screens/SearchScreen';
import LibraryScreen from './screens/LibraryScreen';
import PlaylistsScreen from './screens/PlaylistsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlayerScreen from './screens/PlayerScreen';
import BottomNavigation from './components/BottomNavigation';
import MiniPlayer from './components/MiniPlayer';
import ShuffleRepeatControls from './components/ShuffleRepeatControls';
import { WebMusicProvider } from './context/WebMusicContext';
import { MusicProvider } from './context/MusicContext';
import ErrorBoundary from './components/ErrorBoundary';
import MetadataManagementScreen from './screens/MetadataManagementScreen';
import TabNavigator from './components/TabNavigator';

// Conditional imports for native vs web
let TrackPlayer: any;
let NavigationContainer: any;
let createStackNavigator: any;

if (Platform.OS !== 'web') {
  try {
    TrackPlayer = require('react-native-track-player').default;
    const { playbackService } = require('./services/playbackService');
    TrackPlayer.registerPlaybackService(() => playbackService);

    // Import navigation for native
    const { NavigationContainer: NavContainer } = require('@react-navigation/native');
    const { createStackNavigator: createStack } = require('@react-navigation/stack');
    NavigationContainer = NavContainer;
    createStackNavigator = createStack;
  } catch (error) {
    console.warn('Native dependencies not available:', error);
  }
}

const Stack = Platform.OS !== 'web' && createStackNavigator ? createStackNavigator() : null;

function App(): JSX.Element {
  const [isPlayerReady, setIsPlayerReady] = useState(Platform.OS === 'web');
  const [activeTab, setActiveTab] = useState('Home');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Library' | 'Player' | 'Playlists' | 'Search' | 'Settings' | 'MetadataManagement'>('Home');

  console.log('App component loading, Platform.OS:', Platform.OS);
  console.log('isPlayerReady:', isPlayerReady);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const setupPlayer = async () => {
        try {
          await TrackPlayer.setupPlayer();
          setIsPlayerReady(true);
        } catch (error) {
          console.log('Error setting up player:', error);
        }
      };

      setupPlayer();
    }
  }, []);

  const Provider = Platform.OS === 'web' ? WebMusicProvider : MusicProvider;
  console.log('Using provider:', Provider.name);

  if (!isPlayerReady) {
    console.log('Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      </View>
    );
  }

  console.log('Rendering main app');

  const handleTrackSelect = async (track: any) => {
    // Get the music context and play the track
    const context = useMusicContext();
    if (context?.playTrack) {
      await context.playTrack(track);
    }
    setShowPlayerModal(true);
  };

  // Platform-specific context hook
  let useMusicContext: any;
  if (Platform.OS === 'web') {
    const { useMusicContext: webContext } = require('./context/WebMusicContext');
    useMusicContext = webContext;
  } else {
    const { useMusicContext: nativeContext } = require('./context/MusicContext');
    useMusicContext = nativeContext;
  }

  const ShuffleRepeatControlsBar = () => {
    const context = useMusicContext();
    const { currentTrack, shuffleMode, repeatMode, toggleShuffle, toggleRepeat } = context;

    if (!currentTrack || !toggleShuffle || !toggleRepeat) return null;

    return (
      <View style={styles.shuffleRepeatBar}>
        <ShuffleRepeatControls 
          shuffleMode={shuffleMode}
          repeatMode={repeatMode}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
        />
      </View>
    );
  };

  const navigation = {
    navigate: (screen: string) => {
      setCurrentScreen(screen as any);
    },
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <NewHomeScreen onTrackSelect={handleTrackSelect} />;
      case 'Search':
        return <SearchScreen onTrackSelect={handleTrackSelect} />;
      case 'Library':
        return <LibraryScreen onTrackSelect={handleTrackSelect} />;
      case 'Playlists':
        return <PlaylistsScreen onTrackSelect={handleTrackSelect} />;
      case 'Settings':
        return <SettingsScreen navigation={navigation} />;
      default:
        return <NewHomeScreen onTrackSelect={handleTrackSelect} />;
    }
  };

  // Web version with bottom navigation
  if (Platform.OS === 'web') {
    const handleTabChange = (tab: string) => {
      setActiveTab(tab);
      setCurrentScreen(tab as any);
    };

    return (
      <Provider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.container}>
          <View style={styles.content}>
            {currentScreen === 'Home' && <NewHomeScreen onTrackSelect={handleTrackSelect} />}
            {currentScreen === 'Library' && <LibraryScreen navigation={navigation} />}
            {currentScreen === 'Playlists' && <PlaylistsScreen navigation={navigation} />}
            {currentScreen === 'Search' && <SearchScreen />}
            {currentScreen === 'Settings' && <SettingsScreen navigation={navigation} />}
            {currentScreen === 'MetadataManagement' && <MetadataManagementScreen navigation={navigation} />}
          </View>
          <MiniPlayer onPress={() => setShowPlayerModal(true)} />
          <ShuffleRepeatControlsBar />
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
          {showPlayerModal && (
            <View style={styles.playerModal}>
              <PlayerScreen navigation={{ goBack: () => setShowPlayerModal(false) }} />
            </View>
          )}
        </View>
      </Provider>
    );
  }

  // Native version with same UI as web
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentScreen(tab as any);
  };

  return (
    <ErrorBoundary>
      <MusicProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={[styles.container, styles.mobileContainer]}>
          <View style={[styles.content, styles.mobileContent]}>
            {currentScreen === 'Home' && <NewHomeScreen onTrackSelect={handleTrackSelect} />}
            {currentScreen === 'Library' && <LibraryScreen navigation={navigation} />}
            {currentScreen === 'Playlists' && <PlaylistsScreen navigation={navigation} />}
            {currentScreen === 'Search' && <SearchScreen />}
            {currentScreen === 'Settings' && <SettingsScreen navigation={navigation} />}
            {currentScreen === 'MetadataManagement' && <MetadataManagementScreen navigation={navigation} />}
          </View>
          <MiniPlayer onPress={() => setShowPlayerModal(true)} />
          <ShuffleRepeatControlsBar />
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
          {showPlayerModal && (
            <View style={styles.playerModal}>
              <PlayerScreen navigation={{ goBack: () => setShowPlayerModal(false) }} />
            </View>
          )}
        </View>
      </MusicProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
    minHeight: '100vh',
    overflowY: 'auto',
  },
  playerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#121212',
    zIndex: 1000,
  },
  shuffleRepeatBar: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileContainer: {
    ...Platform.select({
      ios: {
        paddingTop: 44, // Account for status bar on iOS
      },
      android: {
        paddingTop: 24, // Account for status bar on Android
      },
    }),
  },
  mobileContent: {
    ...Platform.select({
      ios: {
        paddingBottom: 120, // Account for bottom navigation and safe area
      },
      android: {
        paddingBottom: 100, // Account for bottom navigation
      },
    }),
  },
});

export default App;