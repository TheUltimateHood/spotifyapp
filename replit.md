# Replit Project Documentation

## Overview

This is a React Native music player application similar to Spotify. The app allows users to select audio files from their phone and play them with full media controls, background playback support, and a clean interface for browsing and controlling music.

## System Architecture

### Mobile App (React Native)
- **Framework**: React Native 0.80+
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Context API
- **Audio Playback**: React Native Track Player
- **File Selection**: React Native Document Picker
- **Permissions**: React Native Permissions
- **UI Components**: Custom components with clean dark theme

### Core Features
- Audio file selection from device storage
- Background music playback with media controls
- Progress tracking and seeking
- Clean Spotify-like interface
- Mini player in home screen
- Full-screen player interface

## Key Components

### Screens
- **HomeScreen**: Main library view with track list and file picker
- **PlayerScreen**: Full-screen player with detailed controls

### Components
- **TrackItem**: Individual track display in library
- **PlayerControls**: Play/pause/skip controls (mini and full versions)
- **ProgressBar**: Seek bar with time display
- **MusicContext**: Global state management for playback

### Services
- **playbackService**: Background audio service for media controls
- **MusicContext**: Centralized music state management

## Data Flow

1. User selects audio files via DocumentPicker
2. Files are converted to Track objects and stored in context
3. TrackPlayer handles audio playback and background services
4. UI components subscribe to playback state via context
5. Media controls work from lock screen and notification area

## External Dependencies

### Core React Native
- `react-native`: Core framework
- `@react-navigation/native`: Navigation
- `@react-navigation/stack`: Stack navigation

### Audio & Media
- `react-native-track-player`: Audio playback and background services
- `react-native-slider`: Progress bar component

### File & Permissions
- `react-native-document-picker`: File selection
- `react-native-permissions`: Runtime permissions
- `react-native-fs`: File system access

### UI & Utils
- `react-native-vector-icons`: Icons
- `react-native-gesture-handler`: Touch handling
- `react-native-reanimated`: Animations
- `react-native-safe-area-context`: Safe area handling

## Deployment Strategy

React Native app deployment:
- **Development**: Metro bundler for development server
- **Android**: APK build via React Native CLI
- **iOS**: App Store build via Xcode
- **Replit**: Development environment with Metro server

## Changelog

```
Changelog:
- July 06, 2025: Initial React Native setup
- July 06, 2025: Core music player architecture implemented
- July 06, 2025: Audio playback service configured
- July 06, 2025: Home and Player screens created
- July 06, 2025: File picker and permissions setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
App Style: Clean, dark theme similar to Spotify
Audio Focus: Background playback with media controls
```

## Development Notes

### Project Structure
```
src/
├── App.tsx                 # Main app component
├── context/
│   └── MusicContext.tsx   # Music state management
├── screens/
│   ├── HomeScreen.tsx     # Main library view
│   └── PlayerScreen.tsx   # Full player interface
├── components/
│   ├── TrackItem.tsx      # Individual track display
│   ├── PlayerControls.tsx # Playback controls
│   └── ProgressBar.tsx    # Seek bar
└── services/
    └── playbackService.ts # Background audio service
```

### Key Technical Decisions
1. **Audio Engine**: React Native Track Player for robust background playback
2. **State Management**: React Context for simplicity and React Native compatibility
3. **File Access**: Document Picker for user-friendly file selection
4. **UI Design**: Dark theme with Spotify-inspired interface
5. **Navigation**: Stack navigator for simple two-screen flow