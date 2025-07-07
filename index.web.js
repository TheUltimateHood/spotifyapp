import { AppRegistry } from 'react-native';
import App from './src/App';

console.log('Loading real music player app...');

// Register the app
AppRegistry.registerComponent('MusicPlayerApp', () => App);

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