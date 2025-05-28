# Setup Instructions for Global Radio React Native App

## 🚀 Quick Setup Guide

### 1. **Install Dependencies**
```bash
cd /app/mobile
npm install
```

### 2. **Update Backend URL**
Edit `/app/mobile/src/services/ApiService.js` and replace the BASE_URL with your actual backend URL:
```javascript
const BASE_URL = 'https://your-backend-url.com';
```

### 3. **Android Setup**

#### Prerequisites
- Android Studio installed
- Android SDK configured
- Java 11+ installed

#### Steps
1. **Install Android dependencies**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Start Metro bundler**
   ```bash
   npm start
   ```

3. **Run on Android device/emulator**
   ```bash
   npm run android
   ```

### 4. **iOS Setup** (macOS only)

#### Prerequisites
- Xcode installed
- CocoaPods installed (`sudo gem install cocoapods`)

#### Steps
1. **Install iOS dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Run on iOS simulator**
   ```bash
   npm run ios
   ```

## 🔧 Advanced Configuration

### Firebase Push Notifications (Optional)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Add Android app with package name `com.globalradio`

2. **Download Configuration**
   - Download `google-services.json`
   - Place in `/app/mobile/android/app/`

3. **Update Package Name**
   - Edit `android/app/build.gradle`
   - Change `applicationId` to your desired package name

### Custom App Icons

1. **Generate Icons**
   - Use online icon generator or design tools
   - Generate for multiple resolutions

2. **Replace Icons**
   - Android: Replace files in `android/app/src/main/res/mipmap-*/`
   - iOS: Replace icons in `ios/GlobalRadio/Images.xcassets/AppIcon.appiconset/`

### Build for Production

#### Android APK
```bash
cd android
./gradlew assembleRelease
```
APK location: `android/app/build/outputs/apk/release/`

#### Android App Bundle (Play Store)
```bash
cd android
./gradlew bundleRelease
```

#### iOS App Store
1. Open `ios/GlobalRadio.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Upload to App Store Connect

## 📱 Features Overview

### ✅ Implemented Features
- [x] Global radio station streaming
- [x] Background audio playback
- [x] Favorites system
- [x] Recently played tracking
- [x] Custom playlists
- [x] Dark/Light theme toggle
- [x] Christian radio section
- [x] Country and genre filtering
- [x] Search functionality
- [x] Social sharing
- [x] Push notifications framework
- [x] Local data storage
- [x] Beautiful mobile UI

### 🎵 Audio Capabilities
- **Background Playback**: Continues when app is backgrounded
- **Lock Screen Controls**: Media controls on lock screen
- **Notification Player**: Rich media notifications
- **Volume Control**: Precise volume adjustment
- **Multiple Formats**: MP3, AAC, OGG, HLS support

### 📊 Data Management
- **Local Storage**: AsyncStorage for offline data
- **Favorites**: Persistent favorite stations
- **History**: Recently played tracking
- **Playlists**: Custom station collections
- **Settings**: User preferences

## 🔍 Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npx react-native start --reset-cache
```

**Android build errors:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

**iOS build errors:**
```bash
cd ios
rm -rf Pods
pod install
cd ..
npx react-native run-ios
```

**Audio not playing:**
- Check internet connection
- Verify backend API is accessible
- Some radio stations may be geo-restricted
- Check device volume and permissions

### Package Installation Issues

If you encounter package installation issues, try:

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **For iOS, clear pods**
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

## 📋 Required Permissions

### Android
- `INTERNET` - Network access for streaming
- `WAKE_LOCK` - Keep device awake during playback
- `FOREGROUND_SERVICE` - Background audio service
- `POST_NOTIFICATIONS` - Push notifications
- `ACCESS_NETWORK_STATE` - Network state monitoring

### iOS
- `NSAppleMusicUsageDescription` - Audio playback
- `NSMicrophoneUsageDescription` - Audio permissions
- Background Modes: `audio`, `background-processing`

## 🌟 Next Steps

1. **Test on real devices** - Always test audio on physical devices
2. **Customize branding** - Update app name, icons, and colors
3. **Add analytics** - Integrate Firebase Analytics or similar
4. **Performance optimization** - Test with large station lists
5. **Store submission** - Prepare for Google Play and App Store

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review React Native documentation
3. Check individual package documentation
4. Test API endpoints directly

**Happy coding! 🎵📱**