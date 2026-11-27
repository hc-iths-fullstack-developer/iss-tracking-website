// This module handles interval controls on the dashboard
// It shows/hides the interval field
// It updates the interval that refreshes the API

import { toggleIntervalEditing } from './dashboard.js';

const initializeIntervalController = (updateISSInterval) => {
  // Get DOM Elements
  const setIntervalButton = document.querySelector('#set-interval-button');
  const setIntervalFieldElement = document.querySelector('#set-interval-field');

  // Shared variables
  let fieldVisibility = false;

  // Apply selected interval
  const applyInterval = () => {
    const seconds = Number(setIntervalFieldElement.value);

    if (!Number.isInteger(seconds) || seconds < 1 || seconds > 60) {
      setIntervalFieldElement.setCustomValidity(
        'Please enter a whole number between 1 and 60 seconds.',
      );
      setIntervalFieldElement.reportValidity();
      return false;
    }

    setIntervalFieldElement.setCustomValidity('');
    updateISSInterval(seconds);
    return true;
  };

  // Open interval field
  const openIntervalField = () => {
    fieldVisibility = true;
    toggleIntervalEditing(true);
    setIntervalFieldElement.focus();
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
      if (!applyInterval()) return;
      closeIntervalField();
    }
  };

  // Interval button toggle
  setIntervalButton.addEventListener('click', toggleIntervalField);

  // Input validation for the interval field
  // Allow only numbers 0-9 since we cannot disable typing of letters in the HTML element
  setIntervalFieldElement.addEventListener('input', () => {
    setIntervalFieldElement.value = setIntervalFieldElement.value.replace(
      /[^0-9]/g,
      '',
    );
    setIntervalFieldElement.setCustomValidity('');
  });

  // Apply interval on Enter
  setIntervalFieldElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (!applyInterval()) return;

      closeIntervalField();
    }
  });
};

export { initializeIntervalController };
