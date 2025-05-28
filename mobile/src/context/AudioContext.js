import React, {createContext, useState, useEffect} from 'react';
import {
  playRadioStation,
  pausePlayback,
  resumePlayback,
  stopPlayback,
  getPlayerState,
  getCurrentTrack,
  setVolume as setPlayerVolume,
  addEventListener,
  removeEventListener,
} from '../services/AudioService';
import {State, Event} from 'react-native-track-player';

export const AudioContext = createContext();

export const AudioProvider = ({children}) => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to player state changes
    const onPlaybackState = addEventListener(Event.PlaybackState, (data) => {
      setIsPlaying(data.state === State.Playing);
      setIsLoading(data.state === State.Buffering || data.state === State.Connecting);
    });

    const onPlaybackError = addEventListener(Event.PlaybackError, (data) => {
      console.error('Playback error:', data);
      setError('Failed to play station');
      setIsPlaying(false);
      setIsLoading(false);
    });

    const onPlaybackQueueEnded = addEventListener(Event.PlaybackQueueEnded, () => {
      setIsPlaying(false);
      setIsLoading(false);
    });

    // Set initial volume
    setPlayerVolume(volume);

    // Cleanup
    return () => {
      removeEventListener(onPlaybackState);
      removeEventListener(onPlaybackError);
      removeEventListener(onPlaybackQueueEnded);
    };
  }, [volume]);

  const playStation = async (station) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // If same station is playing, pause it
      if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
        await pausePlayback();
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }
      
      // If same station is paused, resume it
      if (currentStation?.stationuuid === station.stationuuid && !isPlaying) {
        await resumePlayback();
        setIsPlaying(true);
        setIsLoading(false);
        return;
      }

      // Play new station
      await playRadioStation(station);
      setCurrentStation(station);
      
    } catch (error) {
      console.error('Error playing station:', error);
      setError('Failed to play station');
      setIsPlaying(false);
      setCurrentStation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const pause = async () => {
    try {
      await pausePlayback();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const resume = async () => {
    try {
      await resumePlayback();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error resuming:', error);
    }
  };

  const stop = async () => {
    try {
      await stopPlayback();
      setIsPlaying(false);
      setCurrentStation(null);
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  const changeVolume = async (newVolume) => {
    try {
      setVolume(newVolume);
      await setPlayerVolume(newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    error,
    playStation,
    pause,
    resume,
    stop,
    changeVolume,
    clearError,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};