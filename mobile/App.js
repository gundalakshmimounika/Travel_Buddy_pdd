import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from './src/theme/colors';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { TripProvider } from './src/context/TripContext';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MyTripsScreen } from './src/screens/MyTripsScreen';
import { TripPlannerScreen } from './src/screens/TripPlannerScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DestinationDetailsScreen } from './src/screens/DestinationDetailsScreen';
import { TicketBookingScreen } from './src/screens/TicketBookingScreen';
import { HotelBookingScreen } from './src/screens/HotelBookingScreen';
import { BudgetTrackerScreen } from './src/screens/BudgetTrackerScreen';
import { PackingListScreen } from './src/screens/PackingListScreen';
import { ChatBuddyScreen } from './src/screens/ChatBuddyScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0E1626',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Trips') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Plan') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Alerts') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" component={MyTripsScreen} />
      <Tab.Screen name="Plan" component={TripPlannerScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <TripProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#0B0F19" />
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.background },
              }}
            >
              {/* Auth / Onboarding */}
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

              {/* Main App with Tabs */}
              <Stack.Screen name="MainTabs" component={MainTabNavigator} />

              {/* Detail & Action Flows */}
              <Stack.Screen name="DestinationDetails" component={DestinationDetailsScreen} />
              <Stack.Screen name="TicketBooking" component={TicketBookingScreen} />
              <Stack.Screen name="HotelBooking" component={HotelBookingScreen} />
              <Stack.Screen name="BudgetTracker" component={BudgetTrackerScreen} />
              <Stack.Screen name="PackingList" component={PackingListScreen} />
              <Stack.Screen name="ChatBuddy" component={ChatBuddyScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </TripProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
