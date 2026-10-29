import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/LENOVO/.gemini/antigravity/brain/6cd028e2-bfba-4103-a69d-d30f3b940508';
const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { width: 390, height: 844, name: '390px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1280, height: 800, name: '1280px' },
  { width: 1600, height: 900, name: '1600px' }
];

async function scanForDollars(page, contextName) {
  const matches = await page.evaluate(() => {
    const found = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walk.nextNode())) {
      const val = node.nodeValue?.trim() || '';
      if (!val) continue;
      if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) continue;
      if (/\$|USD/i.test(val)) {
        found.push({
          parentTag: node.parentElement?.tagName,
          className: node.parentElement?.className,
          text: val
        });
      }
    }
    return found;
  });

  if (matches.length > 0) {
    console.warn(`[WARNING] Found USD/$ references in ${contextName}:`, JSON.stringify(matches, null, 2));
  } else {
    console.log(`[VERIFIED 100% INR] 0 USD/$ matches in ${contextName}`);
  }
  return matches;
}

async function run() {
  // Obtain elevation token directly from gateway to verify server integration
  const authRes = await fetch('http://localhost:3001/api/auth/admin-elevate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'Admin#FreightIQ2026!', userId: 'rajathgowda' })
  });
  const authData = await authRes.json();
  if (!authData.token) {
    throw new Error('Failed to obtain admin elevation token from gateway');
  }
  const adminElevationToken = authData.token;
  console.log(`Gateway Elevation Token successfully issued: ${adminElevationToken.substring(0, 25)}...`);

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  let totalDiscrepancies = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n======================================================`);
    console.log(`RUNNING FULL SUITE FOR VIEWPORT: ${vp.width}x${vp.height} (${vp.name})`);
    console.log(`======================================================`);

    // ----------------------------------------------------
    // SECTION A: CUSTOMER PORTAL VIEWS
    // ----------------------------------------------------
    const custContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });
    const page = await custContext.newPage();

    // 1. Customer Shipments (Default View)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const shipmentsPath = path.join(ARTIFACT_DIR, `customer_shipments_${vp.name}.png`);
    await page.screenshot({ path: shipmentsPath, fullPage: true });
    console.log(`Saved: customer_shipments_${vp.name}.png`);
    const d1 = await scanForDollars(page, `Customer Shipments (${vp.name})`);
    totalDiscrepancies += d1.length;

    // 2. Role Switcher Modal & Elevation Prompt
    const switchRoleBtn = vp.width >= 768
      ? page.locator('button:has-text("Switch Role"), aside button:has-text("Customer Mode")').first()
      : page.locator('.md\\:hidden button[aria-label="Switch Demo Role"]').first();
    await switchRoleBtn.click();
    await page.waitForTimeout(300);

    const adminPanelCard = page.locator('h3:has-text("Admin Panel")').first();
    await adminPanelCard.click();
    await page.waitForTimeout(300);

    const modalPath = path.join(ARTIFACT_DIR, `role_switcher_modal_${vp.name}.png`);
    await page.screenshot({ path: modalPath });
    console.log(`Saved: role_switcher_modal_${vp.name}.png`);
    const dModal = await scanForDollars(page, `Role Switcher Modal (${vp.name})`);
    totalDiscrepancies += dModal.length;

    // Reload page to reset modal cleanly
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // 3. Customer Tracking ("Live GPS Radar")
    if (vp.width >= 768) {
      await page.locator('aside button:has-text("Live GPS Radar")').first().click();
    } else {
      await page.locator('.md\\:hidden button[aria-label="Live GPS Radar"]').first().click();
    }
    await page.waitForTimeout(600);
    const trackingPath = path.join(ARTIFACT_DIR, `customer_tracking_${vp.name}.png`);
    await page.screenshot({ path: trackingPath, fullPage: true });
    console.log(`Saved: customer_tracking_${vp.name}.png`);
    const d2 = await scanForDollars(page, `Customer Tracking (${vp.name})`);
    totalDiscrepancies += d2.length;

    // 4. Customer Book ("Request Haul")
    if (vp.width >= 768) {
      await page.locator('aside button:has-text("Request Haul")').first().click();
    } else {
      await page.locator('.md\\:hidden button[aria-label="Request Haul"]').first().click();
    }
    await page.waitForTimeout(600);
    const bookPath = path.join(ARTIFACT_DIR, `customer_book_${vp.name}.png`);
    await page.screenshot({ path: bookPath, fullPage: true });
    console.log(`Saved: customer_book_${vp.name}.png`);
    const d3 = await scanForDollars(page, `Customer Book (${vp.name})`);
    totalDiscrepancies += d3.length;

    // 5. Truck Marketplace ("Buy Trucks")
    if (vp.width >= 768) {
      await page.locator('aside button:has-text("Buy Trucks")').first().click();
    } else {
      await page.locator('.md\\:hidden button[aria-label="Buy Trucks"]').first().click();
    }
    await page.waitForTimeout(600);
    const trucksPath = path.join(ARTIFACT_DIR, `truck_marketplace_${vp.name}.png`);
    await page.screenshot({ path: trucksPath, fullPage: true });
    console.log(`Saved: truck_marketplace_${vp.name}.png`);
    const d4 = await scanForDollars(page, `Truck Marketplace (${vp.name})`);
    totalDiscrepancies += d4.length;

    // 6. Customer Fleet Orders ("My Fleet Orders")
    if (vp.width >= 768) {
      await page.locator('aside button:has-text("My Fleet Orders")').first().click();
    } else {
      await page.locator('.md\\:hidden button[aria-label="My Fleet Orders"]').first().click();
    }
    await page.waitForTimeout(600);
    const ordersPath = path.join(ARTIFACT_DIR, `customer_fleet_orders_${vp.name}.png`);
    await page.screenshot({ path: ordersPath, fullPage: true });
    console.log(`Saved: customer_fleet_orders_${vp.name}.png`);
    const d5 = await scanForDollars(page, `Customer Fleet Orders (${vp.name})`);
    totalDiscrepancies += d5.length;

    await custContext.close();

    // ----------------------------------------------------
    // SECTION B: ADMIN PORTAL VIEWS (ELEVATED SESSION)
    // ----------------------------------------------------
    const adminContext = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });
    const adminPage = await adminContext.newPage();
    // Inject verified elevation token into browser session
    await adminPage.addInitScript((token) => {
      sessionStorage.setItem('freightiq_admin_token', token);
    }, adminElevationToken);

    await adminPage.goto(`${BASE_URL}/?role=admin`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(800);

    // 7. Admin Operations Tower View
    const adminTowerPath = path.join(ARTIFACT_DIR, `admin_tower_${vp.name}.png`);
    await adminPage.screenshot({ path: adminTowerPath, fullPage: true });
    console.log(`Saved: admin_tower_${vp.name}.png`);
    const dAdmin1 = await scanForDollars(adminPage, `Admin Tower (${vp.name})`);
    totalDiscrepancies += dAdmin1.length;

    // 8. Admin All Consignments View
    if (vp.width >= 768) {
      await adminPage.locator('aside button:has-text("All Shipments")').first().click();
    } else {
      await adminPage.locator('.md\\:hidden button[aria-label="All Shipments"]').first().click();
    }
    await adminPage.waitForTimeout(600);
    const adminShipmentsPath = path.join(ARTIFACT_DIR, `admin_all_shipments_${vp.name}.png`);
    await adminPage.screenshot({ path: adminShipmentsPath, fullPage: true });
    console.log(`Saved: admin_all_shipments_${vp.name}.png`);
    const dAdmin2 = await scanForDollars(adminPage, `Admin All Shipments (${vp.name})`);
    totalDiscrepancies += dAdmin2.length;

    await adminContext.close();
  }

  await browser.close();
  console.log(`\n======================================================`);
  console.log(`ALL SCREENSHOTS CAPTURED & DOM CURRENCY SCANS FINISHED.`);
  console.log(`Total Remaining USD / $ Discrepancies: ${totalDiscrepancies}`);
  console.log(`======================================================`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
