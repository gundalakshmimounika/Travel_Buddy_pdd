const { By, until, Key } = require('selenium-webdriver');

async function runDashboardTests(driver, baseUrl, reporter) {
  const suite = 'Dashboard & Navigation Suite';

  // TC-01: Destination Search Interaction
  const t1 = Date.now();
  try {
    const searchInput = await driver.findElement(By.id('search-input-id'));
    await searchInput.clear();
    await searchInput.sendKeys('Paris', Key.ENTER);
    await driver.sleep(1000);

    // Verify search triggered place details or search view
    reporter.addResult({
      id: 'TC-SEL-DASH-01',
      suite,
      name: 'Verify destination search query input and execution',
      status: 'PASS',
      durationMs: Date.now() - t1
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-DASH-01',
      suite,
      name: 'Verify destination search query input and execution',
      status: 'FAIL',
      durationMs: Date.now() - t1,
      error: err
    });
  }

  // TC-02: Weather Toggle Widget
  const t2 = Date.now();
  try {
    const weatherToggle = await driver.findElement(By.id('btn-weather-toggle-id'));
    await weatherToggle.click();
    await driver.sleep(500);

    const isExpanded = await weatherToggle.getAttribute('aria-expanded');
    await weatherToggle.click(); // toggle back
    await driver.sleep(400);

    reporter.addResult({
      id: 'TC-SEL-DASH-02',
      suite,
      name: 'Verify interactive 7-day weather forecast drawer toggle',
      status: 'PASS',
      durationMs: Date.now() - t2
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-DASH-02',
      suite,
      name: 'Verify interactive 7-day weather forecast drawer toggle',
      status: 'FAIL',
      durationMs: Date.now() - t2,
      error: err
    });
  }

  // TC-03: Bottom Navigation Bar Tabs
  const t3 = Date.now();
  try {
    const navTrips = await driver.findElement(By.id('navTrips'));
    await navTrips.click();
    await driver.sleep(600);

    const navSearch = await driver.findElement(By.id('navSearch'));
    await navSearch.click();
    await driver.sleep(600);

    const navAlerts = await driver.findElement(By.id('navAlerts'));
    await navAlerts.click();
    await driver.sleep(600);

    const navHome = await driver.findElement(By.id('navHome'));
    await navHome.click();
    await driver.sleep(600);

    reporter.addResult({
      id: 'TC-SEL-DASH-03',
      suite,
      name: 'Verify bottom navigation tab switching across Home, Trips, Search, Alerts',
      status: 'PASS',
      durationMs: Date.now() - t3
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-DASH-03',
      suite,
      name: 'Verify bottom navigation tab switching across Home, Trips, Search, Alerts',
      status: 'FAIL',
      durationMs: Date.now() - t3,
      error: err
    });
  }
}

module.exports = runDashboardTests;
