import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [stations, setStations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [volume, setVolume] = useState(0.7);
  const [currentView, setCurrentView] = useState('popular');
  const audioRef = useRef(null);

  useEffect(() => {
    loadPopularStations();
    loadCountries();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadPopularStations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stations/popular?limit=50`);
      setStations(response.data.stations);
      setCurrentView('popular');
    } catch (error) {
      console.error('Error loading popular stations:', error);
    }
    setLoading(false);
  };

  const loadCountries = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/countries`);
      setCountries(response.data.countries.slice(0, 50)); // Top 50 countries
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadStationsByCountry = async (countryCode) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stations/by-country/${countryCode}`);
      setStations(response.data.stations);
      setSelectedCountry(countryCode);
      setCurrentView('country');
    } catch (error) {
      console.error('Error loading stations by country:', error);
    }
    setLoading(false);
  };

  const searchStations = async () => {
    if (!searchTerm.trim()) {
      loadPopularStations();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stations/search`, {
        params: { name: searchTerm, limit: 50 }
      });
      setStations(response.data.stations);
      setCurrentView('search');
    } catch (error) {
      console.error('Error searching stations:', error);
    }
    setLoading(false);
  };

  const playStation = async (station) => {
    try {
      if (currentStation && currentStation.stationuuid === station.stationuuid && isPlaying) {
        // Pause current station
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      // Register click for statistics
      try {
        await axios.post(`${BACKEND_URL}/api/station/${station.stationuuid}/click`);
      } catch (error) {
        console.log('Could not register click:', error);
      }

      // Use url_resolved if available, otherwise fall back to url
      const streamUrl = station.url_resolved || station.url;
      
      if (audioRef.current) {
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        
        try {
          await audioRef.current.play();
          setCurrentStation(station);
          setIsPlaying(true);
        } catch (playError) {
          console.error('Error playing station:', playError);
          // Try alternative URL if available
          if (station.url_resolved !== station.url) {
            try {
              audioRef.current.src = station.url;
              audioRef.current.load();
              await audioRef.current.play();
              setCurrentStation(station);
              setIsPlaying(true);
            } catch (altError) {
              alert('Unable to play this station. It might be offline or incompatible.');
            }
          } else {
            alert('Unable to play this station. It might be offline or incompatible.');
          }
        }
      }
    } catch (error) {
      console.error('Error in playStation:', error);
      alert('Error playing station');
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchStations();
    }
  };

  const formatBitrate = (bitrate) => {
    return bitrate > 0 ? `${bitrate} kbps` : 'Unknown';
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    return String.fromCodePoint(
      ...countryCode.toUpperCase().split('').map(char => 0x1F1E6 + char.charCodeAt(0) - 65)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <audio
        ref={audioRef}
        onLoadStart={() => console.log('Loading audio...')}
        onCanPlay={() => console.log('Audio can play')}
        onError={(e) => console.error('Audio error:', e)}
        crossOrigin="anonymous"
      />
      
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🌍 Global Radio
              </h1>
              <p className="text-gray-300">Listen to radio stations from around the world</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 lg:w-96">
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <button
                onClick={searchStations}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Playing Station */}
      {currentStation && (
        <div className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  {currentStation.favicon ? (
                    <img 
                      src={currentStation.favicon} 
                      alt="" 
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span className="text-white font-bold text-lg" style={{display: currentStation.favicon ? 'none' : 'block'}}>
                    📻
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{currentStation.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {getCountryFlag(currentStation.countrycode)} {currentStation.country} • {formatBitrate(currentStation.bitrate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-blue-500"
                  />
                </div>
                <button
                  onClick={isPlaying ? stopPlayback : () => playStation(currentStation)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  <span>{isPlaying ? '⏸️' : '▶️'}</span>
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={loadPopularStations}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              currentView === 'popular'
                ? 'bg-blue-600 text-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            🔥 Popular
          </button>
          
          <select
            value={selectedCountry}
            onChange={(e) => e.target.value ? loadStationsByCountry(e.target.value) : loadPopularStations()}
            className="px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">🌍 All Countries</option>
            {countries.map((country) => (
              <option key={country.iso_3166_1} value={country.iso_3166_1} className="text-black">
                {getCountryFlag(country.iso_3166_1)} {country.name} ({country.stationcount})
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
            <p className="text-white mt-4">Loading stations...</p>
          </div>
        )}

        {/* Stations Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stations.map((station) => (
              <div
                key={station.stationuuid}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200 cursor-pointer"
                onClick={() => playStation(station)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {station.favicon ? (
                      <img 
                        src={station.favicon} 
                        alt="" 
                        className="w-8 h-8 rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className="text-white font-bold" style={{display: station.favicon ? 'none' : 'block'}}>
                      📻
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm mb-1 truncate">
                      {station.name}
                    </h3>
                    <p className="text-gray-300 text-xs mb-2">
                      {getCountryFlag(station.countrycode)} {station.country}
                    </p>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className="bg-blue-600 bg-opacity-60 text-white px-2 py-1 rounded">
                        {formatBitrate(station.bitrate)}
                      </span>
                      {station.codec && (
                        <span className="bg-purple-600 bg-opacity-60 text-white px-2 py-1 rounded">
                          {station.codec.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {station.tags && (
                      <p className="text-gray-400 text-xs mt-2 truncate">
                        {station.tags.split(',').slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>👥 {station.clickcount}</span>
                    <span>❤️ {station.votes}</span>
                  </div>
                  <div className="flex items-center">
                    {currentStation && currentStation.stationuuid === station.stationuuid && isPlaying ? (
                      <span className="text-red-400 font-bold">⏸️</span>
                    ) : (
                      <span className="text-green-400 font-bold">▶️</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && stations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg">No stations found</p>
            <p className="text-gray-300 mt-2">Try a different search term or country</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;