import React, { createContext, useState, useEffect, useContext } from 'react';
import { tripsApi } from '../api/endpoints';
import { useAuth } from './AuthContext';

const TripContext = createContext({});

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    if (user?.email) {
      loadTrips();
    } else {
      setTrips([]);
    }
  }, [user?.email]);

  const loadTrips = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await tripsApi.getTrips(user.email);
      if (res && res.status === 'success' && Array.isArray(res.trips)) {
        setTrips(res.trips);
        if (res.trips.length > 0 && !activeTrip) {
          setActiveTrip(res.trips[0]);
        }
      }
    } catch (e) {
      console.warn('Trips load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const addTrip = async (destination, imageRes = 1) => {
    if (!user?.email) return { success: false, message: 'Please sign in first' };
    const res = await tripsApi.addTrip(user.email, destination, imageRes);
    if (res && res.status === 'success') {
      await loadTrips();
      return { success: true };
    }
    return { success: false, message: res?.message || 'Failed to add trip' };
  };

  const deleteTrip = async (destination) => {
    if (!user?.email) return { success: false };
    const res = await tripsApi.deleteTrip(user.email, destination);
    if (res && res.status === 'success') {
      setTrips((prev) => prev.filter((t) => t.destination !== destination));
      if (activeTrip?.destination === destination) {
        setActiveTrip(null);
      }
      return { success: true };
    }
    return { success: false, message: res?.message || 'Failed to delete' };
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        loading,
        activeTrip,
        setActiveTrip,
        loadTrips,
        addTrip,
        deleteTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => useContext(TripContext);
