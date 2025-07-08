
import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
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
  const [currentScreen, setCurrentScreen] = useState('Home');
  
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

  // Web version without React Navigation
  if (Platform.OS === 'web') {
    return (
      <Provider>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        {currentScreen === 'Home' ? (
          <HomeScreen navigation={{ navigate: (screen: string) => setCurrentScreen(screen) }} />
        ) : (
          <PlayerScreen navigation={{ goBack: () => setCurrentScreen('Home') }} />
        )}
      </Provider>
    );
  }

  // Native version with React Navigation
  return (
    <Provider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Music Player' }}
          />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{ title: 'Now Playing' }}
          />
        </Stack.Navigator>
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
});

export default App;
