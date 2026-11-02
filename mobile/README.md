# TravelBuddy React Native Mobile Application

The modern, cross-platform **React Native** frontend for **TravelBuddy**, engineered to run seamlessly on Android devices, emulators, and web browsers with real-time cloud synchronization to the unified MySQL database.

---

## 🌟 Key Features

### 1. Authentic Android Architecture
- Built with **React Native 0.76** and **Expo SDK 52**.
- Deep Android Material & Modern Glassmorphism design system in [`src/theme/colors.js`](src/theme/colors.js).
- Full screen stack and bottom tab navigation via `@react-navigation/native` and `@react-navigation/bottom-tabs`.

### 2. Location & Weather Calibration (Nellore, AP)
- Calibrated to default to **Nellore, Andhra Pradesh, India** (`14.4426° N, 79.9865° E`).
- Cleanly mitigates telecom IPv6 gateway fallback to Chennai.
- Interactive **City Picker Modal** allows switching to any destination (Tirupati, Vijayawada, Visakhapatnam, Hyderabad, Bengaluru, etc.) with a single tap.
- Live weather forecast connected to `backend/weather.php` with hourly timeline.

### 3. Complete Travel Experience
- **Trip Planner**: Search top Indian destinations, filter by category and duration, create custom itineraries.
- **Tickets Booking**: Live flight, express train, and interstate bus bookings from Nellore with fare calculation (`backend/tickets.php`).
- **Hotel Stays**: Curated stays, resorts, and homestays with verified amenities and instant reservations (`backend/hotels.php`).
- **Budget Tracker**: Track trip spending, set budget limits, view real-time expense percentage, and categorize expenditures (`backend/budget.php`).
- **Packing Checklist**: Smart categorized packing checklist with checkbox toggling, instant add, and item deletion (`backend/packing.php`).
- **Travel Buddy AI**: 24/7 intelligent travel companion for itineraries, packing advice, and local gems (`backend/ask_buddy.php`).
- **Travel Alerts**: Safety notices, weather advisories, and express train announcements.
- **Cloud Sync & Profiles**: User account management, guest mode, and switchable backend API endpoint (`http://10.0.2.2/` for Android Emulator, `http://localhost/` for Web).

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Android Studio with Android SDK and Emulator (e.g. Pixel 7) or physical Android device with USB debugging enabled.

### Running on Android Emulator / Device
```bash
cd mobile

# Start Metro Bundler
npm run start

# Launch directly on Android
npm run android
```

### Running on Web
```bash
cd mobile
npm run web
```

---

## 📁 Project Structure

```
mobile/
├── App.js                     # Root component with Navigation Stacks & Bottom Tabs
├── app.json                   # Expo & Android native configuration
├── package.json               # Dependencies & scripts
├── src/
│   ├── api/
│   │   ├── client.js          # Unified fetch client with automatic host detection
│   │   └── endpoints.js       # Auth, trips, weather, tickets, budget, packing, chat
│   ├── components/
│   │   ├── Header.js          # Top app bar with search & alerts
│   │   ├── LocationCard.js    # Live GPS card (Nellore, AP)
│   │   ├── WeatherCard.js     # Live temperature & hourly scroll
│   │   ├── QuickActions.js    # 4 grid services
│   │   ├── DestinationCard.js # Featured destination carousel item
│   │   ├── AskBuddyWidget.js  # Floating AI Buddy banner
│   │   └── CityPickerModal.js # Location switch dialog
│   ├── context/
│   │   ├── AuthContext.js     # Authentication state & guest session
│   │   ├── LocationContext.js # Geolocation & weather provider
│   │   └── TripContext.js     # User's trips & MySQL backend sync
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── ForgotPasswordScreen.js
│   │   ├── HomeScreen.js
│   │   ├── TripPlannerScreen.js
│   │   ├── DestinationDetailsScreen.js
│   │   ├── TicketBookingScreen.js
│   │   ├── HotelBookingScreen.js
│   │   ├── BudgetTrackerScreen.js
│   │   ├── PackingListScreen.js
│   │   ├── ChatBuddyScreen.js
│   │   ├── MyTripsScreen.js
│   │   ├── AlertsScreen.js
│   │   └── ProfileScreen.js
│   ├── theme/
│   │   └── colors.js          # Color palette, spacing, and typography
│   └── utils/
│       └── storage.js         # Cross-platform persistent storage
```

---

## 🔗 Backend Integration
The mobile app communicates with the TravelBuddy PHP/MySQL backend on XAMPP (Apache port 80, MySQL port 3306):
- **Android Emulator**: `http://10.0.2.2/TravelBuddy/backend/`
- **Web**: `http://localhost/TravelBuddy/backend/`
- **Physical Device**: `http://<YOUR_LAN_IP>/TravelBuddy/backend/` (easily updated in the Profile screen).
