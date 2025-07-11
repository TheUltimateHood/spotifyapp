
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Music } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  type?: 'default' | 'track' | 'playlist';
}

export default function LoadingState({ 
  message = 'Loading...', 
  type = 'default' 
}: LoadingStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'track':
        return <Music size={32} color="#1DB954" />;
      case 'playlist':
        return <Music size={32} color="#1DB954" />;
      default:
        return <LoadingSpinner size={32} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {getIcon()}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#b3b3b3',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});
