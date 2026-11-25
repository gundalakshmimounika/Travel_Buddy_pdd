const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const edge = require('selenium-webdriver/edge');

class DriverFactory {
  static async createDriver(headless = true, preferredBrowser = 'auto') {
    const isWindows = process.platform === 'win32';
    const isLinux = process.platform === 'linux';

    // 1. On Linux (e.g. GitHub Actions ubuntu-latest), Google Chrome is preinstalled and preferred
    if (isLinux || preferredBrowser === 'chrome') {
      try {
        console.log('[DriverFactory] Attempting to launch Google Chrome WebDriver...');
        const chromeOptions = new chrome.Options();
        if (headless) {
          chromeOptions.addArguments('--headless=new');
        }
        chromeOptions.addArguments('--no-sandbox');
        chromeOptions.addArguments('--disable-dev-shm-usage');
        chromeOptions.addArguments('--disable-gpu');
        chromeOptions.addArguments('--window-size=1400,900');
        chromeOptions.addArguments('--disable-search-engine-choice-screen');

        const driver = await new Builder()
          .forBrowser('chrome')
          .setChromeOptions(chromeOptions)
          .build();

        await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000, script: 10000 });
        console.log('[DriverFactory] Google Chrome WebDriver started successfully.');
        return driver;
      } catch (chromeErr) {
        console.log('[DriverFactory] Chrome launch error:', chromeErr.message);
        if (preferredBrowser === 'chrome') throw chromeErr;
      }
    }

    // 2. On Windows or fallback, try Microsoft Edge
    if (isWindows || preferredBrowser === 'edge' || preferredBrowser === 'auto') {
      try {
        console.log('[DriverFactory] Attempting to launch Microsoft Edge WebDriver...');
        const edgeOptions = new edge.Options();
        if (headless) {
          edgeOptions.addArguments('--headless=new');
        }
        edgeOptions.addArguments('--no-sandbox');
        edgeOptions.addArguments('--disable-dev-shm-usage');
        edgeOptions.addArguments('--disable-gpu');
        edgeOptions.addArguments('--window-size=1400,900');
        edgeOptions.addArguments('--disable-search-engine-choice-screen');

        const driver = await new Builder()
          .forBrowser('MicrosoftEdge')
          .setEdgeOptions(edgeOptions)
          .build();

        await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000, script: 10000 });
        console.log('[DriverFactory] Microsoft Edge WebDriver started successfully.');
        return driver;
      } catch (edgeErr) {
        console.log('[DriverFactory] Edge launch error:', edgeErr.message);
      }
    }

    // 3. Fallback to Chrome on any platform
    try {
      console.log('[DriverFactory] Fallback: Launching Chrome...');
      const chromeOptions = new chrome.Options();
      if (headless) {
        chromeOptions.addArguments('--headless=new');
      }
      chromeOptions.addArguments('--no-sandbox');
      chromeOptions.addArguments('--disable-dev-shm-usage');
      chromeOptions.addArguments('--disable-gpu');
      chromeOptions.addArguments('--window-size=1400,900');
      chromeOptions.addArguments('--disable-search-engine-choice-screen');

      const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

      await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000, script: 10000 });
      console.log('[DriverFactory] Fallback Google Chrome WebDriver started.');
      return driver;
    } catch (finalErr) {
      console.error('[DriverFactory] All browser driver initializations failed:', finalErr.message);
      throw finalErr;
    }
  }
}

module.exports = DriverFactory;
