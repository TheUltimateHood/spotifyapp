import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Clock, Heart, TrendingUp, Music } from 'lucide-react';
import TrackItem from '../components/TrackItem';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface NewHomeScreenProps {
  onTrackSelect: (track: any) => void;
}

const NewHomeScreen: React.FC<NewHomeScreenProps> = ({ onTrackSelect }) => {
  const context = useMusicContext();
  const { tracks, currentTrack } = context;

  // Get recently played tracks (last 5)
  const recentTracks = tracks.slice(-5).reverse();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const renderTrackItem = ({ item }: { item: any }) => (
    <TrackItem
      track={item}
      onPress={() => {
        context.playTrack(item);
        onTrackSelect(item);
      }}
      isCurrentTrack={currentTrack?.id === item.id}
    />
  );

  const renderSection = (title: string, icon: React.ReactNode, data: any[], showAll?: boolean) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            {icon}
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          {showAll && data.length > 5 && (
            <TouchableOpacity>
              <Text style={styles.showAllText}>Show all</Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={showAll ? data.slice(0, 5) : data}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>Welcome back to your music</Text>
      </View>

      {tracks.length === 0 ? (
        <View style={styles.emptyState}>
          <Music size={80} color="#666" />
          <Text style={styles.emptyStateTitle}>Welcome to Your Music</Text>
          <Text style={styles.emptyStateText}>
            Go to Library to add your first songs and start listening
          </Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.content}>
              {renderSection(
                'Recently Played',
                <Clock size={20} color="#1db954" />,
                recentTracks,
                true
              )}
              
              {renderSection(
                'Your Top Tracks',
                <TrendingUp size={20} color="#1db954" />,
                tracks.slice(0, 5),
                true
              )}
              
              {tracks.length > 10 && renderSection(
                'Recommended for You',
                <Heart size={20} color="#1db954" />,
                tracks.slice(5, 10),
                true
              )}
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // DRAMATIC BLACK BACKGROUND
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    color: '#b3b3b3',
    fontWeight: '400',
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  showAllText: {
    fontSize: 14,
    color: '#b3b3b3',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NewHomeScreen;