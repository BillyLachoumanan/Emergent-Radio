import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {FlatGrid} from 'react-native-super-grid';
import LinearGradient from 'react-native-linear-gradient';

import StationCard from '../components/StationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CategorySelector from '../components/CategorySelector';
import {AudioContext} from '../context/AudioContext';
import {ThemeContext} from '../context/ThemeContext';
import ApiService from '../services/ApiService';

const HomeScreen = () => {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const {playStation} = useContext(AudioContext);
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    loadStations();
  }, [selectedCategory, selectedCountry, selectedGenre]);

  const loadStations = async () => {
    setLoading(true);
    try {
      let data;
      
      if (selectedCategory === 'popular') {
        data = await ApiService.getPopularStations();
      } else if (selectedCategory === 'christian') {
        data = await ApiService.getChristianStations();
      } else if (selectedCategory === 'country' && selectedCountry) {
        data = await ApiService.getStationsByCountry(selectedCountry);
      } else if (selectedCategory === 'genre' && selectedGenre) {
        data = await ApiService.getStationsByGenre(selectedGenre);
      } else if (selectedCategory === 'search' && searchTerm) {
        data = await ApiService.searchStations(searchTerm);
      } else {
        data = await ApiService.getPopularStations();
      }
      
      setStations(data.stations || []);
    } catch (error) {
      console.error('Error loading stations:', error);
      Alert.alert('Error', 'Failed to load radio stations. Please try again.');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSelectedCategory('search');
      loadStations();
    } else {
      setSelectedCategory('popular');
      loadStations();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStations().then(() => setRefreshing(false));
  };

  const handleCategoryChange = (category, country = '', genre = '') => {
    setSelectedCategory(category);
    setSelectedCountry(country);
    setSelectedGenre(genre);
  };

  const renderHeader = () => (
    <View style={[styles.header, {backgroundColor: theme.headerBackground}]}>
      <Text style={[styles.headerTitle, {color: theme.textColor}]}>
        🌍 Global Radio
      </Text>
      <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
        Listen to radio stations from around the world
      </Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: theme.cardBackground,
            color: theme.textColor,
            borderColor: theme.borderColor,
          }]}
          placeholder="Search stations..."
          placeholderTextColor={theme.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.searchButtonGradient}>
            <Text style={styles.searchButtonText}>Search</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </View>
  );

  const renderStationItem = ({item}) => (
    <StationCard
      station={item}
      onPlay={() => playStation(item)}
    />
  );

  return (
    <LinearGradient
      colors={theme.gradientColors}
      style={styles.container}>
      {renderHeader()}
      
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatGrid
          itemDimension={160}
          data={stations}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, {color: theme.textSecondary}]}>
                {selectedCategory === 'search' 
                  ? 'No stations found for your search'
                  : 'No stations available'}
              </Text>
              <Text style={[styles.emptySubtext, {color: theme.textSecondary}]}>
                Try a different search term or category
              </Text>
            </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  stationGrid: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for player bar
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;