// Simple test to check basic React rendering
import React from 'react';
import { createRoot } from 'react-dom/client';
import { View, Text } from 'react-native';

console.log('Test script loaded');

function TestApp() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 24 }}>Hello World</Text>
    </View>
  );
}

const container = document.getElementById('root');
if (container) {
  console.log('Container found, rendering test app...');
  const root = createRoot(container);
  root.render(<TestApp />);
} else {
  console.error('Root container not found');
}