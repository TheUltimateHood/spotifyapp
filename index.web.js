import { AppRegistry } from 'react-native';
import WebHomeScreen from './src/WebHomeScreen';

console.log('Loading music player web app...');

// Register the app
AppRegistry.registerComponent('MusicPlayerApp', () => WebHomeScreen);

// Run the app
const rootTag = document.getElementById('root');
console.log('Root element found:', rootTag);

if (rootTag) {
  AppRegistry.runApplication('MusicPlayerApp', {
    rootTag: rootTag,
  });
  console.log('Music player mounted successfully');
} else {
  console.error('Root element not found');
}