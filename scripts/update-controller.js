// This module handles an immediate fetching of the data
import { requestImmediateUpdate } from './iss-controller.js';

const initializeUpdateController = () => {
  // Get DOM Elements
  const updateButtonElement = document.querySelector('#update-button');

  updateButtonElement.addEventListener('click', requestImmediateUpdate);
};

export { initializeUpdateController };
