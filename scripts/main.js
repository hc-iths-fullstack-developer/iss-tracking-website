import { getISSData } from './iss-api.js';
import {
  initializeISSMap,
  removeISSMarker,
  updateISSMarker,
} from './iss-map.js';
import {
  resetDashboard,
  toggleLoaders,
  updateConnectionStatus,
  updateCountdown,
  updateDashboard,
  toggleStatusElements,
  toggleTelemetry,
  updateLastUpdate,
} from './dashboard';

// Initialize the map
const map = initializeISSMap();

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
    updateConnectionStatus('error');
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
        updateCountdown(Math.max(0, remainingTime));
      }, 1000);
    }
    // Call the API again recursively (in 5s)
    updateTimeout = setTimeout(updateISSPosition, updateInterval);
    // Show status and telemetry elements
    toggleTelemetry(true);
    toggleStatusElements(true);
    // Hide loaders
    toggleLoaders(false);
    // Show and set data elements to a readable format
    updateDashboard(data);
    updateLastUpdate();
    updateConnectionStatus('connected');
    // Display initial countdown immediately for UI improvement
    // as countDownTimer does not execute for the first 1s
    updateCountdown(updateInterval / 1000);
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
    // Hide data elements while loading
    toggleTelemetry(false);
    toggleStatusElements(false);
    // Show loaders
    toggleLoaders(true);
    // Show connecting status
    updateConnectionStatus('connecting');
    // Initial API request
    updateISSPosition();
    // Toggle button to show disconnect action
    buttonTextElement.textContent = 'Disconnect';
    buttonIconElement.className = 'button-icon icon-disconnect';
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
    // Show and set data elements to placeholders
    toggleTelemetry(true);
    toggleStatusElements(true);
    // Hide loaders
    toggleLoaders(false);
    // Show disconnected status
    updateConnectionStatus('disconnected');
    resetDashboard();
    // Toggle button to show connect action
    buttonTextElement.textContent = 'Connect';
    buttonIconElement.className = 'button-icon icon-connect';
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
    //nextUpdateElement.style.setProperty('display', 'none');

    setIntervalFieldElement.focus();
  } else {
    if (!applyInterval()) return;

    // Hide field, show data element
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    //nextUpdateElement.style.setProperty('display', 'block');
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
    //nextUpdateElement.style.setProperty('display', 'block');
  }
});

setIntervalFieldElement.addEventListener('change', () => {
  const seconds = Number(setIntervalFieldElement.value);

  if (seconds >= 1 && seconds <= 60) {
    updateISSInterval(seconds);

    // Hide field, show data element
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    //nextUpdateElement.style.setProperty('display', 'block');
  } else {
    setIntervalFieldElement.setCustomValidity(
      'Please enter a value between 1 and 60 seconds.',
    );
    setIntervalFieldElement.reportValidity();
  }
});
