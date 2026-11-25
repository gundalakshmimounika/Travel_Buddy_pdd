# TravelBuddy - Appium Android Mobile E2E Testing Framework (Node.js)

Automated Mobile End-to-End testing framework for the native TravelBuddy Android application (`com.simats.travelbuddy`). Built with **Appium UiAutomator2 (Node.js)** and **ExcelJS** for enterprise-grade mobile test reporting and execution analysis.

---

## 📁 Directory Structure

```text
appium-testing/
├── package.json                 # Node.js project manifest & test scripts
├── runner.js                    # Mobile test runner & orchestrator
├── Appium_Android_Test_Report.xlsx # Generated Excel mobile execution analysis report
├── config/
│   └── caps.js                  # Android UiAutomator2 capabilities & activity declarations
├── tests/
│   ├── splash-auth.spec.js      # SplashActivity & LoginActivity workflows
│   ├── dashboard-navigation.spec.js # MainActivity bottom nav & SearchActivity
│   ├── trip-details.spec.js     # MyTripsActivity & TripDetailsActivity
│   ├── booking-weather.spec.js  # WeatherDetails, TicketBooking, HotelBooking
│   ├── budget-packing.spec.js   # BudgetTrackerActivity & PackingListActivity
│   ├── community.spec.js        # CommunityActivity & ChatBuddyActivity
│   └── mobile-e2e.spec.js       # Full 10-Activity mobile traveler journey
└── reporters/
    └── excelReporter.js         # Mobile Excel analysis report generator
```

---

## 📱 Target Android Activities Tested

| Activity | Test Coverage |
| :--- | :--- |
| `.SplashActivity` | App launch intent, branding squircle, transition |
| `.LoginActivity` | Email & password form fields, validation, guest login |
| `.SignupActivity` | Full name, email, password, back navigation |
| `.MainActivity` | Bottom navigation (Home, Trips, Search, Alerts, Profile) |
| `.SearchActivity` | Real-time destination query & recommendations |
| `.TripDetailsActivity` | Destination overview, attractions list, maps intent |
| `.WeatherDetailsActivity` | Current temperature, humidity, 7-day forecast cards |
| `.TicketBookingActivity` | Flights, Trains, Buses, Cabs multi-modal transport |
| `.HotelBookingActivity` | Hotel cards, star ratings, contact dialer |
| `.BudgetTrackerActivity` | Limit bar, remaining balance, expense logger |
| `.PackingListActivity` | Checklist category items, check state toggling |
| `.ChatBuddyActivity` | Gemini AI travel assistant chatbot messaging |
| `.CommunityActivity` | Social travel posts, likes, join requests |

---

## 🚀 Execution Instructions

### 1. Install Dependencies
```bash
cd appium-testing
npm install
```

### 2. Run Mobile Automated Suite
```bash
node runner.js
```

### 3. Run with Connected Android Emulator / Physical Device
```bash
# Ensure Appium server is running: appium -p 4723
npm run test:device
```
