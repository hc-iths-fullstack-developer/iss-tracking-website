import {
  initializeISSMap,
} from './iss-map.js';
import { initializeISSController, updateISSInterval } from './iss-controller';

// Initialize the map
const map = initializeISSMap();

initializeISSController(map);

// Interval Button
let fieldVisibility = false;
const setIntervalButton = document.querySelector('#set-interval-button');
const setIntervalFieldElement = document.querySelector('#set-interval-field');

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

setIntervalButton.addEventListener('click', () => {
  if (!fieldVisibility) {
    fieldVisibility = true;
    // Show field, hide data element
    setIntervalFieldElement.style.setProperty('display', 'block');
    //nextUpdateElement.style.setProperty('display', 'none');
    setIntervalFieldElement.focus();
  } else {
    if (!applyInterval()) return;
    // Hide field, show data element
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    //nextUpdateElement.style.setProperty('display', 'block');
  }
});

// Interval Input Field
setIntervalFieldElement.addEventListener('input', () => {
  setIntervalFieldElement.value = setIntervalFieldElement.value.replace(
    /[^0-9]/g,
    '',
  );
});

// Apply Interval on Enter
setIntervalFieldElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    if (!applyInterval()) return;
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    //nextUpdateElement.style.setProperty('display', 'block');
  }
});

setIntervalFieldElement.addEventListener('change', () => {
  const seconds = Number(setIntervalFieldElement.value);
  if (seconds >= 1 && seconds <= 60) {
    updateISSInterval(seconds);
    // Hide field, show data element
    fieldVisibility = false;
    setIntervalFieldElement.style.setProperty('display', 'none');
    //nextUpdateElement.style.setProperty('display', 'block');
  } else {
    setIntervalFieldElement.setCustomValidity(
      'Please enter a value between 1 and 60 seconds.',
    );
    setIntervalFieldElement.reportValidity();
  }
});
