
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Music, Plus, Search, List } from 'lucide-react';
import ModernButton from './ModernButton';
import ModernCard from './ModernCard';

export type EmptyStateType = 'library' | 'search' | 'playlist' | 'tracks';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const getContent = () => {
    switch (type) {
      case 'library':
        return {
          icon: <Music size={64} color="#666" />,
          title: 'Your library is empty',
          message: 'Add some music files to get started with your collection.',
          action: 'Add Music',
          actionIcon: <Plus size={20} color="#fff" />,
        };
      case 'search':
        return {
          icon: <Search size={64} color="#666" />,
          title: 'No results found',
          message: 'Try adjusting your search terms or browse your library.',
          action: null,
          actionIcon: null,
        };
      case 'playlist':
        return {
          icon: <List size={64} color="#666" />,
          title: 'No playlists yet',
          message: 'Create your first playlist to organize your music.',
          action: 'Create Playlist',
          actionIcon: <Plus size={20} color="#fff" />,
        };
      case 'tracks':
        return {
          icon: <Music size={64} color="#666" />,
          title: 'No tracks in this playlist',
          message: 'Add some tracks to start building your playlist.',
          action: 'Add Tracks',
          actionIcon: <Plus size={20} color="#fff" />,
        };
      default:
        return {
          icon: <Music size={64} color="#666" />,
          title: 'Nothing here yet',
          message: 'Start by adding some content.',
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
  },
});

export default EmptyState;
