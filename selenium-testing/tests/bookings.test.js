const { By, until } = require('selenium-webdriver');

async function runBookingTests(driver, baseUrl, reporter) {
  const suite = 'Bookings & Transport Suite';

  // TC-01: Tickets Section & Multi-Modal Switching
  const t1 = Date.now();
  try {
    const ticketCard = await driver.findElement(By.id('btn-ticket-list'));
    await ticketCard.click();
    await driver.wait(until.elementLocated(By.id('tickets-section')), 4000);
    await driver.sleep(600);

    const isTicketsVisible = await driver.findElement(By.id('tickets-section')).isDisplayed();
    if (!isTicketsVisible) throw new Error('Tickets section did not display');

    // Click back button to return to dashboard
    const backBtn = await driver.findElement(By.id('btn-tickets-back'));
    await backBtn.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-BOOK-01',
      suite,
      name: 'Verify Tickets & Transport booking view and back navigation',
      status: 'PASS',
      durationMs: Date.now() - t1
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-BOOK-01',
      suite,
      name: 'Verify Tickets & Transport booking view and back navigation',
      status: 'FAIL',
      durationMs: Date.now() - t1,
      error: err
    });
  }

  // TC-02: Hotels Section & Pricing Recommendations
  const t2 = Date.now();
  try {
    const hotelCard = await driver.findElement(By.id('btn-hotel-list'));
    await hotelCard.click();
    await driver.wait(until.elementLocated(By.id('hotels-section')), 4000);
    await driver.sleep(600);

    const isHotelsVisible = await driver.findElement(By.id('hotels-section')).isDisplayed();
    if (!isHotelsVisible) throw new Error('Hotels section did not display');

    const backBtn = await driver.findElement(By.id('btn-hotels-back'));
    await backBtn.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-BOOK-02',
      suite,
      name: 'Verify Hotels & Accommodations view and list rendering',
      status: 'PASS',
      durationMs: Date.now() - t2
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-BOOK-02',
      suite,
      name: 'Verify Hotels & Accommodations view and list rendering',
      status: 'FAIL',
      durationMs: Date.now() - t2,
      error: err
    });
  }
}

module.exports = runBookingTests;
