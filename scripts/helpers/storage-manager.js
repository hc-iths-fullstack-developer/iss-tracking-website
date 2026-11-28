// This module is responsible for managing local storage.
const getStorageItem = (key, defaultValue = null) => {
  const storedValue = localStorage.getItem(key);
  return storedValue !== null ? storedValue : defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, value);
};

export { getStorageItem, setStorageItem };
