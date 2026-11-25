const { By, until } = require('selenium-webdriver');

async function runAiAssistantTests(driver, baseUrl, reporter) {
  const suite = 'AI Travel Assistant Suite';

  // TC-01: Open Ask Buddy Chat Modal & Send Message
  const t1 = Date.now();
  try {
    const buddyCard = await driver.findElement(By.id('btn-buddy-plan'));
    await buddyCard.click();
    await driver.sleep(600);

    const chatInputField = await driver.findElement(By.id('chat-input-field'));
    await chatInputField.sendKeys('What are top attractions in Rome?');

    const sendBtn = await driver.findElement(By.id('btn-chat-send-id'));
    await sendBtn.click();
    await driver.sleep(1200);

    // Close chat modal
    const closeBtn = await driver.findElement(By.id('btn-chat-close-id'));
    await closeBtn.click();
    await driver.sleep(500);

    reporter.addResult({
      id: 'TC-SEL-AI-01',
      suite,
      name: 'Verify Ask Buddy AI chat modal interaction and query submission',
      status: 'PASS',
      durationMs: Date.now() - t1
    });
  } catch (err) {
    reporter.addResult({
      id: 'TC-SEL-AI-01',
      suite,
      name: 'Verify Ask Buddy AI chat modal interaction and query submission',
      status: 'FAIL',
      durationMs: Date.now() - t1,
      error: err
    });
  }
}

module.exports = runAiAssistantTests;
