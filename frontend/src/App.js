import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [stations, setStations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [volume, setVolume] = useState(0.7);
  const [currentView, setCurrentView] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showStationDetails, setShowStationDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('stations');
  const audioRef = useRef(null);

  useEffect(() => {
    loadPopularStations();
    loadCountries();
    loadGenres();
    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    saveToLocalStorage();
  }, [favorites, recentlyPlayed, playlist, darkMode]);

  const loadFromLocalStorage = () => {
    const savedFavorites = localStorage.getItem('radioFavorites');
    const savedRecent = localStorage.getItem('radioRecentlyPlayed');
    const savedPlaylist = localStorage.getItem('radioPlaylist');
    const savedDarkMode = localStorage.getItem('radioDarkMode');
    
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent));
    if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('radioFavorites', JSON.stringify(favorites));
    localStorage.setItem('radioRecentlyPlayed', JSON.stringify(recentlyPlayed));
    localStorage.setItem('radioPlaylist', JSON.stringify(playlist));
    localStorage.setItem('radioDarkMode', JSON.stringify(darkMode));
  };

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
      setCountries(response.data.countries.slice(0, 50));
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadGenres = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/genres`);
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const loadChristianStations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stations/christian`);
      setStations(response.data.stations);
      setCurrentView('christian');
    } catch (error) {
      console.error('Error loading Christian stations:', error);
    }
    setLoading(false);
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

  const loadStationsByGenre = async (genreSlug) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/stations/by-genre?genre=${genreSlug}`);
      setStations(response.data.stations);
      setSelectedGenre(genreSlug);
      setCurrentView('genre');
    } catch (error) {
      console.error('Error loading stations by genre:', error);
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

  const addToRecentlyPlayed = (station) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.stationuuid !== station.stationuuid);
      return [station, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const toggleFavorite = (station) => {
    setFavorites(prev => {
      const isFavorited = prev.some(s => s.stationuuid === station.stationuuid);
      if (isFavorited) {
        return prev.filter(s => s.stationuuid !== station.stationuuid);
      } else {
        return [...prev, station];
      }
    });
  };

  const addToPlaylist = (station) => {
    setPlaylist(prev => {
      const exists = prev.some(s => s.stationuuid === station.stationuuid);
      if (!exists) {
        return [...prev, station];
      }
      return prev;
    });
  };

  const removeFromPlaylist = (stationUuid) => {
    setPlaylist(prev => prev.filter(s => s.stationuuid !== stationUuid));
  };

  const playStation = async (station) => {
    try {
      if (currentStation && currentStation.stationuuid === station.stationuuid && isPlaying) {
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

      // Add to recently played
      addToRecentlyPlayed(station);

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

  const shareStation = (station) => {
    if (navigator.share) {
      navigator.share({
        title: `${station.name} - Global Radio`,
        text: `Listen to ${station.name} from ${station.country}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Check out ${station.name} from ${station.country} on Global Radio: ${window.location.href}`);
      alert('Station link copied to clipboard!');
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

  const isFavorited = (station) => {
    return favorites.some(s => s.stationuuid === station.stationuuid);
  };

  const isInPlaylist = (station) => {
    return playlist.some(s => s.stationuuid === station.stationuuid);
  };

  const getDisplayStations = () => {
    switch (activeTab) {
      case 'favorites':
        return favorites;
      case 'recent':
        return recentlyPlayed;
      case 'playlist':
        return playlist;
      default:
        return stations;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'favorites':
        return 'Your Favorites';
      case 'recent':
        return 'Recently Played';
      case 'playlist':
        return 'Your Playlist';
      default:
        return getViewTitle();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'popular':
        return '🔥 Popular Stations';
      case 'christian':
        return '✝️ Christian Radio';
      case 'country':
        return `🌍 Stations from ${selectedCountry}`;
      case 'genre':
        return `🎵 ${selectedGenre} Stations`;
      case 'search':
        return `🔍 Search Results for "${searchTerm}"`;
      default:
        return 'Radio Stations';
    }
  };

  const themeClasses = darkMode 
    ? 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
    : 'min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white';

  return (
    <div className={themeClasses}>
      <audio
        ref={audioRef}
        onLoadStart={() => console.log('Loading audio...')}
        onCanPlay={() => console.log('Audio can play')}
        onError={(e) => console.error('Audio error:', e)}
        crossOrigin="anonymous"
      />
      
      {/* Header */}
      <div className={`${darkMode ? 'bg-black' : 'bg-black'} bg-opacity-50 backdrop-blur-sm border-b border-white border-opacity-20`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  🌍 Global Radio
                </h1>
                <p className="text-gray-300">Listen to radio stations from around the world</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-4 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
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
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-black'} bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20`}>
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
                <button
                  onClick={() => toggleFavorite(currentStation)}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorited(currentStation) 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                  }`}
                >
                  ❤️
                </button>
                <button
                  onClick={() => shareStation(currentStation)}
                  className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                >
                  📤
                </button>
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
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'stations'
                ? 'bg-blue-600 text-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            📻 Stations
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'favorites'
                ? 'bg-blue-600 text-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            ❤️ Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            🕒 Recent ({recentlyPlayed.length})
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'playlist'
                ? 'bg-blue-600 text-white'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            📝 Playlist ({playlist.length})
          </button>
        </div>

        {/* Station Discovery Navigation */}
        {activeTab === 'stations' && (
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
            
            <button
              onClick={loadChristianStations}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentView === 'christian'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              ✝️ Christian
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

            <select
              value={selectedGenre}
              onChange={(e) => e.target.value ? loadStationsByGenre(e.target.value) : loadPopularStations()}
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">🎵 All Genres</option>
              {genres.map((genre) => (
                <option key={genre.slug} value={genre.slug} className="text-black">
                  {genre.icon} {genre.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content Title */}
        <h2 className="text-2xl font-bold mb-6">{getTabTitle()}</h2>

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
            {getDisplayStations().map((station) => (
              <div
                key={station.stationuuid}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200"
              >
                <div className="flex items-start space-x-3 mb-3">
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
                
                {/* Station Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => playStation(station)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      {currentStation && currentStation.stationuuid === station.stationuuid && isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => toggleFavorite(station)}
                      className={`p-2 rounded-lg transition-colors text-sm ${
                        isFavorited(station) 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                      }`}
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => addToPlaylist(station)}
                      className={`p-2 rounded-lg transition-colors text-sm ${
                        isInPlaylist(station)
                          ? 'bg-yellow-600 text-white'
                          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                      }`}
                    >
                      📝
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => shareStation(station)}
                      className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors text-sm"
                    >
                      📤
                    </button>
                    <button
                      onClick={() => setShowStationDetails(station)}
                      className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors text-sm"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
                
                {/* Remove from playlist option */}
                {activeTab === 'playlist' && (
                  <button
                    onClick={() => removeFromPlaylist(station.stationuuid)}
                    className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Remove from Playlist
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && getDisplayStations().length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg">
              {activeTab === 'favorites' ? 'No favorite stations yet' :
               activeTab === 'recent' ? 'No recently played stations' :
               activeTab === 'playlist' ? 'Your playlist is empty' :
               'No stations found'}
            </p>
            <p className="text-gray-300 mt-2">
              {activeTab === 'stations' ? 'Try a different search term or country' : 
               'Start listening to stations to build your collection'}
            </p>
          </div>
        )}
      </div>

      {/* Station Details Modal */}
      {showStationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 max-w-md w-full border border-white border-opacity-20">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Station Details</h3>
              <button
                onClick={() => setShowStationDetails(null)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-white">
              <div>
                <strong>Name:</strong> {showStationDetails.name}
              </div>
              <div>
                <strong>Country:</strong> {getCountryFlag(showStationDetails.countrycode)} {showStationDetails.country}
              </div>
              {showStationDetails.state && (
                <div>
                  <strong>State:</strong> {showStationDetails.state}
                </div>
              )}
              <div>
                <strong>Language:</strong> {showStationDetails.language}
              </div>
              <div>
                <strong>Bitrate:</strong> {formatBitrate(showStationDetails.bitrate)}
              </div>
              <div>
                <strong>Codec:</strong> {showStationDetails.codec}
              </div>
              <div>
                <strong>Votes:</strong> {showStationDetails.votes}
              </div>
              <div>
                <strong>Clicks:</strong> {showStationDetails.clickcount}
              </div>
              {showStationDetails.tags && (
                <div>
                  <strong>Tags:</strong> {showStationDetails.tags}
                </div>
              )}
              {showStationDetails.homepage && (
                <div>
                  <strong>Website:</strong> 
                  <a 
                    href={showStationDetails.homepage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 ml-1"
                  >
                    Visit
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;