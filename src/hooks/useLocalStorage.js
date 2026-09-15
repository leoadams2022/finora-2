// src/hooks/useLocalStorage.js

import { useState, useEffect } from "react";

/**
 * Custom hook to sync React state with localStorage.
 *
 * @param {string} key - localStorage key name
 * @param {any} initialValue - Fallback initial value if key does not exist
 */
export const useLocalStorage = (key, initialValue) => {
  // Read initial value from localStorage or fallback
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync with localStorage on change
  useEffect(() => {
    try {
      if (
        storedValue === undefined ||
        storedValue === null ||
        storedValue === ""
      ) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
