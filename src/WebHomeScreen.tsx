import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const WebHomeScreen = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        setSelectedFiles(files);
      }
    };
    
    input.click();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Music Player</Text>
        <Text style={styles.subtitle}>Web Preview</Text>
      </View>
      
      <TouchableOpacity style={styles.uploadButton} onPress={handleFileSelect}>
        <Text style={styles.uploadText}>📁 Select Audio Files</Text>
      </TouchableOpacity>
      
      {selectedFiles.length > 0 && (
        <View style={styles.fileList}>
          <Text style={styles.fileHeader}>Selected Files ({selectedFiles.length}):</Text>
          {selectedFiles.slice(0, 5).map((file, index) => (
            <Text key={index} style={styles.fileName}>
              🎵 {file.name}
            </Text>
          ))}
          {selectedFiles.length > 5 && (
            <Text style={styles.moreFiles}>...and {selectedFiles.length - 5} more</Text>
          )}
        </View>
      )}
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>⏮️ Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>⏯️ Play/Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>⏭️ Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  uploadButton: {
    backgroundColor: '#1db954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  uploadText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  fileList: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  fileHeader: {
    color: '#1db954',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  moreFiles: {
    color: '#b3b3b3',
    fontSize: 14,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
  },
  controlButton: {
    backgroundColor: '#404040',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WebHomeScreen;