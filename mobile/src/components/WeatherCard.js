import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocation } from '../context/LocationContext';

export const WeatherCard = () => {
  const { weather, loadingWeather, refreshWeather, currentLocation } = useLocation();

  const city = currentLocation?.city || 'Nellore';
  const temp = weather?.current_temp || '26°';
  const condition = weather?.condition || 'Partly Cloudy';
  const hourly = weather?.hourly || [];

  const getWeatherIcon = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('sun') || c.includes('clear')) return 'sunny';
    if (c.includes('rain') || c.includes('shower')) return 'rainy';
    if (c.includes('cloud')) return 'partly-sunny';
    if (c.includes('thunder')) return 'thunderstorm';
    return 'cloud-outline';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={getWeatherIcon(condition)} size={22} color={colors.accentAmber} style={{ marginRight: 8 }} />
          <Text style={styles.title}>Weather in {city}</Text>
        </View>

        <TouchableOpacity onPress={refreshWeather} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {loadingWeather ? (
            <ActivityIndicator size="small" color={colors.primaryLight} />
          ) : (
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mainInfo}>
        <Text style={styles.temperature}>{temp}</Text>
        <View style={styles.conditionBox}>
          <Text style={styles.conditionText}>{condition}</Text>
          <Text style={styles.advisoryText}>Great day for outdoor travel</Text>
        </View>
      </View>

      {/* Hourly Forecast */}
      {hourly.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hourlyList}
          contentContainerStyle={styles.hourlyContent}
        >
          {hourly.map((item, index) => (
            <View key={index} style={styles.hourlyItem}>
              <Text style={styles.hourlyTime}>{item.time}</Text>
              <Ionicons
                name={getWeatherIcon(item.condition)}
                size={18}
                color={colors.accentAmber}
                style={{ marginVertical: 4 }}
              />
              <Text style={styles.hourlyTemp}>{item.temp}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    marginRight: 14,
    letterSpacing: -1,
  },
  conditionBox: {
    flex: 1,
  },
  conditionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textLight,
  },
  advisoryText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  hourlyList: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 12,
  },
  hourlyContent: {
    gap: 12,
    paddingRight: 6,
  },
  hourlyItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 54,
  },
  hourlyTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  hourlyTemp: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
