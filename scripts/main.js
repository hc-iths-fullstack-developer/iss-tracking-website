import { initializeISSMap } from './map-controller.js';
import { initializeISSController, updateISSInterval } from './iss-controller';
import { initializeIntervalController } from './interval-controller.js';

// Initialize the map
const map = initializeISSMap();

// Add missing attrs to links in the attribution element of map libre
// After map initialization
const attributionElement = document.querySelector('.maplibregl-ctrl-attrib');
const observer = new MutationObserver(() => {
  attributionElement.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
});

observer.observe(attributionElement, {
  childList: true,
  subtree: true,
});

// Initialize ISS controller
initializeISSController(map);

// Initialize interval controller
initializeIntervalController(updateISSInterval);
