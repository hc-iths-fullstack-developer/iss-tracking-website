// This module manages the control modules centrally
// It initializes and connects other modules together
import { initializeISSMap } from './map-controller.js';
import {
  initializeISSController,
  updateISSInterval,
  getISSInterval,
} from './iss-controller.js';
import { initializeIntervalController } from './interval-controller.js';
import { initializeUpdateController } from './update-controller.js';

// Initialize a map instance
const map = initializeISSMap();

// Add missing attrs to links in the attribution element of map libre
// After the map has been initialized
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
initializeIntervalController(updateISSInterval, getISSInterval);

// Initialize update controller
initializeUpdateController();
