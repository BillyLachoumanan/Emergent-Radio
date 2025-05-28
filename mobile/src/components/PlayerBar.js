import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

import {AudioContext} from '../context/AudioContext';
import {ThemeContext} from '../context/ThemeContext';

const PlayerBar = () => {
  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    pause,
    resume,
    stop,
    changeVolume,
    error,
    clearError,
  } = useContext(AudioContext);

  const {theme} = useContext(ThemeContext);

  if (!currentStation) {
    return null;
  }

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        await resume();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to control playback');
    }
  };

  const handleStop = async () => {
    try {
      await stop();
    } catch (err) {
      Alert.alert('Error', 'Failed to stop playback');
    }
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    return String.fromCodePoint(
      ...countryCode.toUpperCase().split('').map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
    );
  };

  const formatBitrate = (bitrate) => {
    return bitrate > 0 ? `${bitrate} kbps` : 'Unknown';
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.headerBackground}]}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Icon name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.content}>
        {/* Station Info */}
        <View style={styles.stationInfo}>
          <View style={styles.logoContainer}>
            {currentStation.favicon ? (
              <Image
                source={{uri: currentStation.favicon}}
                style={styles.stationLogo}
                onError={() => {}}
              />
            ) : (
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.logoFallback}>
                <Text style={styles.logoText}>📻</Text>
              </LinearGradient>
            )}
          </View>
          
          <View style={styles.textInfo}>
            <Text style={[styles.stationName, {color: theme.textColor}]} numberOfLines={1}>
              {currentStation.name}
            </Text>
            <Text style={[styles.stationDetails, {color: theme.textSecondary}]} numberOfLines={1}>
              {getCountryFlag(currentStation.countrycode)} {currentStation.country} • {formatBitrate(currentStation.bitrate)}
            </Text>
          </View>
          
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Icon name="hourglass-empty" size={16} color={theme.primaryColor} />
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Icon name="volume-down" size={20} color={theme.textSecondary} />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={changeVolume}
              minimumTrackTintColor={theme.primaryColor}
              maximumTrackTintColor={theme.textSecondary}
              thumbStyle={{backgroundColor: theme.primaryColor}}
            />
            <Icon name="volume-up" size={20} color={theme.textSecondary} />
          </View>

          {/* Play Controls */}
          <View style={styles.playControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePlayPause}
              disabled={isLoading}>
              <LinearGradient
                colors={isPlaying ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
                style={styles.playButtonGradient}>
                <Icon
                  name={isLoading ? 'hourglass-empty' : (isPlaying ? 'pause' : 'play-arrow')}
                  size={24}
                  color="#ffffff"
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStop}>
              <Icon name="stop" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </div>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 80, // Space for tab bar
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  stationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stationLogo: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
  },
  textInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stationDetails: {
    fontSize: 12,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  controls: {
    alignItems: 'center',
    gap: 8,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  volumeSlider: {
    flex: 1,
    height: 20,
    marginHorizontal: 4,
  },
  playControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlayerBar;