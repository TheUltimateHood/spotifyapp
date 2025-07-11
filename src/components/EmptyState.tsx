
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Music, Plus, Search, List } from 'lucide-react';
import ModernButton from './ModernButton';
import ModernCard from './ModernCard';

interface EmptyStateProps {
  type: 'tracks' | 'playlists' | 'search' | 'playlist-tracks';
  onAction?: () => void;
  actionText?: string;
}

export default function EmptyState({ type, onAction, actionText }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'tracks':
        return {
          icon: <Music size={64} color="#535353" />,
          title: 'No music yet',
          message: 'Add some tracks to get started with your music library.',
          action: actionText || 'Add Music',
          actionIcon: <Plus size={20} color="#000" />,
        };
      case 'playlists':
        return {
          icon: <List size={64} color="#535353" />,
          title: 'No playlists',
          message: 'Create your first playlist to organize your music.',
          action: actionText || 'Create Playlist',
          actionIcon: <Plus size={20} color="#000" />,
        };
      case 'search':
        return {
          icon: <Search size={64} color="#535353" />,
          title: 'No results found',
          message: 'Try searching with different keywords.',
          action: null,
          actionIcon: null,
        };
      case 'playlist-tracks':
        return {
          icon: <Music size={64} color="#535353" />,
          title: 'Empty playlist',
          message: 'Add some tracks to this playlist.',
          action: actionText || 'Add Tracks',
          actionIcon: <Plus size={20} color="#000" />,
        };
      default:
        return {
          icon: <Music size={64} color="#535353" />,
          title: 'Nothing here',
          message: 'Nothing to see here yet.',
          action: null,
          actionIcon: null,
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <ModernCard style={styles.card}>
        <View style={styles.iconContainer}>
          {content.icon}
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.message}>{content.message}</Text>
        {content.action && onAction && (
          <ModernButton
            title={content.action}
            onPress={onAction}
            style={styles.actionButton}
            icon={content.actionIcon}
          />
        )}
      </ModernCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    padding: 40,
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  actionButton: {
    width: '100%',
  },
});
