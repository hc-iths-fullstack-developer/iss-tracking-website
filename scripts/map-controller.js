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
import 'maplibre-theme/icons.default.css';
import 'maplibre-theme/modern.css';
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

  // 6. Automatic globe rotation

  // Rotation settings
  const ROTATION_DELAY = 3000;
  const ROTATION_DURATION = 2000;

  // Check whether the user prefers reduced motion
  const shouldSpin = !window.matchMedia('(prefers-reduced-motion: reduce)')
    .matches;

  // Track active user interactions
  const activeInteractions = new Set();

  // Track the rotation timeout
  let rotationTimeoutId = null;

  // Rotate the globe
  const spinGlobe = () => {
    // Do not spin if:
    // 1. rotation is disabled (because of accessibility reasons),
    // 2. the user is interacting with the map (interactions present in set)
    // 3. rotation timeout is still present (listener is not cleared)
    // 4. or the map is very zoomed in (3.5)
    if (
      !shouldSpin ||
      activeInteractions.size > 0 ||
      rotationTimeoutId !== null ||
      map.getZoom() > 3.5
    ) {
      return;
    }

    const center = map.getCenter();

    // Animated transition between old and new values
    // 6 degrees of longitude
    // https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#easeto
    map.easeTo({
      center: [center.lng + 6, center.lat],
      duration: ROTATION_DURATION,
      easing: (t) => t,
    });
  };

  // Pause automatic rotation during user interaction
  const pauseGlobe = (interaction) => {
    activeInteractions.add(interaction);
    clearTimeout(rotationTimeoutId);
    rotationTimeoutId = null;
  };

  // Resume automatic rotation after user interaction
  const resumeGlobe = (interaction) => {
    activeInteractions.delete(interaction);
    // Wait until all interactions have ended
    if (activeInteractions.size > 0) {
      return;
    }

    clearTimeout(rotationTimeoutId);
    rotationTimeoutId = setTimeout(() => {
      rotationTimeoutId = null;
      spinGlobe();
    }, ROTATION_DELAY);
  };

  // Mouse dragging
  map.on('dragstart', () => pauseGlobe('drag'));
  map.on('dragend', () => resumeGlobe('drag'));

  // Zooming (including mouse wheel)
  map.on('zoomstart', () => pauseGlobe('zoom'));
  map.on('zoomend', () => resumeGlobe('zoom'));

  // Continue automatic rotation after each animation
  map.on('moveend', () => {
    if (activeInteractions.size === 0 && rotationTimeoutId === null) {
      spinGlobe();
    }
  });

  // Start rotation once the map has loaded
  map.once('load', spinGlobe);

  return map;
};

export { initializeISSMap, removeISSMarker, updateISSMarker };
