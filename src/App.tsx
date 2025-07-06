import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import { MusicProvider } from './context/MusicContext';
import { playbackService } from './services/playbackService';

const Stack = createStackNavigator();

// Register the playback service
TrackPlayer.registerPlaybackService(() => playbackService);

function App(): JSX.Element {
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
      } catch (error) {
        console.log('Error setting up player:', error);
      }
    };
    
    setupPlayer();
  }, []);

  return (
    <MusicProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
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
    </MusicProvider>
  );
}

export default App;