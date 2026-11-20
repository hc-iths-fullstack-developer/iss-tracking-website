import { getISSData } from './iss-api.js';
import { initializeISSMap, updateISSMarker } from './iss-map.js';
import { addProtocol } from 'maplibre-gl';
import { daylightProtocol } from './globe/protocols.js';

addProtocol('daylight', daylightProtocol);

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
let nextUpdateTime = Date.now() + updateInterval;

// 5. Fetch and display the ISS data
const updateISSPosition = async () => {
  const data = await getISSData();

  // On failure:
  if (!data || !map) {
    // Set negative connection status
    apiConnectionElement.textContent = 'Disconnected';

    // Reset countdown (5s) if the API request fails for whatever reason
    // Try to fetch the API again recursively (in 5s)
    nextUpdateTime = Date.now() + updateInterval;
    setTimeout(updateISSPosition, updateInterval);
    return;
  }

  // On success:
  // Set positive connection status and last update to a readable format
  apiConnectionElement.textContent = 'Connected';
  lastUpdateElement.textContent = new Date().toLocaleTimeString('en-GB');

  // Set Telemetry information to a readable format
  altitudeElement.textContent = data.altitude.toFixed(2);
  velocityElement.textContent = data.velocity.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  latitudeElement.textContent = data.latitude.toFixed(4);
  longitudeElement.textContent = data.longitude.toFixed(4);

  // Update the ISS marker on the map with the API current coordinates
  updateISSMarker(map, data.latitude, data.longitude);

  // Reset countdown for to next update deadline (5s)
  // Call the API again recursively
  nextUpdateTime = Date.now() + updateInterval;
  setTimeout(updateISSPosition, updateInterval);
};

// 6. Countdown display in a readable format
setInterval(() => {

  // Get remaining seconds until the next reset
  // (Countdown deadline in the future - current time)
  // (in ms so divide by 1000 to get s)
  const remainingTime = Math.ceil(
    (nextUpdateTime - Date.now()) / 1000
  );

  nextUpdateElement.textContent = `${Math.max(0, remainingTime)}s`;
}, 1000);

// Initial API request
updateISSPosition();
