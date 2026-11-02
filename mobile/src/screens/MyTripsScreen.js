import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';

export const MyTripsScreen = ({ navigation }) => {
  const { trips, loading, deleteTrip, loadTrips } = useTrips();
  const { user } = useAuth();

  const handleDelete = (destination) => {
    Alert.alert(
      'Remove Trip',
      `Are you sure you want to delete ${destination} from your itineraries?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTrip(destination),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>My Itineraries</Text>
        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={() => navigation.navigate('TripPlanner')}
        >
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sync Info Header */}
        <View style={styles.syncCard}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>
            Unified Cloud Sync: {user?.email || 'Guest Mode'}
          </Text>
          <TouchableOpacity onPress={loadTrips} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="refresh" size={14} color={colors.primaryLight} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={colors.primaryLight} />
            <Text style={styles.loadingText}>Loading your itineraries...</Text>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="map-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Trips Planned Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring top destinations and add them to your personalized itineraries.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('TripPlanner')}
            >
              <Text style={styles.exploreBtnText}>Explore Destinations</Text>
            </TouchableOpacity>
          </View>
        ) : (
          trips.map((trip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.tripCard}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('DestinationDetails', {
                  destinationName: trip.destination,
                })
              }
            >
              <View style={styles.tripLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="airplane" size={22} color={colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.destName}>{trip.destination}</Text>
                  <Text style={styles.tripDate}>
                    {trip.dates || 'Saved Itinerary • Ready to travel'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(trip.destination)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentEmerald,
    marginRight: 8,
  },
  syncText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  tripCard: {
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
  tripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
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
  tripDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
