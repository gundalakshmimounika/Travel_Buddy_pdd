# TravelBuddy - Unified Travel Planning Platform

TravelBuddy is an end-to-end travel planning application featuring a **native Android frontend**, an **interactive Web frontend**, and a **single unified PHP/MySQL backend**.

---

## 📁 Repository Structure

```text
TravelBuddy/
├── android/            # Native Android Application (Android Studio Project)
│   ├── app/            # App module (Activities, Adapters, Retrofit, Layouts)
│   ├── gradle/         # Gradle wrapper & version catalogs
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
├── web/                # Web Application Frontend
│   ├── index.html      # Responsive Single Page Application
│   ├── css/style.css   # Modern responsive styles
│   ├── js/config.js    # Centralized API configuration
│   ├── js/app.js       # Web application interactive logic
│   └── assets/         # Web logos and visual assets
│
└── backend/            # Unified PHP + MySQL Backend
    ├── config.php      # Global configuration & AI integrations
    ├── db_config.php   # Database connection & auto-table initializers
    ├── db_setup.sql    # Complete MySQL schema initialization script
    ├── .htaccess       # Apache / XAMPP routing & CORS headers
    ├── login.php       # Authentication endpoint
    ├── register.php    # User registration
    ├── reset_password.php # Password recovery
    ├── get_trips.php   # Planned trips listing
    ├── add_trip.php    # Save planned trips
    ├── delete_trip.php # Delete planned trips
    ├── place_details.php # Place overview & attractions
    ├── weather.php     # Real-time weather and 7-day forecast
    ├── tickets.php     # Multi-modal ticket pricing options
    ├── hotels.php      # Hotel recommendations & pricing
    ├── ask_buddy.php   # AI travel assistant
    ├── budget.php      # Budget limits & expense tracker
    ├── community.php   # Social travel posts & join requests
    ├── alerts.php      # User notification alerts
    ├── packing.php     # Packing list & checklist toggle
    └── cache/          # High-performance response cache
```

---

## 🚀 Unified Backend Architecture

Both the **Android application** and the **Web application** communicate with the **exact same 15 backend API endpoints**:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `login.php` | `POST` | User authentication |
| `register.php` | `POST` | New user signup |
| `reset_password.php` | `POST` | Password reset |
| `get_trips.php` | `GET` | Retrieve saved user trips |
| `add_trip.php` | `POST` | Save a new planned trip |
| `delete_trip.php` | `POST` | Remove a saved trip |
| `place_details.php` | `GET` | Destination overview, weather, & attractions |
| `weather.php` | `GET` | Current weather, hourly & daily forecast |
| `tickets.php` | `GET` | Airways, train, bus, & cab ticket prices |
| `hotels.php` | `GET` | Top rated hotels with contact and prices |
| `ask_buddy.php` | `POST` | Travel assistant chat powered by Gemini AI |
| `budget.php` | `GET` | Budget limits and expense management |
| `community.php` | `GET/POST` | Social feed, post creation, and join requests |
| `alerts.php` | `GET/POST` | Travel updates & push alerts |
| `packing.php` | `GET` | Checklist generation & item toggle |

---

## 🛠️ Getting Started

### 1. Database Setup
1. Start **Apache** and **MySQL** in **XAMPP Control Panel**.
2. Open phpMyAdmin (`http://localhost/phpmyadmin/`).
3. Import `backend/db_setup.sql` or let `backend/db_config.php` automatically create all tables on first request.

### 2. Running Backend
- **Via XAMPP (Recommended):**
  Place the project inside `C:\xampp\htdocs\TravelBuddy\`.
  The backend will be live at `http://localhost/TravelBuddy/backend/`.
- **Via PHP Built-in Server:**
  ```powershell
  cd backend
  php -S 0.0.0.0:8000
  ```

### 3. Running Web Frontend
- Access via browser:
  `http://localhost/TravelBuddy/web/index.html`
- Configuration:
  Check `web/js/config.js` if you wish to adjust the backend URL.

### 4. Running Android Application
1. Open **Android Studio**.
2. Click **Open** and select the `android` folder.
3. Gradle will sync and index the project automatically.
4. In `RetrofitClient.kt`:
   - Android Emulator uses `http://10.0.2.2/TravelBuddy/backend/` by default.
   - For physical devices on Wi-Fi, update `DEFAULT_BASE_URL` to your PC's LAN IP (e.g. `http://192.168.1.100/TravelBuddy/backend/`).
5. Run on an emulator or connected device.
