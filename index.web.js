import { AppRegistry } from 'react-native';
import App from './src/App';

// Register the app
AppRegistry.registerComponent('MusicPlayerApp', () => App);

// Run the app
AppRegistry.runApplication('MusicPlayerApp', {
  rootTag: document.getElementById('root'),
});