  Marker,
  setWorkerUrl,
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

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
    container: mapContainer,
    style: 'https://demotiles.maplibre.org/globe.json',
    center: [0, 20],
    zoom: 1.5,
  });

  return map;
};

export { initializeISSMap, updateISSMarker };
