import { getISSData } from './iss-api.js';
import { removeISSMarker, updateISSMarker } from './iss-map.js';
import {
  updateDashboard,
  updateConnectionStatus,
  updateLastUpdate,
  updateCountdown,
  toggleLoaders,
  toggleTelemetry,
  toggleStatusElements,
  resetDashboard,
} from './dashboard.js';

// Shared variables
let connected = false;
let connecting = false;
let countdownTimer = null;
let nextUpdateTime = null;
let updateInterval = 5000;
let updateTimeout = null;
let map = null;

// Fetch and display ISS data
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

// Connect / Disconnect Toggle
const toggleConnection = () => {
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
    // Reset countdown to next update deadline (5s)
    if (connected) {
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
};

// Change update interval
const updateISSInterval = (seconds) => {
  updateInterval = seconds * 1000;
  if (connecting) {
    // Reset timeout
    clearTimeout(updateTimeout);
    // Set the future update time
    nextUpdateTime = Date.now() + updateInterval;
    // Update countdown display
    updateCountdown(seconds);
    // Call the API (in 5s) after resetting the countdown
    updateTimeout = setTimeout(updateISSPosition, updateInterval);
  }
};

// Initialize ISS controller
const initializeISSController = (mapInstance) => {
  map = mapInstance;
  const connectDisconnectToggle = document.querySelector(
    '#connect-disconnect-toggle',
  );
  connectDisconnectToggle.addEventListener('click', toggleConnection);
  return {
    updateISSInterval,
  };
};

export { initializeISSController, updateISSInterval };
