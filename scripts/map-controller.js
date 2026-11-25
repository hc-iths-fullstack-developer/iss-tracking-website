// This module is responsible for coordinating map functionality, initialization,
// markers, trajectory and map interactions.

// https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/
// https://maplibre.org/maplibre-gl-js/docs/
// Renamed the import to avoid confusion with JavaScript's built-in Map
import {
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  addProtocol,
} from 'maplibre-gl';
// CSS: provides the styling for map controls, markers and other map elements.
import "maplibre-theme/icons.default.css";
import "maplibre-theme/modern.css";
// workerUrl: lets Vite bundle the worker correctly.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
// https://makewithmaplibre.com/globe/
import { daylightProtocol } from './map/protocols.js';
import { mapStyle } from './map/style.js';

// 1. Registration of necessary functions from the MapLibre Library
// https://maplibre.org/maplibre-gl-js/docs/API/functions/addProtocol/
addProtocol('daylight', daylightProtocol);
// setWorkerUrl: configures the background worker required by MapLibre 6 when using Vite.
// Described in installation section https://maplibre.org/maplibre-gl-js/docs/#__tabbed_1_1
setWorkerUrl(workerUrl);

// 2. Initialize a Custom Map Marker
let issMarker = null;

// 3. Position of the ISS icon on the map
const updateISSMarker = (map, latitude, longitude) => {
  // Set coordinates into a MapLibre format
  const coordinates = [longitude, latitude];

  if (!issMarker) {
    // Create a container DOM element for the marker
    // Set the class that contains a custom ISS icon
    const markerElement = document.createElement('div');
    markerElement.className = 'map-marker icon-iss';

    issMarker = new Marker({
      element: markerElement,
    })
      .setLngLat(coordinates)
      .addTo(map);
  } else {
    issMarker.setLngLat(coordinates);
  }
};

// 4. Remove the ISS marker from the map
const removeISSMarker = () => {
  if (issMarker) {
    issMarker.remove();
    issMarker = null;
  }
};

// 5. Create the map
const initializeISSMap = () => {
  // Get the container DOM element for the map
  const mapContainer = document.getElementById('iss-map');

  // On failure:
  // If no element exists exit the function
  if (!mapContainer) {
    return;
  }

  // Create a new map with these settings:
  // attributionControl: Show attribution for sources
  // center: Set the map's geographical location facing the viewer to 0 = longitude (the Prime Meridian) and 20 = latitude (20 degrees north).
  // container: Provide the DOM element container for the map
  // style: Give the mapStyle function the initial geographical coordinates
  // zoom: Set the size of the globe on the page
  const map = new MapLibreMap({
    attributionControl: true,
    center: [0, 20],
    container: mapContainer,
    style: mapStyle(new Date(), [0, 20]),
    zoom: 2,
  });

  // Spin the globe:
  // https://makewithmaplibre.com/globe/
  // Check whether the user prefers reduced motion
  let shouldSpin = !window.matchMedia('(prefers-reduced-motion: reduce)')
    .matches;

  const spinGlobe = () => {
    // Do not spin if automatic rotation is disabled
    // or if the user has zoomed in
    if (!shouldSpin || map.getZoom() > 3.5) {
      return;
    }

    const center = map.getCenter();

    // Animated transition between old and new values
    // https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#easeto
    map.easeTo({
      center: [center.lng + 6, center.lat],
      duration: 2000,
      easing: (t) => t,
    });
  };

  // Adds a listener to start spinning once the map has loaded
  // https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#once
  map.once('load', spinGlobe);

  // Adds a listener to continue spinning after each movement
  // https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#on
  map.on('moveend', spinGlobe);

  map.dragPan.enable();
  map.dragRotate.disable();

  return map;
};

export { initializeISSMap, removeISSMarker, updateISSMarker };
