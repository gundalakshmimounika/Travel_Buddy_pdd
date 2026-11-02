import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocation } from '../context/LocationContext';
import { useTrips } from '../context/TripContext';

const SEARCHABLE_DESTINATIONS = [
  { name: 'Pondicherry', state: 'Puducherry', type: 'Coastal & Heritage', days: '3 Days' },
  { name: 'Mahabalipuram', state: 'Tamil Nadu', type: 'UNESCO Heritage & Beach', days: '2 Days' },
  { name: 'Ooty', state: 'Tamil Nadu', type: 'Hill Station & Tea Gardens', days: '4 Days' },
  { name: 'Tirupati', state: 'Andhra Pradesh', type: 'Spiritual Temple Hub', days: '2 Days' },
  { name: 'Araku Valley', state: 'Andhra Pradesh', type: 'Scenic Waterfalls & Caves', days: '3 Days' },
  { name: 'Goa', state: 'Goa', type: 'Beaches & Water Sports', days: '5 Days' },
  { name: 'Munnar', state: 'Kerala', type: 'Misty Tea Hills', days: '4 Days' },
];

export const TripPlannerScreen = ({ navigation }) => {
  const { currentLocation } = useLocation();
  const originCity = currentLocation?.city || 'Nellore';
  const { addTrip } = useTrips();

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SEARCHABLE_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickAdd = async (destName) => {
    const res = await addTrip(destName);
    if (res.success) {
      Alert.alert('Trip Created! 🌟', `${destName} itinerary synced with TravelBuddy MySQL database.`);
    } else {
      Alert.alert('Notice', res.message || 'Added to itineraries.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Planner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Origin info badge */}
        <View style={styles.originBadge}>
          <Ionicons name="navigate" size={14} color={colors.primaryLight} style={{ marginRight: 6 }} />
          <Text style={styles.originText}>
            Departing from: <Text style={{ color: colors.white, fontWeight: '700' }}>{originCity}, Andhra Pradesh</Text>
          </Text>
        </View>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations, states, hills..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionHeader}>RECOMMENDED ROUTES</Text>

        {filtered.map((dest, idx) => (
          <View key={idx} style={styles.destCard}>
            <View style={styles.destLeft}>
              <View style={styles.destIconWrapper}>
                <Ionicons name="map-outline" size={22} color={colors.primaryLight} />
              </View>
              <View>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destType}>{dest.type} • {dest.state}</Text>
                <Text style={styles.destDuration}>Suggested: {dest.days}</Text>
              </View>
            </View>

            <View style={styles.destActions}>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() =>
                  navigation.navigate('DestinationDetails', { destinationName: dest.name })
                }
              >
                <Text style={styles.viewBtnText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleQuickAdd(dest.name)}
              >
                <Ionicons name="add" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  originText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  destCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 12,
  },
  destLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  destIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  destType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  destDuration: {
    fontSize: 11,
    color: colors.primaryLight,
    marginTop: 3,
    fontWeight: '600',
  },
  destActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  viewBtnText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
