import React, { useState, useEffect } from 'react';
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
import { tripsApi } from '../api/endpoints';
import { useTrips } from '../context/TripContext';
import { useLocation } from '../context/LocationContext';

export const DestinationDetailsScreen = ({ route, navigation }) => {
  const { destinationName = 'Pondicherry' } = route.params || {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { addTrip } = useTrips();
  const { currentLocation } = useLocation();
  const originCity = currentLocation?.city || 'Nellore';

  useEffect(() => {
    fetchDetails();
  }, [destinationName]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await tripsApi.getPlaceDetails(destinationName);
      if (res && res.title) {
        setDetails(res);
      } else {
        // Fallback default rich content
        setDetails({
          title: destinationName,
          description: `${destinationName} is one of the most beloved travel destinations in India, offering rich culture, vibrant sights, and incredible local food.`,
          rating: '4.8',
          best_time: 'October to March',
          budget_min: '2500',
          budget_max: '12000',
          travel_methods: `Easily accessible via direct airways, express trains, and state highways from ${originCity}.`,
          recommended_places: ['Promenade Beach', 'French Quarter', 'Auroville', 'Paradise Beach'],
          hotels: ['Radisson Resort', 'Palais de Mahe', 'Heritage Inn'],
        });
      }
    } catch (e) {
      console.warn('Place details error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToTrips = async () => {
    setSaving(true);
    const res = await addTrip(destinationName);
    setSaving(false);
    if (res.success) {
      Alert.alert('Trip Added! 🎉', `${destinationName} was added to your itineraries and synchronized with MySQL.`);
    } else {
      Alert.alert('Notice', res.message || 'Trip added locally.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryLight} />
        <Text style={styles.loadingText}>Loading {destinationName} details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{destinationName}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleAddToTrips}>
          <Ionicons name="heart-outline" size={20} color={colors.accentRose} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <Ionicons name="trail-sign" size={48} color={colors.primaryLight} style={{ marginBottom: 12 }} />
          <Text style={styles.heroTitle}>{details?.title || destinationName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#FBBF24" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{details?.rating || '4.8'}</Text>
            </View>
            <View style={styles.timeBadge}>
              <Ionicons name="calendar-outline" size={13} color={colors.primaryLight} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{details?.best_time || 'Oct - Mar'}</Text>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>About</Text>
          <Text style={styles.descText}>{details?.description}</Text>
        </View>

        {/* Travel Method & Origin */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Travel from {originCity}</Text>
          <Text style={styles.descText}>{details?.travel_methods}</Text>
        </View>

        {/* Attractions */}
        {details?.recommended_places && details.recommended_places.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Top Attractions</Text>
            <View style={styles.placesList}>
              {details.recommended_places.map((place, idx) => (
                <View key={idx} style={styles.placeItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accentEmerald} style={{ marginRight: 8 }} />
                  <Text style={styles.placeItemText}>{place}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action CTAs */}
        <View style={styles.ctaGrid}>
          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={() =>
              navigation.navigate('TicketBooking', {
                destination: destinationName,
                fromLocation: originCity,
              })
            }
          >
            <Ionicons name="ticket" size={18} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.ctaPrimaryText}>Book Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaSecondary}
            onPress={() =>
              navigation.navigate('HotelBooking', {
                destination: destinationName,
              })
            }
          >
            <Ionicons name="bed-outline" size={18} color={colors.primaryLight} style={{ marginRight: 8 }} />
            <Text style={styles.ctaSecondaryText}>View Stays</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
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
  heroCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  sectionCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
  },
  placesList: {
    gap: 8,
    marginTop: 4,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeItemText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  ctaGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaPrimaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  ctaSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSecondaryText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
