import { getISSData } from './iss-api.js';
import { initializeISSMap, updateISSMarker } from './iss-map.js';

// 1. Initialize the map
const map = initializeISSMap();

// 2. Get DOM Elements
const altitudeElement = document.getElementById('iss-altitude');
const velocityElement = document.getElementById('iss-velocity');
const latitudeElement = document.getElementById('iss-latitude');
const longitudeElement = document.getElementById('iss-longitude');
const apiConnectionElement = document.getElementById('api-connection');
const lastUpdateElement = document.getElementById('last-update');
const nextUpdateElement = document.getElementById('next-update');

// 3. Set update interval in milliseconds (5s)
const updateInterval = 5000;

// 4. Set countdown deadline (current time + 5s in the future)
let connected = false;
let nextUpdateTime = null;
let updateTimeout = null;
let connecting = false;
let countdownTimer = null;

// 5. Fetch and display the ISS data
const updateISSPosition = async () => {
  // Get data from a Promise
  const data = await getISSData();

  // Stop here if the user has disconnected or if an update is in progress
  // so that another update isn't scheduled
  if (!connecting) {
    return;
  }

  // On failure:
  if (!data || !map) {
    connected = false;
    // Reset countdown (5s) if the API request fails for whatever reason
    nextUpdateTime = Date.now() + updateInterval;
    // Try to fetch the API again recursively (in 5s)
    updateTimeout = setTimeout(updateISSPosition, updateInterval);
    // Set negative connection status
    apiConnectionElement.textContent = 'No Connection';
    return;
  }

  // On success:
  if (data) {
    connected = true;
    // Update the ISS marker on the map with the API current coordinates
    updateISSMarker(map, data.latitude, data.longitude);
    // Reset countdown to next update deadline (5s)
    nextUpdateTime = Date.now() + updateInterval;
    // Start countdown (only if it isn't already running)
    if (!countdownTimer) {
      countdownTimer = setInterval(() => {
        // Get remaining seconds until the next reset
        // (Countdown deadline in the future - current time)
        // (in ms so divide by 1000 to get s)
        const remainingTime = Math.ceil((nextUpdateTime - Date.now()) / 1000);
        nextUpdateElement.textContent = `${Math.max(0, remainingTime)}s`;
      }, 1000);
    }
    // Display initial countdown immediately for UI improvement
    // as countDownTimer does not execute for the first 1s
    nextUpdateElement.textContent = `${updateInterval / 1000}s`;
    // Call the API again recursively (in 5s)
    updateTimeout = setTimeout(updateISSPosition, updateInterval);
    // Set data elements to a readable format
    altitudeElement.textContent = data.altitude.toFixed(2);
    apiConnectionElement.textContent = 'Connected';
    lastUpdateElement.textContent = new Date().toLocaleTimeString('en-GB');
    latitudeElement.textContent = data.latitude.toFixed(4);
    longitudeElement.textContent = data.longitude.toFixed(4);
    velocityElement.textContent = data.velocity.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

// 6. Connection Toggle
const connectDisconnectToggle = document.getElementById(
  'connect-disconnect-toggle',
);

connectDisconnectToggle.addEventListener('click', () => {
  const buttonTextElement = document.getElementById('connect-disconnect-text');
  const connectIconElement = document.getElementById('icon-connect');
  const disconnectIconElement = document.getElementById('icon-disconnect');

  if (!connecting) {
    connecting = true;
    // Set interactive elements to connecting status
    buttonTextElement.textContent = 'Disconnect';
    disconnectIconElement.style.setProperty('display', 'block');
    connectIconElement.style.setProperty('display', 'none');
    // Set data elements to loaders
    altitudeElement.textContent = '...';
    apiConnectionElement.textContent = 'Connecting...';
    lastUpdateElement.textContent = '...';
    latitudeElement.textContent = '...';
    longitudeElement.textContent = '...';
    nextUpdateElement.textContent = '...';
    velocityElement.textContent = '...';
    // Initial API request
    updateISSPosition();

    if (connected) {
      // Reset countdown to next update deadline (5s)
      nextUpdateTime = Date.now() + updateInterval;
    }
  } else {
    connecting = false;
    connected = false;
    // Reset countdown
    clearInterval(countdownTimer);
    countdownTimer = null;
    // Reset timeout
    clearTimeout(updateTimeout);
    updateTimeout = null;
    // Reset countdown display
    nextUpdateTime = null;
    // Set interactive elements to disconnected status
    buttonTextElement.textContent = 'Connect';
    connectIconElement.style.setProperty('display', 'block');
    disconnectIconElement.style.setProperty('display', 'none');
    // Set data elements to placeholders
    altitudeElement.textContent = '--';
    apiConnectionElement.textContent = 'Disconnected';
    lastUpdateElement.textContent = '--';
    latitudeElement.textContent = '--';
    longitudeElement.textContent = '--';
    nextUpdateElement.textContent = '--';
    velocityElement.textContent = '--';
  }
});

// 6. Set Interval Button
let fieldVisibility = false;
const setIntervalButton = document.getElementById('set-interval-button');

setIntervalButton.addEventListener('click', () => {
  const setIntervalFieldElement = document.getElementById('set-interval-field');
  if (!fieldVisibility) {
    fieldVisibility = true;
    setIntervalFieldElement.style.setProperty('display', 'block');
  } else {
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
  }
});
