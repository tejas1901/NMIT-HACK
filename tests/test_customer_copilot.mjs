import { chromium } from 'playwright';

async function testCustomerCopilot() {
  console.log("=== Testing Customer Access to QpiAi Copilot ===");

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Switch to Customer role if not already
  const switchBtn = page.locator('button:has-text("Switch: Shipper Portal"), button:has-text("Switch: Admin Operations"), button:has-text("Switch Console")').first();
  const bodyText = await page.textContent('body');
  if (bodyText.includes('ADMIN OPERATIONS') || bodyText.includes('Rajathgowda')) {
    console.log("Switching to Customer (Ananya Verma)...");
    const roleSwitcher = page.locator('button:has-text("Switch: Shipper Portal")').first();
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      await page.waitForTimeout(1000);
      const customerRole = page.locator('text=Commercial Shipper Client').first();
      if (await customerRole.isVisible()) {
        await customerRole.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  // Verify 'QpiAi Copilot' navigation button in customer sidebar
  console.log("Checking customer sidebar for 'QpiAi Copilot'...");
  const copilotNav = page.locator('button:has-text("QpiAi Copilot")').first();
  await copilotNav.waitFor({ state: 'visible', timeout: 5000 });
  console.log("[+] 'QpiAi Copilot' nav item is visible in Customer sidebar!");

  // Click on QpiAi Copilot
  await copilotNav.click();
  await page.waitForTimeout(1500);

  // Verify QpiAi Pilot view loaded
  const copilotHeader = page.locator('text=QpiAi Pilot').first();
  await copilotHeader.waitFor({ state: 'visible', timeout: 5000 });
  console.log("[+] QpiAi Copilot chat workspace loaded successfully!");

  // Test sending a query
  const quickChip = page.locator('button:has-text("NH-48 Corridor Weather Analysis")').first();
  if (await quickChip.isVisible()) {
    console.log("Clicking quick chip: NH-48 Corridor Weather Analysis...");
    await quickChip.click();
    await page.waitForTimeout(2000);
  }

  // Take screenshot
  await page.screenshot({ path: 'screenshots/customer_copilot_verified.png', fullPage: true });
  console.log("[+] Captured screenshots/customer_copilot_verified.png");

  await browser.close();
  console.log("=== Customer Access to QpiAi Copilot PASSED! ===");
}

testCustomerCopilot().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
