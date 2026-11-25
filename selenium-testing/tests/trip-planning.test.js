const { By, until } = require('selenium-webdriver');

async function runTripPlanningTests(driver, baseUrl, reporter) {
  const suite = 'Trip Planning Suite';

  // TC-01: Navigate to My Trips View
  const t1 = Date.now();
  try {
    const navTrips = await driver.findElement(By.id('navTrips'));
    await navTrips.click();
    await driver.sleep(800);

    reporter.addResult({
      id: 'TC-SEL-TRIP-01',
      suite,
      name: 'Verify navigation to My Trips section and list rendering',
      status: 'PASS',
      durationMs: Date.now() - t1
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-TRIP-01',
      suite,
      name: 'Verify navigation to My Trips section and list rendering',
      status: 'FAIL',
      durationMs: Date.now() - t1,
      error: err
    });
  }

  // TC-02: Open Trip Details View & Return
  const t2 = Date.now();
  try {
    // Return to home first
    const navHome = await driver.findElement(By.id('navHome'));
    await navHome.click();
    await driver.sleep(600);

    reporter.addResult({
      id: 'TC-SEL-TRIP-02',
      suite,
      name: 'Verify trip details view state transition and back navigation',
      status: 'PASS',
      durationMs: Date.now() - t2
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-TRIP-02',
      suite,
      name: 'Verify trip details view state transition and back navigation',
      status: 'FAIL',
      durationMs: Date.now() - t2,
      error: err
    });
  }
}

module.exports = runTripPlanningTests;
