/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './package.json';
import TrackPlayer from 'react-native-track-player';

// Register the main application
AppRegistry.registerComponent(appName, () => App);

// Register the track player service
TrackPlayer.registerPlaybackService(() => require('./src/services/AudioService'));