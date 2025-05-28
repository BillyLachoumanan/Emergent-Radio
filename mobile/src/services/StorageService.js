import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAVORITES: 'radioFavorites',
  RECENTLY_PLAYED: 'radioRecentlyPlayed',
  PLAYLIST: 'radioPlaylist',
  THEME: 'radioTheme',
  SETTINGS: 'radioSettings',
};

// Generic storage helpers
const getData = async (key, defaultValue = []) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return defaultValue;
  }
};

const setData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    return false;
  }
};

// Favorites management
export const getFavorites = async () => {
  return await getData(KEYS.FAVORITES);
};

export const addToFavorites = async (station) => {
  try {
    const favorites = await getFavorites();
    const existingIndex = favorites.findIndex(s => s.stationuuid === station.stationuuid);
    
    if (existingIndex === -1) {
      favorites.unshift(station);
      await setData(KEYS.FAVORITES, favorites);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async (stationUuid) => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter(s => s.stationuuid !== stationUuid);
    await setData(KEYS.FAVORITES, filtered);
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isFavorite = async (stationUuid) => {
  try {
    const favorites = await getFavorites();
    return favorites.some(s => s.stationuuid === stationUuid);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Recently played management
export const getRecentlyPlayed = async () => {
  return await getData(KEYS.RECENTLY_PLAYED);
};

export const addToRecentlyPlayed = async (station) => {
  try {
    const recent = await getRecentlyPlayed();
    
    // Remove if already exists
    const filtered = recent.filter(s => s.stationuuid !== station.stationuuid);
    
    // Add to beginning
    filtered.unshift({
      ...station,
      playedAt: new Date().toISOString(),
    });
    
    // Keep only last 20
    const limited = filtered.slice(0, 20);
    
    await setData(KEYS.RECENTLY_PLAYED, limited);
    return true;
  } catch (error) {
    console.error('Error adding to recently played:', error);
    return false;
  }
};

export const clearRecentlyPlayed = async () => {
  try {
    await setData(KEYS.RECENTLY_PLAYED, []);
    return true;
  } catch (error) {
    console.error('Error clearing recently played:', error);
    return false;
  }
};

// Playlist management
export const getPlaylist = async () => {
  return await getData(KEYS.PLAYLIST);
};

export const addToPlaylist = async (station) => {
  try {
    const playlist = await getPlaylist();
    const existingIndex = playlist.findIndex(s => s.stationuuid === station.stationuuid);
    
    if (existingIndex === -1) {
      playlist.push({
        ...station,
        addedAt: new Date().toISOString(),
      });
      await setData(KEYS.PLAYLIST, playlist);
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to playlist:', error);
    return false;
  }
};

export const removeFromPlaylist = async (stationUuid) => {
  try {
    const playlist = await getPlaylist();
    const filtered = playlist.filter(s => s.stationuuid !== stationUuid);
    await setData(KEYS.PLAYLIST, filtered);
    return true;
  } catch (error) {
    console.error('Error removing from playlist:', error);
    return false;
  }
};

export const isInPlaylist = async (stationUuid) => {
  try {
    const playlist = await getPlaylist();
    return playlist.some(s => s.stationuuid === stationUuid);
  } catch (error) {
    console.error('Error checking playlist status:', error);
    return false;
  }
};

export const clearPlaylist = async () => {
  try {
    await setData(KEYS.PLAYLIST, []);
    return true;
  } catch (error) {
    console.error('Error clearing playlist:', error);
    return false;
  }
};

// Settings management
export const getSettings = async () => {
  const defaultSettings = {
    notifications: true,
    autoPlay: false,
    quality: 'auto',
    volume: 0.7,
    theme: 'dark',
  };
  
  return await getData(KEYS.SETTINGS, defaultSettings);
};

export const updateSettings = async (settings) => {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await setData(KEYS.SETTINGS, updatedSettings);
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

// Data export/import for backup
export const exportData = async () => {
  try {
    const favorites = await getFavorites();
    const recentlyPlayed = await getRecentlyPlayed();
    const playlist = await getPlaylist();
    const settings = await getSettings();
    
    return {
      favorites,
      recentlyPlayed,
      playlist,
      settings,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

export const importData = async (data) => {
  try {
    if (data.favorites) await setData(KEYS.FAVORITES, data.favorites);
    if (data.recentlyPlayed) await setData(KEYS.RECENTLY_PLAYED, data.recentlyPlayed);
    if (data.playlist) await setData(KEYS.PLAYLIST, data.playlist);
    if (data.settings) await setData(KEYS.SETTINGS, data.settings);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.FAVORITES,
      KEYS.RECENTLY_PLAYED,
      KEYS.PLAYLIST,
      KEYS.SETTINGS,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};