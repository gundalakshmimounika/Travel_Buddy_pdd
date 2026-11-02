import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../api/endpoints';

const AuthContext = createContext({});

const USER_STORAGE_KEY = 'TRAVEL_BUDDY_USER_SESSION';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const stored = await storage.getItem(USER_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res && res.status === 'success') {
      const userData = {
        email: email.trim(),
        name: res.name || res.full_name || email.split('@')[0],
        token: res.token || 'user-token',
        isGuest: false,
      };
      setUser(userData);
      await storage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res?.message || 'Invalid credentials' };
  };

  const signup = async (fullName, email, password) => {
    const res = await authApi.register(fullName, email, password);
    if (res && (res.status === 'success' || res.message?.toLowerCase().includes('success'))) {
      const userData = {
        email: email.trim(),
        name: fullName.trim(),
        token: 'new-user-token',
        isGuest: false,
      };
      setUser(userData);
      await storage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: res?.message || 'Registration failed' };
  };

  const continueAsGuest = async () => {
    const guestUser = {
      email: 'guest@travelbuddy.local',
      name: 'Guest Traveler',
      isGuest: true,
      token: 'guest-session',
    };
    setUser(guestUser);
    await storage.setItem(USER_STORAGE_KEY, JSON.stringify(guestUser));
    return guestUser;
  };

  const logout = async () => {
    setUser(null);
    await storage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isGuest: !!user?.isGuest,
        login,
        signup,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
