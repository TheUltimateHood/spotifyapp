import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Search } from 'lucide-react';
import TrackItem from '../components/TrackItem';
import SearchBar from '../components/SearchBar';

// Platform-specific imports
let useMusicContext: any;
if (Platform.OS === 'web') {
  const { useMusicContext: webContext } = require('../context/WebMusicContext');
  useMusicContext = webContext;
} else {
  const { useMusicContext: nativeContext } = require('../context/MusicContext');
  useMusicContext = nativeContext;
}

interface SearchScreenProps {
  onTrackSelect: (track: any) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onTrackSelect }) => {
  const context = useMusicContext();
  const { tracks, currentTrack } = context;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = tracks.filter(track => 
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase()) ||
      (track.album && track.album.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(filtered);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search songs, artists, albums..."
        />
      </View>

      {searchQuery.trim() === '' ? (
        <View style={styles.emptyState}>
          <Search size={80} color="#666" />
          <Text style={styles.emptyStateTitle}>Find Your Music</Text>
          <Text style={styles.emptyStateText}>
            Search for songs, artists, or albums in your library
          </Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsListContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
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

export default SearchScreen;