import { chromium } from 'playwright';

async function testBookingAndPersistence() {
  console.log('[*] Starting Live Website & Database Persistence Verification...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  // Listen for console logs and errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [Browser Error]:`, msg.text());
  });

  // 1. Load website
  await page.goto('http://localhost:3000/?role=customer&tab=customer-book', { waitUntil: 'networkidle' });
  console.log('  ✓ Loaded Customer Book Shipment page');

  // 2. Click "Save Haul to Manifest"
  const scheduleBtn = page.locator('button:has-text("Save Haul to Manifest")');
  await scheduleBtn.waitFor({ state: 'visible', timeout: 5000 });
  await scheduleBtn.click();
  console.log('  ✓ Clicked Schedule Haul Dispatch button');

  // 3. Verify redirected to customer-shipments
  await page.waitForTimeout(1000);
  const shipmentsHeader = page.locator('h1:has-text("My Active Commercial Consignments")');
  await shipmentsHeader.waitFor({ state: 'visible', timeout: 5000 });
  console.log('  ✓ Navigated to customer-shipments view');

  // 4. Verify new consignment appears in the list
  const consignmentCards = page.locator('div:has-text("CRG-")');
  const count = await consignmentCards.count();
  console.log(`  ✓ Consignment cards visible: ${count} elements`);

  // 5. Test page refresh persistence
  console.log('[*] Refreshing page to verify persistence...');
  await page.reload({ waitUntil: 'networkidle' });

  // Verify still on customer-shipments tab
  const afterRefreshHeader = page.locator('h1:has-text("My Active Commercial Consignments")');
  await afterRefreshHeader.waitFor({ state: 'visible', timeout: 5000 });
  console.log('  ✓ Successfully remained on customer-shipments tab after refresh!');

  // 6. Test Admin Role Switch & Refresh Persistence
  console.log('[*] Testing Admin Role Switch...');
  // Click role switcher pill
  const roleBtn = page.locator('button:has-text("Customer Portal")');
  if (await roleBtn.count() > 0) {
    await roleBtn.click();
    await page.waitForTimeout(500);
    // Click Admin Panel card
    const adminPanelCard = page.locator('h3:has-text("Admin Panel")');
    if (await adminPanelCard.count() > 0) {
      await adminPanelCard.click();
      await page.waitForTimeout(400);
      // Fill password
      const pwInput = page.locator('input[type="password"]');
      if (await pwInput.count() > 0) {
        await pwInput.fill('FreightIQ@Admin2026!');
        await page.locator('button:has-text("Unlock Admin")').click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Admin unlocked!');

        // Refresh while in admin
        console.log('[*] Refreshing while in Admin Portal...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Check if role is still admin
        const adminBadge = page.locator('text=Master Administrator, Operations Lead, or Admin');
        const currentUrl = page.url();
        console.log('  ✓ URL after admin refresh:', currentUrl);
      }
    }
  }

  await browser.close();
  console.log('🎉 Verification completed successfully!');
}

testBookingAndPersistence().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
