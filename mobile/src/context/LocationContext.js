import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { weatherApi } from '../api/endpoints';

const LocationContext = createContext({});

const LOCATION_STORAGE_KEY = 'TRAVEL_BUDDY_USER_SAVED_LOCATION';

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState({
    city: 'Detecting Location...',
    country: 'India',
    lat: null,
    lng: null,
  });
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (currentLocation?.city && !currentLocation.city.includes('Detecting')) {
      fetchWeather(currentLocation.city);
    }
  }, [currentLocation?.city]);

  const fetchLocationByIp = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude) {
          const loc = {
            city: data.city || 'Nellore',
            state: data.region || 'Andhra Pradesh',
            country: data.country_name || 'India',
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            isUserChosen: false,
          };
          setCurrentLocation(loc);
          return;
        }
      }
    } catch (e) {}

    // Fallback default to Nellore coordinates
    setCurrentLocation({
      city: 'Nellore',
      state: 'Andhra Pradesh',
      country: 'India',
      lat: 14.4426,
      lng: 79.9865,
      isUserChosen: false,
    });
  };

  const loadLocation = async () => {
    try {
      const stored = await storage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.city && parsed.isUserChosen) {
          setCurrentLocation(parsed);
          return;
        }
      }
      await fetchLocationByIp();
    } catch (e) {
      await fetchLocationByIp();
    }
  };

  const saveLocation = async (loc) => {
    const updated = {
      ...loc,
      isUserChosen: true,
    };
    setCurrentLocation(updated);
    await storage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const setCity = (cityName) => {
    if (!cityName) return;
    saveLocation({
      city: cityName,
      country: 'India',
      lat: null,
      lng: null,
      isUserChosen: true,
    });
  };

  const fetchWeather = async (city) => {
    setLoadingWeather(true);
    try {
      const res = await weatherApi.getWeather(city);
      if (res && res.current_temp) {
        setWeather(res);
      } else {
        setWeather({
          current_temp: '27°',
          condition: 'Partly Cloudy',
          hourly: [
            { time: '10 AM', temp: '26°', condition: 'Partly Cloudy' },
            { time: '12 PM', temp: '29°', condition: 'Sunny' },
            { time: '02 PM', temp: '31°', condition: 'Sunny' },
            { time: '04 PM', temp: '29°', condition: 'Partly Cloudy' },
            { time: '06 PM', temp: '27°', condition: 'Clear' },
          ],
        });
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        weather,
        loadingWeather,
        pickerVisible,
        setPickerVisible,
        setCity,
        saveLocation,
        refreshWeather: () => fetchWeather(currentLocation.city),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
