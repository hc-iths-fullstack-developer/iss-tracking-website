// This module handles interval controls on the dashboard
// It shows/hides the interval field
// It updates the interval in seconds that refreshes the API
import { toggleIntervalEditing } from './dashboard.js';

const initializeIntervalController = (updateISSInterval, getISSInterval) => {
  // Get DOM Elements
  const setIntervalButton = document.querySelector('#set-interval-button');
  const setIntervalFieldElement = document.querySelector('#set-interval-field');

  // Input interval field visibility toggle
  let fieldVisibility = false;

  // Validate and apply selected interval
  const applyValidatedInterval = () => {
    // Get seconds value from the field
    const seconds = Number(setIntervalFieldElement.value);
    // If field is invalid:
    // Validate the interval to make sure it is between 5 and 60s
    // This is for immediate field validation feedback if the user
    // enters anything beyond this range
    if (!Number.isInteger(seconds) || seconds < 5 || seconds > 60) {
      setIntervalFieldElement.setCustomValidity(
        'Please enter a whole number between 5 and 60 seconds.',
      );
      setIntervalFieldElement.reportValidity();
      return false;
    }
    // If field is valid:
    // Clear validation from previous value
    setIntervalFieldElement.setCustomValidity('');
    // Update the interval to the new value
    updateISSInterval(seconds);
    return true;
  };

  // Open interval field
  const openIntervalField = () => {
    fieldVisibility = true;
    // Set value of field with interval from local storage
    setIntervalFieldElement.value = getISSInterval();
    setIntervalFieldElement.focus();
    toggleIntervalEditing(true);
  };

  // Close interval field
  const closeIntervalField = () => {
    fieldVisibility = false;
    toggleIntervalEditing(false);
  };

  // Show / Hide interval field
  const toggleIntervalField = () => {
    if (!fieldVisibility) {
      openIntervalField();
    } else {
      // If validation fails, stop here and prevent closing of the field on Click
      if (!applyValidatedInterval()) return;
      // Otherwise, close the interval field.
      closeIntervalField();
    }
  };

  // Interval button toggle
  setIntervalButton.addEventListener('click', toggleIntervalField);

  // Input validation for the interval field
  // Allow only numbers since we cannot disable typing of letters in the HTML element
  // via browser validation
  setIntervalFieldElement.addEventListener('input', () => {
    setIntervalFieldElement.value = setIntervalFieldElement.value.replace(
      /[^0-9]/g,
      '',
    );
    // Clear old validation if there is one
    // as we also validate in applyValidatedInterval
    setIntervalFieldElement.setCustomValidity('');
  });

  // Apply interval on Enter
  setIntervalFieldElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      // Stops the browser from executing the default action of the event
      event.preventDefault();
      // If validation fails, stop here and prevent closing of the field on Enter
      if (!applyValidatedInterval()) return;
      // Otherwise, close the interval field.
      closeIntervalField();
    }
  });
};

export { initializeIntervalController };
