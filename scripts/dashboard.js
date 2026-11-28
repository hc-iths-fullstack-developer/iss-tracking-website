// This module receives and displays data on the dashboard
// It shows, hides and updates elements that display data
// As well as loading elements, status elements and placeholders

// Get DOM Elements
const altitudeElement = document.querySelector('#iss-altitude');
const velocityElement = document.querySelector('#iss-velocity');
const latitudeElement = document.querySelector('#iss-latitude');
const longitudeElement = document.querySelector('#iss-longitude');
const apiConnectionElement = document.querySelector('#api-connection');
const lastUpdateElement = document.querySelector('#last-update');
const nextUpdateElement = document.querySelector('#next-update');
const nextUpdateLoaderElement = document.querySelector('#next-update-loader');
const setIntervalFieldElement = document.querySelector('#set-interval-field');
const connectionIndicatorElement = document.querySelector(
  '#connection-indicator',
);
const loadingElements = document.querySelectorAll('.dot-loader');

// Shared visibility state
let loadersVisible = false;
let telemetryVisible = false;
let statusElementsVisible = false;
let intervalEditing = false;

// Apply dashboard visibility
const updateDashboardVisibility = () => {
  // Show or hide all loaders
  loadingElements.forEach((element) => {
    element.classList.toggle('hidden', !loadersVisible);
  });
  // Show or hide telemetry elements
  const telemetryElements = [
    altitudeElement,
    velocityElement,
    latitudeElement,
    longitudeElement,
  ];
  telemetryElements.forEach((element) => {
    element.classList.toggle('hidden', !telemetryVisible);
  });
  // Show or hide status elements
  lastUpdateElement.classList.toggle('hidden', !statusElementsVisible);
  // Show or hide Next Update element
  nextUpdateElement.classList.toggle(
    'hidden',
    !statusElementsVisible || intervalEditing,
  );
  nextUpdateLoaderElement.classList.toggle(
    'hidden',
    !loadersVisible || intervalEditing,
  );
  setIntervalFieldElement.classList.toggle('hidden', !intervalEditing);
};

// Show or hide loaders
const toggleLoaders = (visible) => {
  loadersVisible = visible;
  updateDashboardVisibility();
};

// Show or hide telemetry elements
const toggleTelemetry = (visible) => {
  telemetryVisible = visible;
  updateDashboardVisibility();
};

// Show or hide status elements
const toggleStatusElements = (visible) => {
  statusElementsVisible = visible;
  updateDashboardVisibility();
};

// Enable or disable interval editing
const toggleIntervalEditing = (editing) => {
  intervalEditing = editing;
  updateDashboardVisibility();
};

// Reset dashboard data to placeholders
const resetDashboard = () => {
  const placeholderText = '--';
  altitudeElement.textContent = placeholderText;
  velocityElement.textContent = placeholderText;
  latitudeElement.textContent = placeholderText;
  longitudeElement.textContent = placeholderText;
  lastUpdateElement.textContent = placeholderText;
  nextUpdateElement.textContent = placeholderText;
};

// Update connection status elements
const updateConnectionStatus = (status) => {
  const statuses = {
    connecting: {
      text: 'Connecting',
      className: 'indicator-connecting',
    },
    connected: {
      text: 'Live',
      className: 'indicator-live',
    },
    disconnected: {
      text: 'Offline',
      className: 'indicator-offline',
    },
    error: {
      text: 'Error',
      className: 'indicator-error',
    },
  };
  const currentStatus = statuses[status];
  apiConnectionElement.textContent = currentStatus.text;
  connectionIndicatorElement.className = `connection-indicator ${currentStatus.className}`;
};

// Update countdown timer display
const updateCountdown = (seconds) => {
  nextUpdateElement.textContent = `${seconds}s`;
};

// Update ISS telemetry with data
const updateDashboard = (data) => {
  altitudeElement.textContent = data.altitude.toFixed(2);
  latitudeElement.textContent = data.latitude.toFixed(4);
  longitudeElement.textContent = data.longitude.toFixed(4);
  velocityElement.textContent = data.velocity.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Update last update timestamp
const updateLastUpdate = () => {
  lastUpdateElement.textContent = new Date().toLocaleTimeString('en-GB');
};

export {
  resetDashboard,
  toggleIntervalEditing,
  toggleLoaders,
  toggleStatusElements,
  toggleTelemetry,
  updateConnectionStatus,
  updateCountdown,
  updateDashboard,
  updateLastUpdate,
};
