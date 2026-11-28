// This module handles an immediate fetching of the data
import { requestImmediateUpdate } from './iss-controller.js';

// Get DOM Elements
const updateButtonElement = document.querySelector('#update-button');

// Toggle the update button
const toggleUpdateButton = (enabled) => {
  updateButtonElement.disabled = !enabled;
};

// Initialize update controller
const initializeUpdateController = () => {
  updateButtonElement.addEventListener('click', requestImmediateUpdate);
  toggleUpdateButton(false);
};

export { initializeUpdateController, toggleUpdateButton };
