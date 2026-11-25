const path = require('path');

const defaultCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
  'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14.0',
  'appium:appPackage': 'com.simats.travelbuddy',
  'appium:appActivity': '.SplashActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 240,
  'appium:autoGrantPermissions': true,
  'appium:espressoBuildConfig': {
    additionalAppDependencies: []
  }
};

const appiumServerConfig = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/'
};

const androidActivities = {
  SPLASH: '.SplashActivity',
  ONBOARDING: '.OnboardingActivity',
  LOGIN: '.LoginActivity',
  SIGNUP: '.SignupActivity',
  RESET_PASSWORD: '.ResetPasswordActivity',
  MAIN: '.MainActivity',
  MY_TRIPS: '.MyTripsActivity',
  TRIP_DETAILS: '.TripDetailsActivity',
  TRIP_PLANNER: '.TripPlannerActivity',
  WEATHER: '.WeatherDetailsActivity',
  TICKETS: '.TicketBookingActivity',
  HOTELS: '.HotelBookingActivity',
  BUDGET: '.BudgetTrackerActivity',
  PACKING: '.PackingListActivity',
  CHAT_BUDDY: '.ChatBuddyActivity',
  COMMUNITY: '.CommunityActivity',
  JOIN_REQUESTS: '.JoinRequestsActivity',
  PROFILE: '.ProfileActivity',
  SEARCH: '.SearchActivity'
};

module.exports = {
  defaultCapabilities,
  appiumServerConfig,
  androidActivities
};
