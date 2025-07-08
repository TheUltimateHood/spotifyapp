
import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'react-native';
import NewHomeScreen from './screens/NewHomeScreen';
import SearchScreen from './screens/SearchScreen';
import LibraryScreen from './screens/LibraryScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlayerScreen from './screens/PlayerScreen';
import BottomNavigation from './components/BottomNavigation';
import MiniPlayer from './components/MiniPlayer';
import { WebMusicProvider } from './context/WebMusicContext';
import { MusicProvider } from './context/MusicContext';

// Web-specific imports
let TrackPlayer: any;
let NavigationContainer: any;
let createStackNavigator: any;

if (Platform.OS !== 'web') {
  TrackPlayer = require('react-native-track-player').default;
  const { playbackService } = require('./services/playbackService');
  TrackPlayer.registerPlaybackService(() => playbackService);
  
  // Import navigation for native
  const navigation = require('@react-navigation/native');
  const stack = require('@react-navigation/stack');
  NavigationContainer = navigation.NavigationContainer;
  createStackNavigator = stack.createStackNavigator;
}

const Stack = Platform.OS !== 'web' ? createStackNavigator() : null;

function App(): JSX.Element {
  const [isPlayerReady, setIsPlayerReady] = useState(Platform.OS === 'web');
  const [activeTab, setActiveTab] = useState('Home');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
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
    // Track is already playing from the screen component
    // Just show the player modal
    setShowPlayerModal(true);
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <NewHomeScreen onTrackSelect={handleTrackSelect} />;
      case 'Search':
        return <SearchScreen onTrackSelect={handleTrackSelect} />;
      case 'Library':
        return <LibraryScreen onTrackSelect={handleTrackSelect} />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <NewHomeScreen onTrackSelect={handleTrackSelect} />;
    }
  };

  // Web version with bottom navigation
  if (Platform.OS === 'web') {
    return (
      <Provider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.container}>
          <View style={styles.content}>
            {renderCurrentScreen()}
          </View>
          <MiniPlayer onPress={() => setShowPlayerModal(true)} />
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
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

  // Native version with bottom navigation (same as web but with native navigation)
  return (
    <Provider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <View style={styles.container}>
          <View style={styles.content}>
            {renderCurrentScreen()}
          </View>
          <MiniPlayer onPress={() => setShowPlayerModal(true)} />
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          {showPlayerModal && (
            <View style={styles.playerModal}>
              <PlayerScreen navigation={{ goBack: () => setShowPlayerModal(false) }} />
            </View>
          )}
        </View>
      </NavigationContainer>
    </Provider>
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
});

export default App;
