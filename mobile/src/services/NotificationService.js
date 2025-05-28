import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createChannels();
  }

  configure = () => {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
      },

      onNotification: (notification) => {
        console.log('Local notification received:', notification);
      },

      onAction: (notification) => {
        console.log('Notification action received:', notification.action);
      },

      onRegistrationError: (err) => {
        console.error('Push notification registration error:', err.message);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  };

  createChannels = () => {
    // Create notification channels for Android
    PushNotification.createChannel(
      {
        channelId: 'radio-updates',
        channelName: 'Radio Updates',
        channelDescription: 'Notifications about new radio stations and updates',
        playSound: false,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Radio updates channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'now-playing',
        channelName: 'Now Playing',
        channelDescription: 'Currently playing radio station',
        playSound: false,
        importance: 3,
        vibrate: false,
      },
      (created) => console.log(`Now playing channel created: ${created}`)
    );
  };

  // Show local notification for new stations
  showNewStationNotification = (stationName, country) => {
    PushNotification.localNotification({
      channelId: 'radio-updates',
      title: '🎵 New Radio Station Available!',
      message: `Check out ${stationName} from ${country}`,
      bigText: `We've added a new radio station: ${stationName} from ${country}. Tap to listen now!`,
      subText: 'Global Radio',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      autoCancel: true,
      invokeApp: true,
      actions: ['Listen Now', 'Later'],
      data: {
        type: 'new_station',
        stationName,
        country,
      },
    });
  };

  // Show notification for currently playing station
  showNowPlayingNotification = (station) => {
    PushNotification.localNotification({
      channelId: 'now-playing',
      title: '📻 Now Playing',
      message: `${station.name} - ${station.country}`,
      bigText: `Currently playing: ${station.name} from ${station.country}`,
      subText: `${station.bitrate ? station.bitrate + ' kbps' : ''} • ${station.codec || ''}`,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      ongoing: true,
      autoCancel: false,
      invokeApp: false,
      actions: ['Pause', 'Stop'],
      data: {
        type: 'now_playing',
        stationId: station.stationuuid,
      },
    });
  };

  // Cancel now playing notification
  cancelNowPlayingNotification = () => {
    PushNotification.cancelLocalNotifications({
      data: { type: 'now_playing' }
    });
  };

  // Handle Firebase messaging
  setupFirebaseMessaging = async () => {
    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Firebase messaging authorization status:', authStatus);

        // Get FCM token
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);

        // Listen to token refresh
        messaging().onTokenRefresh(token => {
          console.log('FCM Token refreshed:', token);
          // Send token to your server here
        });

        // Handle foreground messages
        messaging().onMessage(async remoteMessage => {
          console.log('FCM message received in foreground:', remoteMessage);
          
          // Show local notification
          if (remoteMessage.notification) {
            this.showRemoteNotification(remoteMessage);
          }
        });

        // Handle background messages
        messaging().setBackgroundMessageHandler(async remoteMessage => {
          console.log('FCM message handled in background:', remoteMessage);
        });

        return fcmToken;
      }
    } catch (error) {
      console.error('Error setting up Firebase messaging:', error);
    }
    
    return null;
  };

  // Show notification from Firebase message
  showRemoteNotification = (remoteMessage) => {
    const { notification, data } = remoteMessage;
    
    PushNotification.localNotification({
      channelId: data?.type === 'station_update' ? 'radio-updates' : 'radio-updates',
      title: notification?.title || 'Global Radio',
      message: notification?.body || 'New update available',
      bigText: notification?.body,
      subText: 'Global Radio',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      playSound: true,
      soundName: 'default',
      vibrate: true,
      autoCancel: true,
      invokeApp: true,
      data: data || {},
    });
  };

  // Schedule daily notification for new stations
  scheduleDailyStationUpdate = () => {
    PushNotification.localNotificationSchedule({
      channelId: 'radio-updates',
      title: '🌍 Discover New Stations',
      message: 'Check out new radio stations added today!',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      repeatType: 'day',
      data: {
        type: 'daily_update',
      },
    });
  };

  // Cancel all notifications
  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  // Get scheduled notifications
  getScheduledNotifications = () => {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  };

  // Initialize service
  static init() {
    return new NotificationService();
  }
}

export default NotificationService;