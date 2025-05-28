import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import ApiService from '../services/ApiService';

const CategorySelector = ({selectedCategory, onCategoryChange}) => {
  const [countries, setCountries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    loadCountries();
    loadGenres();
  }, []);

  const loadCountries = async () => {
    try {
      const data = await ApiService.getCountries();
      setCountries(data.countries.slice(0, 50)); // Top 50 countries
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadGenres = async () => {
    try {
      const data = await ApiService.getGenres();
      setGenres(data.genres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCountry('');
    setSelectedGenre('');
    onCategoryChange(category);
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    if (countryCode) {
      onCategoryChange('country', countryCode);
    } else {
      onCategoryChange('popular');
    }
  };

  const handleGenreChange = (genreSlug) => {
    setSelectedGenre(genreSlug);
    if (genreSlug) {
      onCategoryChange('genre', '', genreSlug);
    } else {
      onCategoryChange('popular');
    }
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    return String.fromCodePoint(
      ...countryCode.toUpperCase().split('').map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
    );
  };

  return (
    <View style={styles.container}>
      {/* Quick Category Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryButtons}
        contentContainerStyle={styles.categoryButtonsContent}>
        
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'popular' && styles.categoryButtonActive
          ]}
          onPress={() => handleCategoryPress('popular')}>
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === 'popular' && styles.categoryButtonTextActive
          ]}>
            🔥 Popular
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'christian' && styles.categoryButtonActive
          ]}
          onPress={() => handleCategoryPress('christian')}>
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === 'christian' && styles.categoryButtonTextActive
          ]}>
            ✝️ Christian
          </Text>
        </TouchableOpacity>

        {/* Genre Buttons */}
        {genres.slice(0, 8).map((genre) => (
          <TouchableOpacity
            key={genre.slug}
            style={[
              styles.categoryButton,
              selectedCategory === 'genre' && styles.categoryButtonActive
            ]}
            onPress={() => handleGenreChange(genre.slug)}>
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'genre' && styles.categoryButtonTextActive
            ]}>
              {genre.icon} {genre.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Country Buttons - Top countries */}
        {countries.slice(0, 8).map((country) => (
          <TouchableOpacity
            key={country.iso_3166_1}
            style={[
              styles.categoryButton,
              selectedCategory === 'country' && styles.categoryButtonActive
            ]}
            onPress={() => handleCountryChange(country.iso_3166_1)}>
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'country' && styles.categoryButtonTextActive
            ]}>
              {getCountryFlag(country.iso_3166_1)} {country.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  categoryButtons: {
    marginBottom: 12,
  },
  categoryButtonsContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    fontWeight: '600',
  },
  dropdowns: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    height: 44,
  },
});

export default CategorySelector;