import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  name: 'light',
  gradientColors: ['#f3f4f6', '#e5e7eb', '#d1d5db'],
  backgroundColor: '#ffffff',
  cardBackground: '#ffffff',
  headerBackground: '#f9fafb',
  textColor: '#111827',
  textSecondary: '#6b7280',
  primaryColor: '#6366f1',
  borderColor: '#e5e7eb',
  shadowColor: '#000000',
};

const darkTheme = {
  name: 'dark',
  gradientColors: ['#1a1a2e', '#16213e', '#0f3460'],
  backgroundColor: '#111827',
  cardBackground: 'rgba(255, 255, 255, 0.1)',
  headerBackground: '#1f2937',
  textColor: '#ffffff',
  textSecondary: '#9ca3af',
  primaryColor: '#6366f1',
  borderColor: '#374151',
  shadowColor: '#000000',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [isDark, setIsDark] = useState(true); // Default to dark theme
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    setTheme(isDark ? darkTheme : lightTheme);
    saveTheme();
  }, [isDark]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        const isDarkSaved = JSON.parse(savedTheme);
        setIsDark(isDarkSaved);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveTheme = async () => {
    try {
      await AsyncStorage.setItem('theme', JSON.stringify(isDark));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};