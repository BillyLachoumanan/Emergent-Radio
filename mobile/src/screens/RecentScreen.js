import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {FlatGrid} from 'react-native-super-grid';
import LinearGradient from 'react-native-linear-gradient';

import StationCard from '../components/StationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {AudioContext} from '../context/AudioContext';
import {ThemeContext} from '../context/ThemeContext';
import {getRecentlyPlayed, clearRecentlyPlayed} from '../services/StorageService';

const RecentScreen = () => {
  const [recentStations, setRecentStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {playStation} = useContext(AudioContext);
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    loadRecentStations();
  }, []);

  const loadRecentStations = async () => {
    try {
      const recent = await getRecentlyPlayed();
      setRecentStations(recent);
    } catch (error) {
      console.error('Error loading recent stations:', error);
      Alert.alert('Error', 'Failed to load recently played stations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecentStations().then(() => setRefreshing(false));
  };

  const handleClearRecent = () => {
    Alert.alert(
      'Clear Recently Played',
      'Are you sure you want to clear your recently played stations?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearRecentlyPlayed();
            setRecentStations([]);
          },
        },
      ]
    );
  };

  const renderStationItem = ({item}) => (
    <StationCard
      station={item}
      onPlay={() => playStation(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🕒</Text>
      <Text style={[styles.emptyTitle, {color: theme.textColor}]}>
        No Recently Played Stations
      </Text>
      <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
        Start listening to stations and they'll appear here for quick access.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.gradientColors} style={styles.container}>
        <LoadingSpinner message="Loading recently played..." />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.gradientColors} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: theme.textColor}]}>
          Recently Played
        </Text>
        <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
          {recentStations.length} {recentStations.length === 1 ? 'station' : 'stations'}
        </Text>
        {recentStations.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearRecent}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentStations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatGrid
          itemDimension={160}
          data={recentStations}
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
    marginBottom: 8,
  },
  clearButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
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

export default RecentScreen;