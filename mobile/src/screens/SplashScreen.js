import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const SplashScreen = ({ navigation }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Onboarding');
        }
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Ionicons name="airplane" size={44} color={colors.white} />
      </View>
      <Text style={styles.appName}>TravelBuddy</Text>
      <Text style={styles.tagline}>Plan smarter. Travel easier.</Text>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primaryLight} style={{ marginBottom: 12 }} />
        <Text style={styles.versionText}>React Native Android Client • v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
