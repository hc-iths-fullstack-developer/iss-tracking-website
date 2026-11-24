import { getISSData } from './iss-api.js';
import {
  initializeISSMap,
  removeISSMarker,
  updateISSMarker,
} from './iss-map.js';

// Initialize the map
const map = initializeISSMap();

// Get DOM Elements
const altitudeElement = document.querySelector('#iss-altitude');
const velocityElement = document.querySelector('#iss-velocity');
const latitudeElement = document.querySelector('#iss-latitude');
const longitudeElement = document.querySelector('#iss-longitude');
const apiConnectionElement = document.querySelector('#api-connection');
const lastUpdateElement = document.querySelector('#last-update');
const nextUpdateElement = document.querySelector('#next-update');
const connectionIndicatorElement = document.querySelector(
  '#connection-indicator',
);
const loadingElements = document.querySelectorAll('.dot-loader');

// Set shared variables here
let connected = false;
let connecting = false;
let countdownTimer = null;
let nextUpdateTime = null;
let updateInterval = 5000;
let updateTimeout = null;

// Fetch and display the ISS data
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
    // Set error connection status
    apiConnectionElement.textContent = 'Error';
    connectionIndicatorElement.className =
      'connection-indicator indicator-error';
    return;
  }

  // On success:
  if (data) {
    connected = true;
    // Show and update the ISS marker on the map with the current API coordinates
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
    // Call the API again recursively (in 5s)
    updateTimeout = setTimeout(updateISSPosition, updateInterval);
    // Hide loaders
    loadingElements.forEach((element) => {
      element.style.setProperty('display', 'none');
    });
    // Show and set data elements to a readable format
    altitudeElement.style.setProperty('display', 'block');
    altitudeElement.textContent = data.altitude.toFixed(2);
    apiConnectionElement.textContent = 'Live';
    connectionIndicatorElement.className =
      'connection-indicator indicator-live';
    lastUpdateElement.style.setProperty('display', 'block');
    lastUpdateElement.textContent = new Date().toLocaleTimeString('en-GB');
    latitudeElement.style.setProperty('display', 'block');
    latitudeElement.textContent = data.latitude.toFixed(4);
    longitudeElement.style.setProperty('display', 'block');
    longitudeElement.textContent = data.longitude.toFixed(4);
    nextUpdateElement.style.setProperty('display', 'block');
    // Display initial countdown immediately for UI improvement
    // as countDownTimer does not execute for the first 1s
    nextUpdateElement.textContent = `${updateInterval / 1000}s`;
    velocityElement.style.setProperty('display', 'block');
    velocityElement.textContent = data.velocity.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

// Connection Toggle
const connectDisconnectToggle = document.querySelector(
  '#connect-disconnect-toggle',
);

connectDisconnectToggle.addEventListener('click', () => {
  const buttonTextElement = document.querySelector('#connect-disconnect-text');
  const buttonIconElement = document.querySelector('#connect-disconnect-icon');

  if (!connecting) {
    connecting = true;
    // Set dynamic elements to connecting status
    buttonTextElement.textContent = 'Disconnect';
    buttonIconElement.className = 'button-icon icon-disconnect';
    // Hide data elements while loading
    altitudeElement.style.setProperty('display', 'none');
    apiConnectionElement.textContent = 'Connecting';
    connectionIndicatorElement.className =
      'connection-indicator indicator-connecting';
    lastUpdateElement.style.setProperty('display', 'none');
    latitudeElement.style.setProperty('display', 'none');
    longitudeElement.style.setProperty('display', 'none');
    nextUpdateElement.style.setProperty('display', 'none');
    velocityElement.style.setProperty('display', 'none');
    // Show loaders
    loadingElements.forEach((element) => {
      element.style.setProperty('display', 'flex');
    });
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
    // Remove map marker
    removeISSMarker();
    // Set dynamic elements to disconnected status
    buttonTextElement.textContent = 'Connect';
    buttonIconElement.className = 'button-icon icon-connect';
    connectionIndicatorElement.className =
      'connection-indicator indicator-offline';
    // Show and set data elements to placeholders
    altitudeElement.textContent = '--';
    altitudeElement.style.setProperty('display', 'block');
    apiConnectionElement.textContent = 'Offline';
    lastUpdateElement.textContent = '--';
    lastUpdateElement.style.setProperty('display', 'block');
    latitudeElement.textContent = '--';
    latitudeElement.style.setProperty('display', 'block');
    longitudeElement.textContent = '--';
    longitudeElement.style.setProperty('display', 'block');
    nextUpdateElement.textContent = '--';
    nextUpdateElement.style.setProperty('display', 'block');
    velocityElement.textContent = '--';
    velocityElement.style.setProperty('display', 'block');
    // Hide loaders
    loadingElements.forEach((element) => {
      element.style.setProperty('display', 'none');
    });
  }
});

// Interval Button
let fieldVisibility = false;
const setIntervalButton = document.querySelector('#set-interval-button');
const setIntervalFieldElement = document.querySelector('#set-interval-field');

const applyInterval = () => {
  const seconds = Number(setIntervalFieldElement.value);

  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 60) {
    setIntervalFieldElement.setCustomValidity(
      'Please enter a whole number between 1 and 60 seconds.',
    );
    setIntervalFieldElement.reportValidity();
    return false;
  }

  setIntervalFieldElement.setCustomValidity('');
  updateISSInterval(seconds);

  return true;
};


setIntervalButton.addEventListener('click', () => {
  if (!fieldVisibility) {
    fieldVisibility = true;

    // Show field, hide data element
    setIntervalFieldElement.style.setProperty('display', 'block');
    nextUpdateElement.style.setProperty('display', 'none');

    setIntervalFieldElement.focus();
  } else {
    if (!applyInterval()) return;

    // Hide field, show data element
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    nextUpdateElement.style.setProperty('display', 'block');
  }
});

// Interval Input Field
setIntervalFieldElement.addEventListener('input', () => {
  setIntervalFieldElement.value = setIntervalFieldElement.value.replace(
    /[^0-9]/g,
    '',
  );
});

const updateISSInterval = (seconds) => {
  updateInterval = seconds * 1000;

  if (connecting) {
    clearTimeout(updateTimeout);

    nextUpdateTime = Date.now() + updateInterval;

    updateTimeout = setTimeout(updateISSPosition, updateInterval);
  }
};

// Apply Interval on Enter
setIntervalFieldElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();

    if (!applyInterval()) return;

    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    nextUpdateElement.style.setProperty('display', 'block');
  }
});

setIntervalFieldElement.addEventListener('change', () => {
  const seconds = Number(setIntervalFieldElement.value);

  if (seconds >= 1 && seconds <= 60) {
    updateISSInterval(seconds);

    // Hide field, show data element
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    nextUpdateElement.style.setProperty('display', 'block');
  } else {
    setIntervalFieldElement.setCustomValidity(
      'Please enter a value between 1 and 60 seconds.',
    );
    setIntervalFieldElement.reportValidity();
  }
});
