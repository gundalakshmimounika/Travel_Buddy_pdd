import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const STORAGE_KEY_BASE_URL = 'TRAVEL_BUDDY_API_BASE_URL';

/**
 * Default URL determination:
 * - Android native / emulator: 10.0.2.2 points to host machine's Apache localhost
 * - Web browser: localhost
 * - iOS simulator: localhost
 */
export const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2/TravelBuddy/backend/';
  }
  return 'http://localhost/TravelBuddy/backend/';
};

let currentBaseUrl = getDefaultBaseUrl();

export const initApiClient = async () => {
  try {
    const saved = await storage.getItem(STORAGE_KEY_BASE_URL);
    if (saved) {
      currentBaseUrl = saved.endsWith('/') ? saved : `${saved}/`;
    }
  } catch (e) {
    // fallback
  }
  return currentBaseUrl;
};

export const getBaseUrl = () => currentBaseUrl;

export const setBaseUrl = async (url) => {
  const formatted = url.endsWith('/') ? url : `${url}/`;
  currentBaseUrl = formatted;
  await storage.setItem(STORAGE_KEY_BASE_URL, formatted);
  return formatted;
};

/**
 * Unified API Request wrapper with timeout, form-data / JSON handling, and clean error messages
 */
export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

  const method = options.method || 'GET';
  const headers = { ...options.headers };

  let body = options.body;

  // Handle URLSearchParams or FormData for PHP POST endpoints
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    if (options.asJson) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    } else {
      // Standard PHP form urlencoded
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      const formBody = [];
      for (const property in body) {
        if (body.hasOwnProperty(property)) {
          const encodedKey = encodeURIComponent(property);
          const encodedValue = encodeURIComponent(body[property] ?? '');
          formBody.push(`${encodedKey}=${encodedValue}`);
        }
      }
      body = formBody.join('&');
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 12000);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      return {
        status: response.ok ? 'success' : 'error',
        data: text,
        raw: text,
      };
    }
    return json;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[TravelBuddy API Error] ${method} ${url}:`, error.message);
    return {
      status: 'error',
      message: error.name === 'AbortError' ? 'Connection timed out' : error.message,
    };
  }
};
