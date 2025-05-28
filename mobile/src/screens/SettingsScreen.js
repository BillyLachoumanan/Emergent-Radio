import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import DeviceInfo from 'react-native-device-info';

import {ThemeContext} from '../context/ThemeContext';
import {AudioContext} from '../context/AudioContext';
import {
  getSettings,
  updateSettings,
  exportData,
  clearAllData,
} from '../services/StorageService';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoPlay: false,
    quality: 'auto',
    volume: 0.7,
  });
  const [appVersion, setAppVersion] = useState('');

  const {theme, isDark, toggleTheme} = useContext(ThemeContext);
  const {volume, changeVolume} = useContext(AudioContext);

  useEffect(() => {
    loadSettings();
    loadAppInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await getSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadAppInfo = async () => {
    try {
      const version = await DeviceInfo.getVersion();
      const buildNumber = await DeviceInfo.getBuildNumber();
      setAppVersion(`${version} (${buildNumber})`);
    } catch (error) {
      console.error('Error loading app info:', error);
      setAppVersion('Unknown');
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = {...settings, [key]: value};
      setSettings(newSettings);
      await updateSettings(newSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      if (data) {
        const options = {
          title: 'Global Radio - Backup Data',
          message: 'Share your Global Radio backup data',
          url: `data:application/json;base64,${btoa(JSON.stringify(data))}`,
          filename: `global-radio-backup-${new Date().getTime()}.json`,
        };
        await Share.open(options);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your favorites, playlists, and settings. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    // Replace with your app's store URL
    const storeUrl = 'https://play.google.com/store/apps/details?id=com.globalradio';
    Linking.openURL(storeUrl);
  };

  const handleContactSupport = () => {
    const email = 'support@globalradio.app';
    const subject = 'Global Radio App Support';
    const body = `App Version: ${appVersion}\nDevice: ${DeviceInfo.getModel()}\n\nMessage:\n`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  const SettingItem = ({title, subtitle, children, icon}) => (
    <View style={[styles.settingItem, {borderBottomColor: theme.borderColor}]}>
      <View style={styles.settingInfo}>
        {icon && <Icon name={icon} size={24} color={theme.primaryColor} style={styles.settingIcon} />}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, {color: theme.textColor}]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, {color: theme.textSecondary}]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {children}
    </View>
  );

  const SectionHeader = ({title}) => (
    <Text style={[styles.sectionHeader, {color: theme.textColor}]}>{title}</Text>
  );

  return (
    <LinearGradient colors={theme.gradientColors} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Appearance Settings */}
        <SectionHeader title="Appearance" />
        <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
          <SettingItem
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            icon="brightness-6">
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: '#767577', true: theme.primaryColor}}
              thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
            />
          </SettingItem>
        </View>

        {/* Audio Settings */}
        <SectionHeader title="Audio" />
        <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
          <SettingItem
            title="Auto-play"
            subtitle="Automatically start playing when selecting stations"
            icon="play-circle-outline">
            <Switch
              value={settings.autoPlay}
              onValueChange={(value) => updateSetting('autoPlay', value)}
              trackColor={{false: '#767577', true: theme.primaryColor}}
              thumbColor={settings.autoPlay ? '#ffffff' : '#f4f3f4'}
            />
          </SettingItem>
        </View>

        {/* Notification Settings */}
        <SectionHeader title="Notifications" />
        <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
          <SettingItem
            title="Push Notifications"
            subtitle="Receive notifications about new stations"
            icon="notifications">
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{false: '#767577', true: theme.primaryColor}}
              thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
            />
          </SettingItem>
        </View>

        {/* Data Management */}
        <SectionHeader title="Data Management" />
        <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
          <TouchableOpacity onPress={handleExportData}>
            <SettingItem
              title="Export Data"
              subtitle="Backup your favorites and playlists"
              icon="cloud-download">
              <Icon name="chevron-right" size={24} color={theme.textSecondary} />
            </SettingItem>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClearAllData}>
            <SettingItem
              title="Clear All Data"
              subtitle="Remove all favorites, playlists, and settings"
              icon="delete-sweep">
              <Icon name="chevron-right" size={24} color="#ef4444" />
            </SettingItem>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
          <TouchableOpacity onPress={handleRateApp}>
            <SettingItem
              title="Rate the App"
              subtitle="Help us improve by rating on the store"
              icon="star">
              <Icon name="chevron-right" size={24} color={theme.textSecondary} />
            </SettingItem>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleContactSupport}>
            <SettingItem
              title="Contact Support"
              subtitle="Get help or report issues"
              icon="help">
              <Icon name="chevron-right" size={24} color={theme.textSecondary} />
            </SettingItem>
          </TouchableOpacity>
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={[styles.section, {backgroundColor: theme.cardBackground}]}>
          <SettingItem
            title="Version"
            subtitle={appVersion}
            icon="info">
          </SettingItem>

          <SettingItem
            title="Global Radio"
            subtitle="Listen to radio stations from around the world"
            icon="radio">
          </SettingItem>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.textSecondary}]}>
            Made with ❤️ for radio lovers worldwide
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  section: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 100, // Space for tab bar
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SettingsScreen;