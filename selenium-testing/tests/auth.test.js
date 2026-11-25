const { By, until } = require('selenium-webdriver');

async function runAuthTests(driver, baseUrl, reporter) {
  const suite = 'Authentication Suite';

  // TC-01: Splash Screen Loading & Auto-Dismiss
  const t1 = Date.now();
  try {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    if (!title.toLowerCase().includes('travelbuddy')) {
      throw new Error(`Unexpected page title: ${title}`);
    }

    // Wait for splash screen to dismiss (or dismiss it by click)
    try {
      const splash = await driver.findElement(By.id('splash-screen'));
      if (await splash.isDisplayed()) {
        await splash.click();
      }
    } catch (e) {
      // Splash already dismissed
    }

    await driver.wait(until.elementLocated(By.id('login-section')), 6000);
    reporter.addResult({
      id: 'TC-SEL-AUTH-01',
      suite,
      name: 'Verify Splash screen transition to Login portal',
      status: 'PASS',
      durationMs: Date.now() - t1
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-AUTH-01',
      suite,
      name: 'Verify Splash screen transition to Login portal',
      status: 'FAIL',
      durationMs: Date.now() - t1,
      error: err
    });
  }

  // TC-02: Form Validation on Empty Inputs
  const t2 = Date.now();
  try {
    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const signInBtn = await driver.findElement(By.id('btn-signin-id'));

    await emailInput.clear();
    await passwordInput.clear();
    await signInBtn.click();

    // Browser HTML5 validation or form remains on login
    const isStillOnLogin = await driver.findElement(By.id('login-section')).isDisplayed();
    if (!isStillOnLogin) throw new Error('Form submitted with empty required fields!');

    reporter.addResult({
      id: 'TC-SEL-AUTH-02',
      suite,
      name: 'Verify required form validation on empty login credentials',
      status: 'PASS',
      durationMs: Date.now() - t2
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-AUTH-02',
      suite,
      name: 'Verify required form validation on empty login credentials',
      status: 'FAIL',
      durationMs: Date.now() - t2,
      error: err
    });
  }

  // TC-03: Switch to Signup Section & Back
  const t3 = Date.now();
  try {
    const signupLink = await driver.findElement(By.id('signup-link-id'));
    await signupLink.click();
    await driver.wait(until.elementLocated(By.id('signup-section')), 4000);

    const isSignupVisible = await driver.findElement(By.id('signup-section')).isDisplayed();
    if (!isSignupVisible) throw new Error('Signup section did not display after clicking Sign Up');

    const backBtn = await driver.findElement(By.id('btn-signup-back'));
    await backBtn.click();
    await driver.sleep(500);

    const isLoginVisible = await driver.findElement(By.id('login-section')).isDisplayed();
    if (!isLoginVisible) throw new Error('Failed to navigate back to login section');

    reporter.addResult({
      id: 'TC-SEL-AUTH-03',
      suite,
      name: 'Verify navigation between Sign In and Sign Up views',
      status: 'PASS',
      durationMs: Date.now() - t3
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-AUTH-03',
      suite,
      name: 'Verify navigation between Sign In and Sign Up views',
      status: 'FAIL',
      durationMs: Date.now() - t3,
      error: err
    });
  }

  // TC-04: Continue as Guest into Dashboard
  const t4 = Date.now();
  try {
    const guestBtn = await driver.findElement(By.id('btn-guest-id'));
    await guestBtn.click();
    await driver.wait(until.elementLocated(By.id('dashboard-section')), 5000);

    const isDashboardVisible = await driver.findElement(By.id('dashboard-section')).isDisplayed();
    if (!isDashboardVisible) throw new Error('Dashboard section was not visible after Guest login');

    reporter.addResult({
      id: 'TC-SEL-AUTH-04',
      suite,
      name: 'Verify "Continue as Guest" successfully enters Dashboard',
      status: 'PASS',
      durationMs: Date.now() - t4
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-AUTH-04',
      suite,
      name: 'Verify "Continue as Guest" successfully enters Dashboard',
      status: 'FAIL',
      durationMs: Date.now() - t4,
      error: err
    });
  }
}

module.exports = runAuthTests;
