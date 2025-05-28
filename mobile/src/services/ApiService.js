import axios from 'axios';

// Replace with your actual backend URL
const BASE_URL = 'https://d6033a80-baff-4b32-ac10-3c352226a0b4.preview.emergentagent.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    if (!error.response) {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (error.response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    throw error;
  }
);

const ApiService = {
  // Get popular stations
  getPopularStations: async (limit = 50) => {
    try {
      const response = await apiClient.get('/api/stations/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular stations:', error);
      throw error;
    }
  },

  // Get Christian stations
  getChristianStations: async (limit = 100) => {
    try {
      const response = await apiClient.get('/api/stations/christian', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Christian stations:', error);
      throw error;
    }
  },

  // Get stations by country
  getStationsByCountry: async (countryCode, limit = 100) => {
    try {
      const response = await apiClient.get(`/api/stations/by-country/${countryCode}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stations by country:', error);
      throw error;
    }
  },

  // Get stations by genre
  getStationsByGenre: async (genre, limit = 50) => {
    try {
      const response = await apiClient.get('/api/stations/by-genre', {
        params: { genre, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stations by genre:', error);
      throw error;
    }
  },

  // Search stations
  searchStations: async (query, limit = 50) => {
    try {
      const response = await apiClient.get('/api/stations/search', {
        params: { name: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching stations:', error);
      throw error;
    }
  },

  // Get countries
  getCountries: async () => {
    try {
      const response = await apiClient.get('/api/countries');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },

  // Get genres
  getGenres: async () => {
    try {
      const response = await apiClient.get('/api/genres');
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // Get station details
  getStationDetails: async (stationUuid) => {
    try {
      const response = await apiClient.get(`/api/station/${stationUuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching station details:', error);
      throw error;
    }
  },

  // Register station click
  clickStation: async (stationUuid) => {
    try {
      const response = await apiClient.post(`/api/station/${stationUuid}/click`);
      return response.data;
    } catch (error) {
      console.error('Error registering station click:', error);
      // Don't throw error for analytics failures
      return { success: false };
    }
  },
};

export default ApiService;