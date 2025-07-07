import React, { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import { WebMusicProvider } from './context/WebMusicContext';
import { MusicProvider } from './context/MusicContext';

const Stack = createStackNavigator();

// Web-specific imports
let TrackPlayer: any;
if (Platform.OS !== 'web') {
  TrackPlayer = require('react-native-track-player').default;
  const { playbackService } = require('./services/playbackService');
  TrackPlayer.registerPlaybackService(() => playbackService);
}

function App(): JSX.Element {
  const [isPlayerReady, setIsPlayerReady] = useState(Platform.OS === 'web');

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

  if (!isPlayerReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      </View>
    );
  }

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