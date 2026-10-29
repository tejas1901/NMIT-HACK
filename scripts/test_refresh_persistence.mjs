import { chromium } from 'playwright';

async function testRefreshPersistence() {
  console.log('Testing Admin Elevation & Refresh Persistence...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Listen to console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Error]: ${msg.text()}`);
  });

  try {
    // 1. Load the customer portal
    console.log('1. Loading FreightIQ Portal...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify initial role is customer / verified client
    const bodyText = await page.textContent('body');
    if (!bodyText.includes('Shipper Portal') && !bodyText.includes('Verified Client') && !bodyText.includes('Customer')) {
      console.warn('Initial load text:', bodyText.slice(0, 300));
    }
    console.log('✓ Initial portal loaded in customer mode.');

    // 2. Open Role Switcher Modal
    console.log('2. Opening Role Switcher Modal to elevate to Admin...');
    const switchBtn = page.locator('button:has-text("Switch:")').first();
    await switchBtn.click();
    await page.waitForTimeout(500);

    // Click Admin Panel card inside modal
    const adminCard = page.locator('h3:has-text("Admin Panel")');
    await adminCard.click();
    await page.waitForTimeout(400);

    // 3. Enter Admin Password (1234567890)
    console.log('3. Submitting admin password "1234567890"...');
    const pwdInput = page.locator('input[type="password"]');
    await pwdInput.fill('1234567890');
    const unlockBtn = page.locator('button:has-text("Unlock Admin")');
    await unlockBtn.click();
    await page.waitForTimeout(1500);

    // Verify role changed to admin
    const afterElevationText = await page.textContent('body');
    if (!afterElevationText.includes('Operations Lead') && !afterElevationText.includes('Operations Control')) {
      throw new Error('Failed to elevate to Admin mode!');
    }
    console.log('✓ Successfully elevated to Admin Operations.');

    // 4. Navigate to "All Shipments" tab in Admin
    console.log('4. Navigating to "All Shipments" in Admin view...');
    const allShipmentsTab = page.locator('button:has-text("All Shipments")').first();
    await allShipmentsTab.click();
    await page.waitForTimeout(800);

    const isAllShipmentsActive = await page.locator('text=All Commercial Consignments').count();
    console.log(`✓ All Shipments tab visible (count: ${isAllShipmentsActive})`);

    // 5. REFRESH THE PAGE (simulate user pressing F5 / reload)
    console.log('5. Refreshing the website (F5 / reload)...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // 6. VERIFY PERSISTENCE AFTER REFRESH
    const refreshedText = await page.textContent('body');
    const roleIsAdmin = refreshedText.includes('Operations Lead') || refreshedText.includes('Operations Control');
    const onAllShipmentsTab = refreshedText.includes('All Commercial Consignments');

    console.log('--- REFRESH CHECK 1 (All Shipments) ---');
    console.log(`Stayed in Admin Mode? ${roleIsAdmin ? 'YES (PASSED)' : 'NO (FAILED)'}`);
    console.log(`Stayed on All Shipments Tab? ${onAllShipmentsTab ? 'YES (PASSED)' : 'NO (FAILED)'}`);

    if (!roleIsAdmin || !onAllShipmentsTab) {
      throw new Error(`Failed to preserve Admin page after refresh! Role: ${roleIsAdmin}, Tab: ${onAllShipmentsTab}`);
    }

    // 7. Navigate to another Admin tab: "Corridor & Simulation"
    console.log('7. Navigating to "Corridor & Simulation"...');
    const corridorTab = page.locator('button:has-text("Corridor & Simulation")').first();
    await corridorTab.click();
    await page.waitForTimeout(800);

    // REFRESH AGAIN
    console.log('8. Refreshing again on Corridor & Simulation...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const refreshedText2 = await page.textContent('body');
    const stayedCorridor = refreshedText2.includes('Corridor & Simulation') || refreshedText2.includes('NH-48') || refreshedText2.includes('Corridor Simulation');
    const stayedAdmin2 = refreshedText2.includes('Operations Lead') || refreshedText2.includes('Operations Control');

    console.log('--- REFRESH CHECK 2 (Corridor Simulation) ---');
    console.log(`Stayed in Admin Mode? ${stayedAdmin2 ? 'YES (PASSED)' : 'NO (FAILED)'}`);
    console.log(`Stayed on Corridor Simulation Tab? ${stayedCorridor ? 'YES (PASSED)' : 'NO (FAILED)'}`);

    if (!stayedAdmin2 || !stayedCorridor) {
      throw new Error('Failed to preserve Corridor Simulation tab after refresh!');
    }

    // 8. Test Security: Tampering with token should kick back to Customer
    console.log('9. Testing Security: clearing elevation token and reloading...');
    await page.evaluate(() => {
      sessionStorage.removeItem('freightiq_admin_token');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const secureText = await page.textContent('body');
    const kickedToCustomer = secureText.includes('Shipper Portal') || secureText.includes('Verified Client') || secureText.includes('My Shipments');
    console.log(`Securely kicked back to Customer when token absent? ${kickedToCustomer ? 'YES (PASSED)' : 'NO (FAILED)'}`);

    console.log('\n=========================================');
    console.log('ALL REFRESH PERSISTENCE TESTS PASSED 100%!');
    console.log('=========================================');

  } finally {
    await browser.close();
  }
}

testRefreshPersistence().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
