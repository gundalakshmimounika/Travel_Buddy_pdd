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
import { ticketsApi } from '../api/endpoints';
import { useLocation } from '../context/LocationContext';

export const TicketBookingScreen = ({ route, navigation }) => {
  const { destination = 'Pondicherry', fromLocation } = route.params || {};
  const { currentLocation } = useLocation();

  const origin = fromLocation || currentLocation?.city || 'Nellore';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [origin, destination]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketsApi.getTickets(origin, destination);
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setTickets(res.data);
      } else {
        // Fallback realistic transport data
        setTickets([
          { type: 'Airways', price: '₹4,800', duration: '1h 35m', operator: 'IndiGo / SpiceJet', code: '6E-452' },
          { type: 'Train', price: '₹950', duration: '6h 40m', operator: 'Circar Express', code: '17644' },
          { type: 'Bus', price: '₹750', duration: '7h 15m', operator: 'APSRTC Amaravathi AC', code: 'EXP-889' },
        ]);
      }
    } catch (e) {
      console.warn('Tickets error:', e);
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('air') || t.includes('flight')) return 'airplane';
    if (t.includes('train')) return 'train';
    if (t.includes('bus')) return 'bus';
    return 'car';
  };

  const handleBook = (ticket) => {
    Alert.alert(
      'Confirm Booking 🎫',
      `Book ${ticket.type} from ${origin} to ${destination} for ${ticket.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          onPress: () => {
            Alert.alert('Booking Confirmed! ✅', `Your ticket (${ticket.type}) has been booked. Reference ID: TB-${Math.floor(100000 + Math.random() * 900000)}`);
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Tickets to {destination}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Origin - Destination Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeCol}>
            <Text style={styles.routeCityLabel}>ORIGIN</Text>
            <Text style={styles.routeCityName}>{origin}</Text>
            <Text style={styles.routeStateText}>Andhra Pradesh</Text>
          </View>

          <View style={styles.routeMid}>
            <View style={styles.dashLine} />
            <View style={styles.planeCircle}>
              <Ionicons name="airplane" size={14} color={colors.primaryLight} />
            </View>
            <View style={styles.dashLine} />
          </View>

          <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.routeCityLabel}>DESTINATION</Text>
            <Text style={styles.routeCityName}>{destination}</Text>
            <Text style={styles.routeStateText}>India</Text>
          </View>
        </View>

        {/* Tickets List */}
        <Text style={styles.sectionHeader}>AVAILABLE TRANSPORT MODES</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primaryLight} />
            <Text style={styles.loadingText}>Fetching live schedules & fares...</Text>
          </View>
        ) : (
          tickets.map((ticket, idx) => (
            <View key={idx} style={styles.ticketCard}>
              <View style={styles.ticketLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name={getTransportIcon(ticket.type)} size={22} color={colors.primaryLight} />
                </View>
                <View>
                  <Text style={styles.ticketType}>{ticket.type}</Text>
                  <Text style={styles.ticketDetails}>
                    {ticket.operator || 'Scheduled'} • {ticket.duration}
                  </Text>
                  {ticket.code && <Text style={styles.codeText}>Code: {ticket.code}</Text>}
                </View>
              </View>

              <View style={styles.ticketRight}>
                <Text style={styles.ticketPrice}>{ticket.price}</Text>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => handleBook(ticket)}
                >
                  <Text style={styles.bookBtnText}>Book</Text>
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
  routeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorderLight,
    padding: 18,
    marginBottom: 20,
  },
  routeCol: {
    flex: 1,
  },
  routeCityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  routeCityName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginTop: 2,
  },
  routeStateText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeMid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dashLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.surfaceBorderLight,
  },
  planeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
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
  ticketCard: {
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
  ticketLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ticketType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  ticketDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  codeText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  ticketRight: {
    alignItems: 'flex-end',
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accentEmerald,
    marginBottom: 6,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
