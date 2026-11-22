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
let nextUpdateTime = null;
let updateTimeout = null;
let connected = false;

// 5. Fetch and display the ISS data
const updateISSPosition = async () => {
  // Get data from a Promise
  const data = await getISSData();

  // Stop here if the user has disconnected or if an update is in progress
  // so that another update isn't scheduled
  if (!connected) {
    return;
  }

  // On failure:
  if (!data || !map) {
    // Set negative connection status
    apiConnectionElement.textContent = 'Disconnected';
    // Reset countdown (5s) if the API request fails for whatever reason
    nextUpdateTime = Date.now() + updateInterval;
    // Try to fetch the API again recursively (in 5s)
    updateTimeout = setTimeout(updateISSPosition, updateInterval);
    return;
  }

  // On success:
  // Display data in a readable format
  apiConnectionElement.textContent = 'Connected';
  lastUpdateElement.textContent = new Date().toLocaleTimeString('en-GB');
  altitudeElement.textContent = data.altitude.toFixed(2);
  velocityElement.textContent = data.velocity.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  latitudeElement.textContent = data.latitude.toFixed(4);
  longitudeElement.textContent = data.longitude.toFixed(4);

  // Update the ISS marker on the map with the API current coordinates
  updateISSMarker(map, data.latitude, data.longitude);

  // Reset countdown to next update deadline (5s)
  nextUpdateTime = Date.now() + updateInterval;
  // Call the API again recursively (in 5s)
  updateTimeout = setTimeout(updateISSPosition, updateInterval);
};

// 6. Connection Toggle
let countdownTimer = null;

const connectDisconnectToggle = document.getElementById(
  'connect-disconnect-toggle',
);

connectDisconnectToggle.addEventListener('click', () => {
  const buttonTextElement = document.getElementById('connect-disconnect-text');
  const buttonIconElement = document.getElementById('connect-icon-disconnect');

  if (!connected) {
    connected = true;
    buttonTextElement.textContent = 'Disconnect';
    buttonIconElement.classList.replace('icon-connect', 'icon-disconnect');
    nextUpdateTime = Date.now() + updateInterval;
    // Start countdown
    // Get remaining seconds until the next reset
    // (Countdown deadline in the future - current time)
    // (in ms so divide by 1000 to get s)
    countdownTimer = setInterval(() => {
      const remainingTime = Math.ceil((nextUpdateTime - Date.now()) / 1000);
      nextUpdateElement.textContent = `${Math.max(0, remainingTime)}s`;
    }, 1000);

    // Initial API request
    updateISSPosition();
  } else {
    connected = false;
    buttonTextElement.textContent = 'Connect';
    buttonIconElement.classList.replace('icon-disconnect', 'icon-connect');
    // Stop countdown
    clearInterval(countdownTimer);
    clearTimeout(updateTimeout);
    // Reset countdown display
    nextUpdateTime = null;
    // Set status to placeholders
    nextUpdateElement.textContent = '--';
    apiConnectionElement.textContent = 'Disconnected';
    lastUpdateElement.textContent = '--';
    altitudeElement.textContent = '--';
    velocityElement.textContent = '--';
    latitudeElement.textContent = '--';
    longitudeElement.textContent = '--';
  }
});

// 6. Set Interval Button
let fieldVisibility;

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
