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

const updateISSPosition = async () => {
  const data = await getISSData();
  if (!data || !map) {
    return;
  }

  // Telemetry information
  altitudeElement.textContent = data.altitude.toFixed(2);
  velocityElement.textContent = data.velocity.toFixed(2);
  latitudeElement.textContent = data.latitude.toFixed(4);
  longitudeElement.textContent = data.longitude.toFixed(4);
  updateISSMarker(map, data.latitude, data.longitude);
};

updateISSPosition();

setInterval(() => {
  updateISSPosition();
}, 5000);
