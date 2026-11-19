import {
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  addProtocol,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { daylightProtocol } from './globe/protocols.js';
import { globeStyle } from './globe/globe-style.js';

//Registration
addProtocol('daylight', daylightProtocol);
setWorkerUrl(workerUrl);

// Create a Custom Marker
let issMarker;

const updateISSMarker = (map, latitude, longitude) => {
  const coordinates = [longitude, latitude];
  const markerElement = document.createElement('div');

  markerElement.className = 'iss-marker';

  if (!issMarker) {
    issMarker = new Marker({
      element: markerElement,
    })
      .setLngLat(coordinates)
      .addTo(map);
  } else {
    issMarker.setLngLat(coordinates);
  }
};

// Create and Initialize the Map
const initializeISSMap = () => {
  const mapContainer = document.getElementById('iss-map');

  if (!mapContainer) {
    return;
  }

  const map = new MapLibreMap({
    attributionControl: false,
    center: [0, 20],
    container: mapContainer,
    style: globeStyle(new Date(), [0, 20]),
    zoom: 2,
  });

  const spinGlobe = () => {
    const center = map.getCenter();

    center.lng -= 2;

    map.easeTo({
      center,
      duration: 1000,
      easing: (t) => t,
    });
  };

  // Start spinning when the map has loaded
  map.once('load', spinGlobe);

  // Continue spinning after each movement
  map.on('moveend', spinGlobe);

  return map;
};

export { initializeISSMap, updateISSMarker };
