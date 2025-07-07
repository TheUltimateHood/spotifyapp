console.log('Simple test starting...');

function TestApp() {
  return React.createElement('div', { 
    style: { 
      backgroundColor: '#121212', 
      color: 'white', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px'
    } 
  }, 'Music Player - Test Version');
}

console.log('Test app defined');

// Simple mounting without AppRegistry
const root = document.getElementById('root');
if (root) {
  console.log('Root found, rendering...');
  ReactDOM.render(React.createElement(TestApp), root);
} else {
  console.error('Root element not found');
}