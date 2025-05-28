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
import {getFavorites} from '../services/StorageService';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {playStation} = useContext(AudioContext);
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoriteStations = await getFavorites();
      setFavorites(favoriteStations);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorite stations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites().then(() => setRefreshing(false));
  };

  const renderStationItem = ({item}) => (
    <StationCard
      station={item}
      onPlay={() => playStation(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={[styles.emptyTitle, {color: theme.textColor}]}>
        No Favorite Stations Yet
      </Text>
      <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
        Start listening to stations and tap the heart icon to add them to your favorites.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.gradientColors} style={styles.container}>
        <LoadingSpinner message="Loading your favorites..." />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.gradientColors} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: theme.textColor}]}>
          Your Favorite Stations
        </Text>
        <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
          {favorites.length} {favorites.length === 1 ? 'station' : 'stations'} saved
        </Text>
      </View>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatGrid
          itemDimension={160}
          data={favorites}
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

export default FavoritesScreen;