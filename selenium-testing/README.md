# TravelBuddy - Selenium Web E2E Testing Framework (Node.js)

Automated End-to-End browser testing suite for the TravelBuddy Web application. Built with **Selenium WebDriver (Node.js)** and **ExcelJS** for enterprise-grade automated Excel test analysis reports.

---

## 📁 Directory Structure

```text
selenium-testing/
├── package.json               # Node.js project manifest & test scripts
├── runner.js                  # Standalone test orchestrator and execution runner
├── Selenium_Web_Test_Report.xlsx # Generated Excel execution analysis report
├── tests/
│   ├── auth.test.js           # Splash, Login, Signup, Guest authentication
│   ├── dashboard.test.js      # Destination search, Weather widget, Bottom nav
│   ├── trip-planning.test.js  # Trips listing and details navigation
│   ├── bookings.test.js       # Tickets (Air/Train/Bus/Cab) & Hotel stays
│   ├── ai-assistant.test.js   # Ask Buddy AI chatbot interactions
│   ├── community-budget.test.js # Budget tracker, Packing list, Weather
│   └── full-e2e.test.js       # Complete 10-step traveler journey
├── utils/
│   ├── driverFactory.js       # Chrome Headless / Headed WebDriver configuration
│   └── localServer.js         # Embedded web server for static assets & mock endpoints
└── reporters/
    └── excelReporter.js       # Formatted multi-tab Excel analysis report generator
```

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
cd selenium-testing
npm install
```

### 2. Execute Tests in Headless Mode (Default / CI)
```bash
npm run test:headless
# or
node runner.js
```

### 3. Execute Tests in Headed Mode (Visible Browser UI)
```bash
npm run test:headed
```

---

## 📊 Automated Excel Report Analysis

Upon test completion, the framework automatically generates `Selenium_Web_Test_Report.xlsx` containing:
1. **Executive Summary & Metrics**: Total tests, Passed, Failed, Pass Rate %, Duration, Environment specs, and KPI cards.
2. **Execution Details**: Test ID, Suite name, Scenario description, Pass/Fail status, Duration in ms, Timestamp, and detailed Error stack traces.
