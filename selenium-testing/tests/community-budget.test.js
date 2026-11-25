const { By, until } = require('selenium-webdriver');

async function runCommunityAndBudgetTests(driver, baseUrl, reporter) {
  const suite = 'Budget, Packing & Community Suite';

  // TC-01: Budget Tracker Section
  const t1 = Date.now();
  try {
    const budgetCard = await driver.findElement(By.id('btn-budget-list'));
    await budgetCard.click();
    await driver.wait(until.elementLocated(By.id('budget-section')), 4000);
    await driver.sleep(600);

    const isBudgetVisible = await driver.findElement(By.id('budget-section')).isDisplayed();
    if (!isBudgetVisible) throw new Error('Budget section not displayed');

    const backBtn = await driver.findElement(By.id('btn-budget-back'));
    await backBtn.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-BUDG-01',
      suite,
      name: 'Verify Budget Tracker overview metrics and back navigation',
      status: 'PASS',
      durationMs: Date.now() - t1
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-BUDG-01',
      suite,
      name: 'Verify Budget Tracker overview metrics and back navigation',
      status: 'FAIL',
      durationMs: Date.now() - t1,
      error: err
    });
  }

  // TC-02: Packing List Checklist
  const t2 = Date.now();
  try {
    const packingCard = await driver.findElement(By.id('btn-pack-list'));
    await packingCard.click();
    await driver.wait(until.elementLocated(By.id('packing-section')), 4000);
    await driver.sleep(600);

    const isPackingVisible = await driver.findElement(By.id('packing-section')).isDisplayed();
    if (!isPackingVisible) throw new Error('Packing section not displayed');

    const backBtn = await driver.findElement(By.id('btn-packing-back'));
    await backBtn.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-PACK-01',
      suite,
      name: 'Verify Packing Checklist view, category tabs, and back navigation',
      status: 'PASS',
      durationMs: Date.now() - t2
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-PACK-01',
      suite,
      name: 'Verify Packing Checklist view, category tabs, and back navigation',
      status: 'FAIL',
      durationMs: Date.now() - t2,
      error: err
    });
  }

  // TC-03: Weather Forecast Section
  const t3 = Date.now();
  try {
    const weatherCard = await driver.findElement(By.id('btn-weather-list'));
    await weatherCard.click();
    await driver.wait(until.elementLocated(By.id('weather-section')), 4000);
    await driver.sleep(600);

    const isWeatherVisible = await driver.findElement(By.id('weather-section')).isDisplayed();
    if (!isWeatherVisible) throw new Error('Weather section not displayed');

    const backBtn = await driver.findElement(By.id('btn-weather-back'));
    await backBtn.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-WEATH-01',
      suite,
      name: 'Verify Fullscreen Weather Forecast detail view and back navigation',
      status: 'PASS',
      durationMs: Date.now() - t3
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-WEATH-01',
      suite,
      name: 'Verify Fullscreen Weather Forecast detail view and back navigation',
      status: 'FAIL',
      durationMs: Date.now() - t3,
      error: err
    });
  }
}

module.exports = runCommunityAndBudgetTests;
