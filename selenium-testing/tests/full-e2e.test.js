const { By, until, Key } = require('selenium-webdriver');

async function runFullE2ETests(driver, baseUrl, reporter) {
  const suite = 'Complete End-to-End Traveler Journey';
  const tStart = Date.now();

  try {
    // Step 1: Initialize App
    await driver.get(baseUrl);
    try {
      const splash = await driver.findElement(By.id('splash-screen'));
      if (await splash.isDisplayed()) await splash.click();
    } catch(e) {}
    await driver.sleep(600);

    // Step 2: Sign in as Guest if on login
    try {
      const guestBtn = await driver.findElement(By.id('btn-guest-id'));
      if (await guestBtn.isDisplayed()) {
        await guestBtn.click();
        await driver.sleep(800);
      }
    } catch(e) {}

    // Step 3: Global destination search
    const searchInput = await driver.findElement(By.id('search-input-id'));
    await searchInput.clear();
    await searchInput.sendKeys('Tokyo', Key.ENTER);
    await driver.sleep(600);

    // Step 4: Check Weather section
    const weatherCard = await driver.findElement(By.id('btn-weather-list'));
    await weatherCard.click();
    await driver.sleep(600);
    const weatherBack = await driver.findElement(By.id('btn-weather-back'));
    await weatherBack.click();
    await driver.sleep(500);

    // Step 5: Check Tickets & Transport
    const ticketCard = await driver.findElement(By.id('btn-ticket-list'));
    await ticketCard.click();
    await driver.sleep(600);
    const ticketsBack = await driver.findElement(By.id('btn-tickets-back'));
    await ticketsBack.click();
    await driver.sleep(500);

    // Step 6: Check Hotels
    const hotelCard = await driver.findElement(By.id('btn-hotel-list'));
    await hotelCard.click();
    await driver.sleep(600);
    const hotelsBack = await driver.findElement(By.id('btn-hotels-back'));
    await hotelsBack.click();
    await driver.sleep(500);

    // Step 7: Check Budget
    const budgetCard = await driver.findElement(By.id('btn-budget-list'));
    await budgetCard.click();
    await driver.sleep(600);
    const budgetBack = await driver.findElement(By.id('btn-budget-back'));
    await budgetBack.click();
    await driver.sleep(500);

    // Step 8: Check Packing List
    const packCard = await driver.findElement(By.id('btn-pack-list'));
    await packCard.click();
    await driver.sleep(600);
    const packBack = await driver.findElement(By.id('btn-packing-back'));
    await packBack.click();
    await driver.sleep(500);

    // Step 9: Ask AI Buddy
    const buddyCard = await driver.findElement(By.id('btn-buddy-plan'));
    await buddyCard.click();
    await driver.sleep(500);
    const closeChat = await driver.findElement(By.id('btn-chat-close-id'));
    await closeChat.click();
    await driver.sleep(400);

    // Step 10: Profile Navigation
    const navProfile = await driver.findElement(By.id('navProfile'));
    await navProfile.click();
    await driver.sleep(500);

    const navHome = await driver.findElement(By.id('navHome'));
    await navHome.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-E2E-FULL',
      suite,
      name: 'Execute 10-Step Full Traveler Journey across all core modules',
      status: 'PASS',
      durationMs: Date.now() - tStart
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-E2E-FULL',
      suite,
      name: 'Execute 10-Step Full Traveler Journey across all core modules',
      status: 'FAIL',
      durationMs: Date.now() - tStart,
      error: err
    });
  }
}

module.exports = runFullE2ETests;
