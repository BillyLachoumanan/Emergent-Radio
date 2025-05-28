# 🌍 Global Radio - React Native App

A beautiful, feature-rich mobile radio streaming app built with React Native. Listen to thousands of radio stations from around the world with background playback, push notifications, and more!

## ✨ Features

### 🎵 **Core Radio Features**
- **Global Radio Stations**: Access thousands of stations worldwide
- **Background Audio Playback**: Listen while using other apps
- **High-Quality Streaming**: Support for various audio codecs and bitrates
- **Real-time Station Information**: Display station metadata and artwork

### 📱 **Mobile-Optimized Experience**
- **Beautiful Native UI**: Smooth animations and intuitive design
- **Touch-Friendly Controls**: Easy-to-use audio controls and navigation
- **Responsive Design**: Optimized for all screen sizes
- **Gesture Support**: Swipe and tap interactions

### 🎯 **Smart Organization**
- **Favorites System**: Save your favorite stations
- **Recently Played**: Track your listening history
- **Custom Playlists**: Create your own station collections
- **Smart Search**: Find stations by name, country, or genre

### 🌟 **Advanced Features**
- **Push Notifications**: Get notified about new stations
- **Dark/Light Themes**: Switch between beautiful themes
- **Country & Genre Filtering**: Browse by location and music style
- **Christian Radio Section**: Dedicated section for Christian stations
- **Social Sharing**: Share stations with friends
- **Offline Storage**: Favorites and settings sync locally

### 🔧 **Technical Features**
- **Background Playback**: Continue listening when app is minimized
- **Media Controls**: Lock screen and notification controls
- **Volume Management**: Precise volume control
- **Error Handling**: Robust error recovery and user feedback

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **React Native CLI** (`npm install -g react-native-cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)

### Installation

1. **Clone and Setup**
   ```bash
   cd /app/mobile
   npm install
   ```

2. **Install iOS Dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start Metro Bundler**
   ```bash
   npm start
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

5. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   ```

## 📱 App Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── StationCard.js   # Individual station display
│   │   ├── PlayerBar.js     # Bottom audio player
│   │   ├── CategorySelector.js # Filter controls
│   │   └── LoadingSpinner.js   # Loading states
│   │
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.js    # Discover stations
│   │   ├── FavoritesScreen.js # Saved stations
│   │   ├── RecentScreen.js  # Recently played
│   │   ├── PlaylistScreen.js # Custom playlists
│   │   └── SettingsScreen.js # App preferences
│   │
│   ├── services/            # Core app services
│   │   ├── ApiService.js    # Backend communication
│   │   ├── AudioService.js  # Audio playback management
│   │   ├── StorageService.js # Local data storage
│   │   └── NotificationService.js # Push notifications
│   │
│   └── context/             # React Context providers
│       ├── AudioContext.js  # Audio state management
│       └── ThemeContext.js  # Theme management
│
├── android/                 # Android-specific code
└── ios/                     # iOS-specific code
```

## 🎵 Audio Features

### Background Playback
The app uses `react-native-track-player` for professional audio management:
- Continues playing when app is backgrounded
- Lock screen controls
- Notification media controls
- Automatic reconnection on network issues

### Supported Formats
- **MP3**: Most common streaming format
- **AAC**: High-quality audio
- **OGG**: Open-source format
- **HLS**: HTTP Live Streaming for adaptive quality

## 🔔 Push Notifications

### Notification Types
1. **New Station Alerts**: When new stations are added
2. **Now Playing**: Show current station in notifications
3. **Daily Updates**: Discover new stations daily

### Setup Firebase (Required for Push Notifications)
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Add your Android app to the project
3. Download `google-services.json` and place in `android/app/`
4. Enable Cloud Messaging in Firebase console

## 🎨 Customization

### Themes
The app supports both light and dark themes:
- **Dark Theme**: Default purple/blue gradient
- **Light Theme**: Clean white/gray design
- **Auto-switching**: Remembers user preference

### Colors
Modify theme colors in `src/context/ThemeContext.js`:
```javascript
const darkTheme = {
  gradientColors: ['#1a1a2e', '#16213e', '#0f3460'],
  primaryColor: '#6366f1',
  // ... other colors
};
```

## 🌐 API Integration

The app connects to your backend API for radio data:

### Required Endpoints
- `GET /api/stations/popular` - Popular stations
- `GET /api/stations/christian` - Christian radio
- `GET /api/stations/by-country/{code}` - Country-specific
- `GET /api/stations/by-genre` - Genre filtering
- `GET /api/stations/search` - Search functionality
- `GET /api/countries` - Available countries
- `GET /api/genres` - Music genres

### Configuration
Update the API URL in `src/services/ApiService.js`:
```javascript
const BASE_URL = 'https://your-backend-url.com';
```

## 📋 Build for Production

### Android APK
```bash
cd android
./gradlew assembleRelease
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Android App Bundle (Google Play)
```bash
cd android
./gradlew bundleRelease
```

### iOS App Store
1. Open `ios/GlobalRadio.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Upload to App Store Connect

## 🔧 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

**Android build issues:**
```bash
cd android && ./gradlew clean && cd ..
```

**iOS pod issues:**
```bash
cd ios && rm -rf Pods && pod install && cd ..
```

**Permission issues (Android):**
- Ensure all permissions are declared in `AndroidManifest.xml`
- Request runtime permissions for notifications

### Audio Playback Issues
- Check internet connection
- Verify station URLs are accessible
- Some stations may require specific user agents

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Check the [troubleshooting guide](#-troubleshooting)
- Review React Native documentation
- Check individual package documentation for specific issues

---

**Built with ❤️ using React Native**

Transform your web radio app into a powerful mobile experience with native features, beautiful design, and professional audio playback capabilities.