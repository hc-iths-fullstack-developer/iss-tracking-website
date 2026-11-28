// This module is responsible for managing local storage.
export const getStorageItem = (key, defaultValue = null) => {
  const storedValue = localStorage.getItem(key);

  return storedValue !== null ? storedValue : defaultValue;
};

export const setStorageItem = (key, value) => {
  localStorage.setItem(key, value);
};
