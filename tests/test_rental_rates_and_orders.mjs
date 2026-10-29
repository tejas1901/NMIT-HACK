import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // If on landing or login, switch role or click Launch Workspace
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

  // Navigate to Rent Trucks
  console.log('Navigating to Rent Trucks (marketplace)...');
  const rentTrucksTab = await page.$('aside button:has-text("Rent Trucks")');
  if (rentTrucksTab) {
    await rentTrucksTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/rental_marketplace_view.png', fullPage: true });
    console.log('Saved screenshots/rental_marketplace_view.png');
  }

  // Navigate to My Fleet Rentals
  console.log('Navigating to My Fleet Rentals...');
  const fleetRentalsTab = await page.$('aside button:has-text("My Fleet Rentals")');
  if (fleetRentalsTab) {
    await fleetRentalsTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/customer_fleet_rentals_view.png', fullPage: true });
    console.log('Saved screenshots/customer_fleet_rentals_view.png');
  }

  await browser.close();
  console.log('Verification test completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
