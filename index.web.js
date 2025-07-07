import { AppRegistry } from 'react-native';
import App from './src/App';

console.log('Loading web app...');

// Register the app
AppRegistry.registerComponent('MusicPlayerApp', () => App);

// Run the app
const rootTag = document.getElementById('root');
console.log('Root element found:', rootTag);

AppRegistry.runApplication('MusicPlayerApp', {
  rootTag: rootTag,
});