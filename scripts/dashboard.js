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
const connectionIndicatorElement = document.querySelector(
  '#connection-indicator',
);
const loadingElements = document.querySelectorAll('.dot-loader');

// Reset dashboard data to placeholders
const resetDashboard = () => {
  altitudeElement.textContent = '--';
  velocityElement.textContent = '--';
  latitudeElement.textContent = '--';
  longitudeElement.textContent = '--';
  lastUpdateElement.textContent = '--';
  nextUpdateElement.textContent = '--';
};

// Show or hide loaders
const toggleLoaders = (visible) => {
  loadingElements.forEach((element) => {
    element.classList.toggle('hidden', !visible);
  });
};

// Show or hide status elements
const toggleStatusElements = (visible) => {
  const elements = [lastUpdateElement, nextUpdateElement];

  elements.forEach((element) => {
    element.classList.toggle('hidden', !visible);
  });
};

// Show or hide telemetry elements
const toggleTelemetry = (visible) => {
  const elements = [
    altitudeElement,
    velocityElement,
    latitudeElement,
    longitudeElement,
  ];

  elements.forEach((element) => {
    element.classList.toggle('hidden', !visible);
  });
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
  toggleLoaders,
  toggleStatusElements,
  toggleTelemetry,
  updateConnectionStatus,
  updateCountdown,
  updateDashboard,
  updateLastUpdate,
};
