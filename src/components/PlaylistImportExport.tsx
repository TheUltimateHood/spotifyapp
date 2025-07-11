
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Download, Upload, FileText } from 'lucide-react';

interface PlaylistImportExportProps {
  playlists: any[];
  onImportPlaylist: (playlist: any) => void;
  onExportPlaylist: (playlist: any) => void;
  onExportAllPlaylists: () => void;
}

const PlaylistImportExport: React.FC<PlaylistImportExportProps> = ({
  playlists,
  onImportPlaylist,
  onExportPlaylist,
  onExportAllPlaylists,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      onExportAllPlaylists();
    } catch (error) {
      Alert.alert('Error', 'Failed to export playlists');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importedData = JSON.parse(e.target?.result as string);
              if (importedData.playlists) {
                importedData.playlists.forEach(onImportPlaylist);
                Alert.alert('Success', 'Playlists imported successfully');
              }
            } catch (error) {
              Alert.alert('Error', 'Invalid playlist file');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import/Export Playlists</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleImport}
        >
          <Upload size={20} color="#1db954" />
          <Text style={styles.buttonText}>Import Playlists</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleExportAll}
          disabled={isExporting || playlists.length === 0}
        >
          <Download size={20} color="#1db954" />
          <Text style={styles.buttonText}>
            {isExporting ? 'Exporting...' : 'Export All'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1db954',
  },
  buttonText: {
    color: '#1db954',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PlaylistImportExport;
