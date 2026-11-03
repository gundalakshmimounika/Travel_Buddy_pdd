import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocation } from '../context/LocationContext';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Weather Advisory: Clear Skies',
    body: 'Optimal travel conditions predicted across Andhra Pradesh & coastal corridors for the next 48 hours.',
    type: 'weather',
    time: '20 mins ago',
  },
  {
    id: '2',
    title: 'Special Express Trains Scheduled',
    body: 'South Central Railway has announced festive special express services connecting Nellore, Tirupati, and Chennai.',
    type: 'train',
    time: '2 hours ago',
  },
  {
    id: '3',
    title: 'Safety Check: Beach Safety Alert',
    body: 'High tide alert issued for coastal beaches in Pondicherry and Mahabalipuram between 4 PM and 7 PM.',
    type: 'alert',
    time: 'Yesterday',
  },
];

export const AlertsScreen = ({ navigation }) => {
  const { currentLocation } = useLocation();
  const city = currentLocation?.city || 'Nellore';

  const getAlertIcon = (type) => {
    switch (type) {
      case 'weather':
        return { name: 'sunny-outline', color: colors.accentAmber };
      case 'train':
        return { name: 'train-outline', color: colors.primaryLight };
      default:
        return { name: 'warning-outline', color: colors.accentRose };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation?.canGoBack() ? navigation.goBack() : navigation?.navigate('Home'))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Travel Alerts</Text>
          <Text style={styles.locationSubtitle}>Active in {city}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((item) => {
          const icon = getAlertIcon(item.type);
          return (
            <View key={item.id} style={styles.alertCard}>
              <View style={[styles.iconWrapper, { backgroundColor: `${icon.color}15` }]}>
                <Ionicons name={icon.name} size={22} color={icon.color} />
              </View>

              <View style={styles.alertBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <Text style={styles.alertDesc}>{item.body}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  locationSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  alertDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
