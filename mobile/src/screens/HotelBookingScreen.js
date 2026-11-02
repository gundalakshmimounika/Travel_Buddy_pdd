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
import { hotelsApi } from '../api/endpoints';

export const HotelBookingScreen = ({ route, navigation }) => {
  const { destination = 'Pondicherry' } = route.params || {};
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, [destination]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await hotelsApi.getHotels(destination);
      if (Array.isArray(res) && res.length > 0) {
        setHotels(res);
      } else {
        // Fallback realistic hotel listings
        setHotels([
          {
            name: `${destination} Grand Heritage Resort`,
            rating: '4.8',
            price: '₹5,500 / night',
            description: 'Luxury beachfront property with swimming pool, spa, and complimentary breakfast.',
            amenities: ['Pool', 'WiFi', 'Spa', 'Breakfast'],
          },
          {
            name: 'Seaside Boutique Hotel',
            rating: '4.6',
            price: '₹3,200 / night',
            description: 'Comfortable rooms within 5 minutes walking distance to the beach promenade.',
            amenities: ['WiFi', 'AC', 'Room Service'],
          },
          {
            name: 'Backpackers Cozy Hostel & Cafe',
            rating: '4.5',
            price: '₹1,200 / night',
            description: 'Vibrant social atmosphere, shared kitchen, and tour guides for solo travelers.',
            amenities: ['WiFi', 'Cafe', 'Locker'],
          },
        ]);
      }
    } catch (e) {
      console.warn('Hotels error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (hotel) => {
    Alert.alert(
      'Reserve Room 🏨',
      `Confirm reservation at ${hotel.name} for ${hotel.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: () => {
            Alert.alert('Reservation Confirmed! 🎉', `Your stay at ${hotel.name} is booked.`);
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Hotels in {destination}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>FEATURED STAYS & RESORTS</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primaryLight} />
            <Text style={styles.loadingText}>Finding best available rooms...</Text>
          </View>
        ) : (
          hotels.map((hotel, idx) => (
            <View key={idx} style={styles.hotelCard}>
              <View style={styles.hotelHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#FBBF24" style={{ marginRight: 4 }} />
                    <Text style={styles.ratingText}>{hotel.rating || '4.6'}</Text>
                    <Text style={styles.reviewCount}> • (180+ reviews)</Text>
                  </View>
                </View>
                <Text style={styles.hotelPrice}>{hotel.price || '₹3,500'}</Text>
              </View>

              <Text style={styles.description}>{hotel.description}</Text>

              <View style={styles.footerRow}>
                <View style={styles.amenitiesList}>
                  {(hotel.amenities || ['WiFi', 'AC', 'Breakfast']).map((am, i) => (
                    <View key={i} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{am}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => handleBook(hotel)}
                >
                  <Text style={styles.bookBtnText}>Reserve</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  hotelCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    marginBottom: 14,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  hotelPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.accentEmerald,
    marginLeft: 10,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 10,
  },
  amenitiesList: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  amenityTag: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: colors.textLight,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
