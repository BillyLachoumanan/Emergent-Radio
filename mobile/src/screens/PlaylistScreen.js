import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {FlatGrid} from 'react-native-super-grid';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import StationCard from '../components/StationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {AudioContext} from '../context/AudioContext';
import {ThemeContext} from '../context/ThemeContext';
import {getPlaylist, clearPlaylist} from '../services/StorageService';

const PlaylistScreen = () => {
  const [playlistStations, setPlaylistStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {playStation} = useContext(AudioContext);
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    loadPlaylist();
  }, []);

  const loadPlaylist = async () => {
    try {
      const playlist = await getPlaylist();
      setPlaylistStations(playlist);
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPlaylist().then(() => setRefreshing(false));
  };

  const handleClearPlaylist = () => {
    Alert.alert(
      'Clear Playlist',
      'Are you sure you want to clear your entire playlist?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearPlaylist();
            setPlaylistStations([]);
          },
        },
      ]
    );
  };

  const playAllStations = () => {
    if (playlistStations.length > 0) {
      // Play first station in playlist
      playStation(playlistStations[0]);
    }
  };

  const renderStationItem = ({item}) => (
    <StationCard
      station={item}
      onPlay={() => playStation(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={[styles.emptyTitle, {color: theme.textColor}]}>
        Your Playlist is Empty
      </Text>
      <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
        Add stations to your playlist by tapping the playlist icon on any station card.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, {color: theme.textColor}]}>
        Your Playlist
      </Text>
      <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
        {playlistStations.length} {playlistStations.length === 1 ? 'station' : 'stations'}
      </Text>
      
      {playlistStations.length > 0 && (
        <View style={styles.playlistControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playAllButton]}
            onPress={playAllStations}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.controlButtonGradient}>
              <Icon name="play-arrow" size={20} color="#ffffff" />
              <Text style={styles.controlButtonText}>Play All</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.clearButton]}
            onPress={handleClearPlaylist}>
            <Icon name="clear-all" size={18} color="#ef4444" />
            <Text style={[styles.controlButtonText, styles.clearButtonText]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.gradientColors} style={styles.container}>
        <LoadingSpinner message="Loading your playlist..." />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.gradientColors} style={styles.container}>
      {renderHeader()}

      {playlistStations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatGrid
          itemDimension={160}
          data={playlistStations}
          style={styles.stationGrid}
          spacing={12}
          renderItem={renderStationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primaryColor}
            />
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  playlistControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  playAllButton: {
    flex: 1,
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  clearButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#ef4444',
  },
  stationGrid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PlaylistScreen;