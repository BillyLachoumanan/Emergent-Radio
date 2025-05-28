import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
} from 'react-native-track-player';
import {addToRecentlyPlayed} from './StorageService';

export const setupPlayer = async () => {
  try {
    // Setup the player
    await TrackPlayer.setupPlayer({
      waitForBuffer: true,
    });

    // Add capabilities
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
    });

    // Set repeat mode
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
  } catch (error) {
    console.error('Error setting up player:', error);
  }
};

export const playRadioStation = async (station) => {
  try {
    // Stop current playback
    await TrackPlayer.reset();

    // Create track object
    const track = {
      id: station.stationuuid,
      url: station.url_resolved || station.url,
      title: station.name,
      artist: `${station.country} • ${station.bitrate ? station.bitrate + ' kbps' : 'Unknown bitrate'}`,
      artwork: station.favicon || undefined,
      genre: station.tags ? station.tags.split(',')[0] : undefined,
      isLiveStream: true,
    };

    // Add track to player
    await TrackPlayer.add(track);
    
    // Start playback
    await TrackPlayer.play();

    // Add to recently played
    await addToRecentlyPlayed(station);

    return true;
  } catch (error) {
    console.error('Error playing station:', error);
    throw error;
  }
};

export const pausePlayback = async () => {
  try {
    await TrackPlayer.pause();
  } catch (error) {
    console.error('Error pausing playback:', error);
  }
};

export const resumePlayback = async () => {
  try {
    await TrackPlayer.play();
  } catch (error) {
    console.error('Error resuming playback:', error);
  }
};

export const stopPlayback = async () => {
  try {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Error stopping playback:', error);
  }
};

export const getPlayerState = async () => {
  try {
    return await TrackPlayer.getState();
  } catch (error) {
    console.error('Error getting player state:', error);
    return State.None;
  }
};

export const getCurrentTrack = async () => {
  try {
    const trackId = await TrackPlayer.getCurrentTrack();
    if (trackId !== null) {
      return await TrackPlayer.getTrack(trackId);
    }
    return null;
  } catch (error) {
    console.error('Error getting current track:', error);
    return null;
  }
};

export const setVolume = async (volume) => {
  try {
    await TrackPlayer.setVolume(volume);
  } catch (error) {
    console.error('Error setting volume:', error);
  }
};

// Event listeners for the audio service
export const addEventListener = (event, handler) => {
  return TrackPlayer.addEventListener(event, handler);
};

export const removeEventListener = (subscription) => {
  subscription?.remove();
};

// Audio service for background playback
module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
};