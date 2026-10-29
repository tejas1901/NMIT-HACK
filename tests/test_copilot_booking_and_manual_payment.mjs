import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // If on landing, click Launch Workspace
  const enterBtn = await page.$('button:has-text("Launch Mission Control"), button:has-text("Open Workspace"), button:has-text("Enter Demo")');
  if (enterBtn) {
    await enterBtn.click();
    await page.waitForTimeout(1000);
  }

  // Switch to customer role if needed
  const switchRole = async (targetRole) => {
    const rolePill = await page.$('header button:has-text("CUSTOMER"), header button:has-text("ADMIN"), aside button:has-text("CUSTOMER"), aside button:has-text("ADMIN")');
    if (rolePill) {
      await rolePill.click();
      await page.waitForTimeout(500);
      const targetBtn = await page.$(`button:has-text("${targetRole.toUpperCase()}")`);
      if (targetBtn) {
        await targetBtn.click();
        await page.waitForTimeout(800);
      }
    }
  };

  await switchRole('CUSTOMER');
  await page.waitForTimeout(1000);

  // Navigate to QpiAi Copilot
  console.log('Navigating to QpiAi Copilot...');
  const copilotTab = await page.$('aside button:has-text("QpiAi Copilot")');
  if (copilotTab) {
    await copilotTab.click();
    await page.waitForTimeout(1200);
  }

  // Take screenshot of Copilot view
  await page.screenshot({ path: 'screenshots/copilot_simple_view.png' });
  console.log('Saved screenshots/copilot_simple_view.png');

  // Send a booking request: "Book a haul from Mumbai to Pune"
  console.log('Typing booking request in Copilot...');
  const inputSelector = 'input[placeholder*="Ask about"]';
  await page.fill(inputSelector, 'Book a haul from Mumbai to Pune');
  await page.press(inputSelector, 'Enter');

  // Wait for the Copilot response and payment modal trigger
  console.log('Waiting for Copilot response and Payment Modal...');
  await page.waitForTimeout(1800);

  // Verify Payment Modal opened
  const paymentModalHeader = await page.$('h2:has-text("FreightIQ Secure Checkout"), h3:has-text("FreightIQ Secure Checkout")');
  console.log('Payment modal header found:', !!paymentModalHeader);

  // Take screenshot of opened Payment Modal with empty fields
  await page.screenshot({ path: 'screenshots/copilot_triggered_payment_modal.png' });
  console.log('Saved screenshots/copilot_triggered_payment_modal.png');

  // Inspect Cardholder Name and Card Number values in Payment Modal
  const cardNameInput = await page.$('input[placeholder="Full Name as on Card"]');
  const cardNumberInput = await page.$('input[placeholder="4000 1234 5678 9010"]');
  const cardExpiryInput = await page.$('input[placeholder="12/28"]');
  const cardCvcInput = await page.$('input[placeholder="•••"]');

  const cardNameVal = await cardNameInput?.inputValue();
  const cardNumberVal = await cardNumberInput?.inputValue();
  const cardExpiryVal = await cardExpiryInput?.inputValue();
  const cardCvcVal = await cardCvcInput?.inputValue();

  console.log('Values in Payment Modal:');
  console.log('Cardholder Name:', JSON.stringify(cardNameVal));
  console.log('Card Number:', JSON.stringify(cardNumberVal));
  console.log('Card Expiry:', JSON.stringify(cardExpiryVal));
  console.log('Card CVC:', JSON.stringify(cardCvcVal));

  if (cardNameVal === '' && cardNumberVal === '' && cardExpiryVal === '' && cardCvcVal === '') {
    console.log('SUCCESS: All payment fields are completely BLANK with no pre-filled data!');
  } else {
    console.warn('WARNING: Some fields still have pre-filled data!');
  }

  // Test manual entry
  console.log('Testing manual entry by customer...');
  await cardNameInput?.fill('Tejas S');
  await cardNumberInput?.fill('4532 9821 0021 8842');
  await cardExpiryInput?.fill('09/28');
  await cardCvcInput?.fill('789');

  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/manual_payment_entry_filled.png' });
  console.log('Saved screenshots/manual_payment_entry_filled.png');

  await browser.close();
  console.log('All tests finished successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
