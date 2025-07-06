# Music Player App

A React Native music player application similar to Spotify that allows users to play audio files from their device with background playback support.

## Features

- 🎵 **Audio File Selection**: Choose audio files from your device storage
- 🎧 **Background Playback**: Music continues playing when the app is in background or phone is locked
- 🎛️ **Media Controls**: Play, pause, skip, and seek controls available on lock screen and notification area
- 📱 **Clean Interface**: Dark theme with Spotify-inspired design
- 🎼 **Track Management**: Browse your selected music library
- 🎚️ **Progress Tracking**: See and control playback progress

## How to Use

1. **Add Music**: Tap the "Add Music" button on the home screen to select audio files from your device
2. **Play Music**: Tap any track in your library to start playing
3. **Control Playback**: Use the mini player at the bottom of the home screen or go to the full player screen
4. **Background Play**: The music will continue playing even when you lock your phone or use other apps

## Permissions

The app requires the following permissions:
- **Storage Access**: To read audio files from your device
- **Audio Playback**: To play music in the background

## Development

The app is built using:
- React Native 0.80+
- React Native Track Player for audio playback
- React Navigation for screen navigation
- React Context for state management

## Running the App

```bash
# Start the development server
npm run dev

# Run on Android (requires Android development environment)
npm run android

# Run on iOS (requires Xcode and iOS development environment)
npm run ios
```

## Technical Details

- **Audio Engine**: React Native Track Player handles all audio playback and background services
- **File Selection**: React Native Document Picker for user-friendly file selection
- **State Management**: React Context API for simple and effective state management
- **UI Design**: Custom components with dark theme and clean interface
- **Navigation**: Stack navigation for simple two-screen flow (Home and Player)

The app is designed to work seamlessly with your device's media controls and will appear in your notification area and lock screen for easy access to playback controls.