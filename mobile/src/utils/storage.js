import { Platform } from 'react-native';

// In-memory fallback map for environments where AsyncStorage or localStorage is unavailable
const memoryStorage = new Map();

export const storage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage.get(key) || null;
    } catch (e) {
      return memoryStorage.get(key) || null;
    }
  },

  async setItem(key, value) {
    try {
      const valStr = typeof value === 'string' ? value : JSON.stringify(value);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, valStr);
      }
      memoryStorage.set(key, valStr);
    } catch (e) {
      memoryStorage.set(key, String(value));
    }
  },

  async removeItem(key) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      memoryStorage.delete(key);
    } catch (e) {
      memoryStorage.delete(key);
    }
  },

  async clear() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
      memoryStorage.clear();
    } catch (e) {
      memoryStorage.clear();
    }
  }
};
