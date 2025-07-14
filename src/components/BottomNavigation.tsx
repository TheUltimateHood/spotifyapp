import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Home, Search, ListMusic, Settings, Music2 } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Search', label: 'Search', icon: Search },
    { id: 'Library', label: 'Library', icon: Music2 },
    { id: 'Playlists', label: 'Playlists', icon: ListMusic },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
          >
            <IconComponent
              size={24}
              color={isActive ? '#1db954' : '#b3b3b3'}
              strokeWidth={2}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: Platform.OS === 'ios' ? 34 : 10, // Account for home indicator on iOS
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 90 : 70,
    position: Platform.OS === 'web' ? 'relative' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    color: '#b3b3b3',
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#1db954',
  },
});

export default BottomNavigation;