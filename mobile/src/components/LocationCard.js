import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocation } from '../context/LocationContext';

export const LocationCard = () => {
  const { currentLocation, setPickerVisible, setCity } = useLocation();

  const city = currentLocation?.city || 'Nellore';
  const region = currentLocation?.state
    ? `${currentLocation.state}, India`
    : `${currentLocation?.country || 'India'}`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.liveBadge}>
          <View style={styles.pulsingDot} />
          <Text style={styles.liveText}>Live Location</Text>
        </View>
        <Text style={styles.coordsText}>
          {currentLocation?.lat ? `${currentLocation.lat.toFixed(2)}° N, ${currentLocation.lng.toFixed(2)}° E` : '14.44° N, 79.98° E'}
        </Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.infoCol}>
          <Text style={styles.cityName}>{city}</Text>
          <View style={styles.regionRow}>
            <Ionicons name="location-sharp" size={14} color={colors.primaryLight} style={{ marginRight: 4 }} />
            <Text style={styles.regionText}>{region}</Text>
          </View>
        </View>

        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setPickerVisible(true)}
          >
            <Ionicons name="map-outline" size={14} color={colors.white} style={{ marginRight: 4 }} />
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => setCity('Nellore')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentEmerald,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentEmerald,
    letterSpacing: 0.3,
  },
  coordsText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  cityName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  resetBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
