import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { LocationCard } from '../components/LocationCard';
import { WeatherCard } from '../components/WeatherCard';
import { QuickActions } from '../components/QuickActions';
import { AskBuddyWidget } from '../components/AskBuddyWidget';
import { DestinationCard } from '../components/DestinationCard';
import { CityPickerModal } from '../components/CityPickerModal';

const FEATURED_DESTINATIONS = [
  {
    id: 'pondicherry',
    title: 'Pondicherry',
    tag: 'Trending',
    rating: '4.8',
    price: '₹2,500 - ₹12,000',
    bestTime: 'Oct to Mar',
    icon: 'water-outline',
  },
  {
    id: 'mahabalipuram',
    title: 'Mahabalipuram',
    tag: 'Heritage',
    rating: '4.7',
    price: '₹2,500 - ₹15,000',
    bestTime: 'Nov to Feb',
    icon: 'business-outline',
  },
  {
    id: 'ooty',
    title: 'Ooty',
    tag: 'Hill Station',
    rating: '4.9',
    price: '₹3,000 - ₹18,000',
    bestTime: 'Mar to Jun',
    icon: 'leaf-outline',
  },
  {
    id: 'goa',
    title: 'Goa',
    tag: 'Beach Party',
    rating: '4.9',
    price: '₹4,500 - ₹25,000',
    bestTime: 'Nov to Feb',
    icon: 'sunny-outline',
  },
  {
    id: 'tirupati',
    title: 'Tirupati',
    tag: 'Pilgrimage',
    rating: '4.9',
    price: '₹1,500 - ₹8,000',
    bestTime: 'All Year',
    icon: 'sparkles-outline',
  },
];

export const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header
          onSearchPress={() => navigation.navigate('TripPlanner')}
          onAlertsPress={() => navigation.navigate('Alerts')}
        />

        {/* Live Location Card (Defaults to Nellore) */}
        <LocationCard />

        {/* Live Weather Card */}
        <WeatherCard />

        {/* Ask Buddy AI Widget */}
        <AskBuddyWidget onPress={() => navigation.navigate('ChatBuddy')} />

        {/* Quick Action Grid */}
        <QuickActions navigation={navigation} />

        {/* Featured Destinations */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>POPULAR DESTINATIONS</Text>
            <Text style={styles.sectionSubtitle}>Handpicked for you</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {FEATURED_DESTINATIONS.map((item) => (
              <DestinationCard
                key={item.id}
                destination={item}
                onPress={() =>
                  navigation.navigate('DestinationDetails', {
                    destinationName: item.title,
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* City Picker Modal */}
        <CityPickerModal />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  carouselSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    marginHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  carouselContent: {
    paddingLeft: 18,
    paddingRight: 6,
  },
});
