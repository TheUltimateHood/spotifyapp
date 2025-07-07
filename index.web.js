import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App';

console.log('Entry point loaded');

// Web-specific rendering
const container = document.getElementById('root');
if (container) {
  console.log('Container found, rendering app...');
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}