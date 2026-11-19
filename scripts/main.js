import { getISSData } from './iss-api.js';
import { initializeISSMap, updateISSMarker } from './iss-map.js';
import { addProtocol } from 'maplibre-gl';
import { daylightProtocol } from './globe/protocols.js';

addProtocol('daylight', daylightProtocol);

const map = initializeISSMap();

// Telemetry elements
const altitudeElement = document.getElementById('iss-altitude');
const velocityElement = document.getElementById('iss-velocity');
const latitudeElement = document.getElementById('iss-latitude');
const longitudeElement = document.getElementById('iss-longitude');

// Status elements
const apiConnectionElement = document.getElementById('api-connection');
const lastUpdateElement = document.getElementById('last-update');
const nextUpdateElement = document.getElementById('next-update');

const updateISSPosition = async () => {
  const data = await getISSData();

  // If no data or map loaded write Disconnect message
  if (!data || !map) {
    apiConnectionElement.textContent = 'Disconnected';
    return;
  }

  // If data exists add Connected message and set Last Updated to current time
  if (data) {
    apiConnectionElement.textContent = 'Connected';
    const updateTime = new Date();
    lastUpdateElement.textContent = updateTime.toLocaleTimeString('en-GB');
  }

  // Convert data to readable formats in elements
  altitudeElement.textContent = data.altitude.toFixed(2);
  velocityElement.textContent = data.velocity.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  latitudeElement.textContent = data.latitude.toFixed(4);
  longitudeElement.textContent = data.longitude.toFixed(4);

  // Update marker location with new data from API
  updateISSMarker(map, data.latitude, data.longitude);
};

updateISSPosition();

// Refresh the API every 5 secs
setInterval(() => {
  updateISSPosition();
}, 5000);
