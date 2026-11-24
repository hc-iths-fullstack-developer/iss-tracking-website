import { initializeISSMap } from './iss-map.js';
import { initializeISSController, updateISSInterval } from './iss-controller';
import { initializeIntervalController } from './interval-controller.js';

// Initialize the map
const map = initializeISSMap();

// Initialize ISS controller
initializeISSController(map);

// Initialize interval controller
initializeIntervalController(updateISSInterval);
