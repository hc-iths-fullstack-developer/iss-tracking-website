import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);

let issMarker;

const updateISSMarker = (map, latitude, longitude) => {
  const coordinates = [longitude, latitude];

  if (!issMarker) {
    issMarker = new Marker({
      color: '#e63946',
    })
      .setLngLat(coordinates)
      .addTo(map);
  } else {
    issMarker.setLngLat(coordinates);
  }
};

const initializeISSMap = () => {
  const mapContainer = document.getElementById('iss-map');

  if (!mapContainer) {
    return;
  }

  const map = new MapLibreMap({
    container: mapContainer,
    style: 'https://demotiles.maplibre.org/globe.json',
    center: [0, 20],
    zoom: 1.5,
  });

  return map;
};

export { initializeISSMap, updateISSMarker };
