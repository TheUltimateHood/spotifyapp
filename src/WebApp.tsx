import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebMusicProvider } from './context/WebMusicContext';

// Simple web-compatible version to start
const WebHomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Music Player</Text>
        <Text style={styles.subtitle}>Web Preview</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Welcome to your music player! 
        </Text>
        <Text style={styles.description}>
          Upload audio files to get started.
        </Text>
      </View>
      
      <View style={styles.controls}>
        <View style={styles.controlButton}>
          <Text style={styles.buttonText}>⏸️ Pause</Text>
        </View>
        <View style={styles.controlButton}>
          <Text style={styles.buttonText}>⏯️ Play</Text>
        </View>
        <View style={styles.controlButton}>
          <Text style={styles.buttonText}>⏭️ Next</Text>
        </View>
      </View>
    </View>
  );
};

function WebApp(): JSX.Element {
  return (
    <WebMusicProvider>
      <View style={styles.app}>
        <WebHomeScreen />
      </View>
    </WebMusicProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1db954',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#b3b3b3',
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WebApp;