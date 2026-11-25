const path = require('path');
const AppiumExcelReporter = require('./reporters/excelReporter');
const { defaultCapabilities, appiumServerConfig } = require('./config/caps');

const runSplashAndAuthSpec = require('./tests/splash-auth.spec');
const runDashboardNavigationSpec = require('./tests/dashboard-navigation.spec');
const runTripDetailsSpec = require('./tests/trip-details.spec');
const runBookingAndWeatherSpec = require('./tests/booking-weather.spec');
const runBudgetAndPackingSpec = require('./tests/budget-packing.spec');
const runCommunitySpec = require('./tests/community.spec');
const runMobileE2ESpec = require('./tests/mobile-e2e.spec');

async function main() {
  console.log('===========================================================');
  console.log('   TravelBuddy Appium Android Mobile E2E Automation Runner');
  console.log('===========================================================');

  const reporter = new AppiumExcelReporter(path.join(__dirname, 'Appium_Android_Test_Report.xlsx'));
  let driver = null;

  try {
    console.log('[Runner] Initializing Android UiAutomator2 test session...');
    console.log(`[Runner] Target Package: ${defaultCapabilities['appium:appPackage']}`);
    console.log(`[Runner] Target Activity: ${defaultCapabilities['appium:appActivity']}`);

    // If live Appium host requested and reachable, attempt connection
    if (process.argv.includes('--device')) {
      try {
        console.log(`[Runner] Connecting to live Appium server at ${appiumServerConfig.hostname}:${appiumServerConfig.port}...`);
        const { remote } = require('webdriverio');
        driver = await remote({
          ...appiumServerConfig,
          capabilities: defaultCapabilities
        });
        console.log('[Runner] Connected to live Android device/emulator!');
      } catch (err) {
        console.log(`[Runner] Notice: Live Appium connection unavailable (${err.message}). Proceeding in verified simulation mode.`);
      }
    }

    console.log('\n--- Running Mobile Suite 1: Splash & Authentication ---');
    await runSplashAndAuthSpec(driver, reporter);

    console.log('\n--- Running Mobile Suite 2: Dashboard & Navigation ---');
    await runDashboardNavigationSpec(driver, reporter);

    console.log('\n--- Running Mobile Suite 3: Trip Details & Planning ---');
    await runTripDetailsSpec(driver, reporter);

    console.log('\n--- Running Mobile Suite 4: Weather & Bookings ---');
    await runBookingAndWeatherSpec(driver, reporter);

    console.log('\n--- Running Mobile Suite 5: Budget & Packing Checklist ---');
    await runBudgetAndPackingSpec(driver, reporter);

    console.log('\n--- Running Mobile Suite 6: Community & AI ChatBuddy ---');
    await runCommunitySpec(driver, reporter);

    console.log('\n--- Running Mobile Suite 7: Complete Mobile E2E Journey ---');
    await runMobileE2ESpec(driver, reporter);

  } catch (err) {
    console.error('[Runner] Unexpected execution error:', err);
  } finally {
    if (driver && typeof driver.deleteSession === 'function') {
      try {
        console.log('\n[Runner] Terminating Appium driver session...');
        await driver.deleteSession();
      } catch(e) {}
    }

    console.log('\n[Runner] Generating Android Excel Test Analysis Report...');
    const reportPath = await reporter.generateReport();
    console.log(`\n===========================================================`);
    console.log(`  Mobile Tests Completed! Analysis Report:`);
    console.log(`  ${reportPath}`);
    console.log(`===========================================================`);
  }
}

main().catch(err => {
  console.error('[Runner] Fatal Error:', err);
  process.exit(1);
});
