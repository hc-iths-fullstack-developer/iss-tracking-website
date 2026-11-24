// This module handles interval controls on the dashboard

const initializeIntervalController = (updateISSInterval) => {
  // Get DOM Elements
  const setIntervalButton = document.querySelector('#set-interval-button');
  const setIntervalFieldElement = document.querySelector('#set-interval-field');
  const nextUpdateElement = document.querySelector('#next-update');

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

  // Show / Hide interval field
  const toggleIntervalField = () => {
    if (!fieldVisibility) {
      fieldVisibility = true;
      setIntervalFieldElement.style.setProperty('display', 'block');
      nextUpdateElement.style.setProperty('display', 'none');
      setIntervalFieldElement.focus();
    } else {
      if (!applyInterval()) return;
      fieldVisibility = false;
      setIntervalFieldElement.style.setProperty('display', 'none');
      nextUpdateElement.style.setProperty('display', 'block');
    }
  };

  // Interval button
  setIntervalButton.addEventListener('click', toggleIntervalField);
  // Input validation
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
      fieldVisibility = false;
      setIntervalFieldElement.style.setProperty('display', 'none');
      nextUpdateElement.style.setProperty('display', 'block');
    }
  });
};

export { initializeIntervalController };
