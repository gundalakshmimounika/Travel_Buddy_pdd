const path = require('path');
const LocalWebServer = require('./utils/localServer');
const DriverFactory = require('./utils/driverFactory');
const SeleniumExcelReporter = require('./reporters/excelReporter');

const runAuthTests = require('./tests/auth.test.js');
const runDashboardTests = require('./tests/dashboard.test.js');
const runTripPlanningTests = require('./tests/trip-planning.test.js');
const runBookingTests = require('./tests/bookings.test.js');
const runAiAssistantTests = require('./tests/ai-assistant.test.js');
const runCommunityAndBudgetTests = require('./tests/community-budget.test.js');
const runFullE2ETests = require('./tests/full-e2e.test.js');

async function main() {
  console.log('===========================================================');
  console.log('   TravelBuddy Selenium Web E2E Automation Runner');
  console.log('===========================================================');

  const isHeaded = process.argv.includes('--headed');
  const headless = !isHeaded;
  const port = process.env.TEST_PORT || 8085;

  const server = new LocalWebServer(port);
  const reporter = new SeleniumExcelReporter(path.join(__dirname, 'Selenium_Web_Test_Report.xlsx'));
  let driver = null;

  try {
    const baseUrl = await server.start();
    console.log(`[Runner] Launching Chrome Browser (Headless: ${headless})...`);
    driver = await DriverFactory.createDriver(headless);

    console.log('\n--- Running Suite 1: Authentication ---');
    await runAuthTests(driver, baseUrl, reporter);

    console.log('\n--- Running Suite 2: Dashboard & Navigation ---');
    await runDashboardTests(driver, baseUrl, reporter);

    console.log('\n--- Running Suite 3: Trip Planning ---');
    await runTripPlanningTests(driver, baseUrl, reporter);

    console.log('\n--- Running Suite 4: Tickets & Hotels Bookings ---');
    await runBookingTests(driver, baseUrl, reporter);

    console.log('\n--- Running Suite 5: AI Travel Assistant ---');
    await runAiAssistantTests(driver, baseUrl, reporter);

    console.log('\n--- Running Suite 6: Budget, Packing & Weather ---');
    await runCommunityAndBudgetTests(driver, baseUrl, reporter);

    console.log('\n--- Running Suite 7: Full End-to-End Traveler Journey ---');
    await runFullE2ETests(driver, baseUrl, reporter);

  } catch (err) {
    console.error('[Runner] Unhandled execution error:', err);
  } finally {
    if (driver) {
      console.log('\n[Runner] Quitting Chrome WebDriver...');
      await driver.quit();
    }
    server.stop();

    console.log('\n[Runner] Generating Excel Test Analysis Report...');
    const reportPath = await reporter.generateReport();
    console.log(`\n===========================================================`);
    console.log(`  Tests Completed! Analysis Report:`);
    console.log(`  ${reportPath}`);
    console.log(`===========================================================`);
  }
}

main().catch(err => {
  console.error('[Runner] Fatal Error:', err);
  process.exit(1);
});
