import React, {useState, useContext} from 'react';
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
import Share from 'react-native-share';

import {AudioContext} from '../context/AudioContext';
import {ThemeContext} from '../context/ThemeContext';
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  addToPlaylist,
  removeFromPlaylist,
  isInPlaylist,
} from '../services/StorageService';

const StationCard = ({station, onPlay}) => {
  const [favorited, setFavorited] = useState(false);
  const [inPlaylist, setInPlaylist] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {currentStation, isPlaying} = useContext(AudioContext);
  const {theme} = useContext(ThemeContext);

  React.useEffect(() => {
    checkFavoriteStatus();
    checkPlaylistStatus();
  }, [station]);

  const checkFavoriteStatus = async () => {
    const status = await isFavorite(station.stationuuid);
    setFavorited(status);
  };

  const checkPlaylistStatus = async () => {
    const status = await isInPlaylist(station.stationuuid);
    setInPlaylist(status);
  };

  const handleFavorite = async () => {
    try {
      if (favorited) {
        await removeFromFavorites(station.stationuuid);
        setFavorited(false);
      } else {
        await addToFavorites(station);
        setFavorited(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handlePlaylist = async () => {
    try {
      if (inPlaylist) {
        await removeFromPlaylist(station.stationuuid);
        setInPlaylist(false);
      } else {
        await addToPlaylist(station);
        setInPlaylist(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update playlist');
    }
  };

  const handleShare = async () => {
    try {
      const options = {
        title: `${station.name} - Global Radio`,
        message: `Listen to ${station.name} from ${station.country} on Global Radio!`,
        url: station.homepage || 'https://globalradio.app',
      };
      await Share.open(options);
    } catch (error) {
      console.log('Share error:', error);
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

  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const isCurrentlyPlaying = isCurrentStation && isPlaying;

  return (
    <TouchableOpacity
      style={[styles.container, {backgroundColor: theme.cardBackground}]}
      onPress={onPlay}
      activeOpacity={0.8}>
      
      {/* Station Info */}
      <View style={styles.stationInfo}>
        <View style={styles.stationHeader}>
          <View style={styles.logoContainer}>
            {station.favicon && !imageError ? (
              <Image
                source={{uri: station.favicon}}
                style={styles.stationLogo}
                onError={() => setImageError(true)}
              />
            ) : (
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.logoFallback}>
                <Text style={styles.logoText}>📻</Text>
              </LinearGradient>
            )}
          </View>
          
          {isCurrentlyPlaying && (
            <View style={styles.playingIndicator}>
              <Icon name="equalizer" size={16} color="#ef4444" />
            </View>
          )}
        </View>

        <Text style={[styles.stationName, {color: theme.textColor}]} numberOfLines={2}>
          {station.name}
        </Text>
        
        <Text style={[styles.stationCountry, {color: theme.textSecondary}]}>
          {getCountryFlag(station.countrycode)} {station.country}
        </Text>

        <View style={styles.stationTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{formatBitrate(station.bitrate)}</Text>
          </View>
          {station.codec && (
            <View style={[styles.tag, styles.codecTag]}>
              <Text style={styles.tagText}>{station.codec.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {station.tags && (
          <Text style={[styles.genres, {color: theme.textSecondary}]} numberOfLines={1}>
            {station.tags.split(',').slice(0, 3).join(', ')}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.playButton]}
          onPress={onPlay}>
          <LinearGradient
            colors={isCurrentlyPlaying ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
            style={styles.actionButtonGradient}>
            <Icon 
              name={isCurrentlyPlaying ? 'pause' : 'play-arrow'} 
              size={20} 
              color="#ffffff" 
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, favorited && styles.favoriteActive]}
          onPress={handleFavorite}>
          <Icon 
            name={favorited ? 'favorite' : 'favorite-border'} 
            size={18} 
            color={favorited ? '#ef4444' : theme.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, inPlaylist && styles.playlistActive]}
          onPress={handlePlaylist}>
          <Icon 
            name={inPlaylist ? 'playlist-add-check' : 'playlist-add'} 
            size={18} 
            color={inPlaylist ? '#fbbf24' : theme.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon name="share" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stationStats}>
        <Text style={[styles.statText, {color: theme.textSecondary}]}>
          👥 {station.clickcount || 0}
        </Text>
        <Text style={[styles.statText, {color: theme.textSecondary}]}>
          ❤️ {station.votes || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    margin: 4,
  },
  stationInfo: {
    marginBottom: 12,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  playingIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  stationCountry: {
    fontSize: 12,
    marginBottom: 8,
  },
  stationTags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codecTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  genres: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  playlistActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  stationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 10,
  },
});

export default StationCard;