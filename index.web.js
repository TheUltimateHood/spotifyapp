import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

console.log('Loading music player...');

// Web-specific mounting without AppRegistry
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
  console.log('Music player mounted successfully');
} else {
  console.error('Root container not found');
}