import { getISSData } from './iss-api.js';
import { initializeISSMap, updateISSMarker } from './iss-map.js';
import { subsolarPoint } from './globe/sun.js';
import { addProtocol } from 'maplibre-gl';
import { daylightProtocol } from './globe/protocols.js';

addProtocol('daylight', daylightProtocol);
import {
  initializeISSMap,
  updateISSMarker
} from './iss-map.js';

const map = initializeISSMap();

const updateISSPosition = async () => {
  const data = await getISSData();

  if (!data || !map) {
    return;
  }

  updateISSMarker(map, data.latitude, data.longitude);

  map.flyTo({
    center: [data.longitude, data.latitude],
    zoom: 1,
  });
};

updateISSPosition();
