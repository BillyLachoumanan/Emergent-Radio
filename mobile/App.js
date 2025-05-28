import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  StatusBar,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import RecentScreen from './src/screens/RecentScreen';
import PlaylistScreen from './src/screens/PlaylistScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PlayerBar from './src/components/PlayerBar';
import {setupPlayer} from './src/services/AudioService';
import NotificationService from './src/services/NotificationService';
import {ThemeProvider} from './src/context/ThemeContext';
import {AudioProvider} from './src/context/AudioContext';

const Tab = createBottomTabNavigator();

function App() {
  useEffect(() => {
    // Setup audio player
    const initializePlayer = async () => {
      await setupPlayer();
    };

    // Setup push notifications
    const setupNotifications = async () => {
      // Request permissions
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      // Initialize push notifications
      PushNotification.configure({
        onRegister: function (token) {
          console.log('TOKEN:', token);
        },
        onNotification: function (notification) {
          console.log('NOTIFICATION:', notification);
        },
        onAction: function (notification) {
          console.log('ACTION:', notification.action);
        },
        onRegistrationError: function (err) {
          console.error(err.message, err);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
      });

      // Firebase messaging setup
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        
        // Get FCM token
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);

        // Listen to foreground messages
        messaging().onMessage(async remoteMessage => {
          Alert.alert(
            'New Radio Station!',
            remoteMessage.notification?.body || 'Check out new stations',
          );
        });

        // Background message handler
        messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('Message handled in the background!', remoteMessage);
        });
      }
    };

    initializePlayer();
    setupNotifications();
    NotificationService.init();
  }, []);

  return (
    <ThemeProvider>
      <AudioProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarIcon: ({focused, color, size}) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = 'radio';
                } else if (route.name === 'Favorites') {
                  iconName = 'favorite';
                } else if (route.name === 'Recent') {
                  iconName = 'history';
                } else if (route.name === 'Playlist') {
                  iconName = 'playlist-play';
                } else if (route.name === 'Settings') {
                  iconName = 'settings';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6366f1',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                backgroundColor: '#1e1e2e',
                borderTopColor: '#374151',
                paddingBottom: 8,
                height: 70,
              },
              headerStyle: {
                backgroundColor: '#1a1a2e',
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}>
            <Tab.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{title: '🌍 Global Radio'}}
            />
            <Tab.Screen 
              name="Favorites" 
              component={FavoritesScreen}
              options={{title: '❤️ Favorites'}}
            />
            <Tab.Screen 
              name="Recent" 
              component={RecentScreen}
              options={{title: '🕒 Recent'}}
            />
            <Tab.Screen 
              name="Playlist" 
              component={PlaylistScreen}
              options={{title: '📝 Playlist'}}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{title: '⚙️ Settings'}}
            />
          </Tab.Navigator>
          <PlayerBar />
        </NavigationContainer>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;