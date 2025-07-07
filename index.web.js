import { AppRegistry } from 'react-native';
import WebApp from './src/WebApp';

console.log('Loading web music app...');

// Register the app
AppRegistry.registerComponent('MusicPlayerApp', () => WebApp);

// Run the app
const rootTag = document.getElementById('root');
console.log('Root element found:', rootTag);

if (rootTag) {
  AppRegistry.runApplication('MusicPlayerApp', {
    rootTag: rootTag,
  });
  console.log('Web app mounted successfully');
} else {
  console.error('Root element not found');
}