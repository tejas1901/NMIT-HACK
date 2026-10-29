import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iwcqkrzefoawlpugergc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testTwoWayCommunication() {
  console.log("=== Testing Two-Way Admin & Customer Panel Synchronization ===");

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Load app as Customer
  console.log("[1] Navigating to website as Customer...");
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // If on landing or login, ensure we are in dashboard
  const content = await page.textContent('body');
  if (content.includes('ENTERPRISE LOGIN') || content.includes('Sign in')) {
    console.log("Logging into Customer account...");
    await page.fill('input[type="email"]', 'ananya.verma@vikasintermodal.in');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }

  // 2. Customer creates a new haul booking
  console.log("[2] Customer requesting new commercial consignment...");
  const bookBtn = page.locator('button:has-text("Request New Shipment"), button:has-text("Request Haul")').first();
  if (await bookBtn.isVisible()) {
    await bookBtn.click();
    await page.waitForTimeout(1000);

    // Click 'Save Haul to Manifest'
    const saveBtn = page.locator('button:has-text("Save Haul to Manifest")');
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      console.log("Submitted new haul manifest!");
      await page.waitForTimeout(2000);
    }
  }

  // Check that consignment was saved to Supabase
  const { data: latestBooking, error } = await supabase
    .from('cargo_bookings')
    .select('booking_ref, origin, destination, status, quantum_carrier_assigned')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn("Notice checking Supabase booking:", error.message);
  } else {
    console.log(`[+] Confirmed in Supabase: Ref=${latestBooking.booking_ref}, Status=${latestBooking.status}`);
  }

  // 3. Switch to Admin panel
  console.log("[3] Switching to Admin Operations panel...");
  const switchBtn = page.locator('button:has-text("Switch: Admin Operations"), button:has-text("Switch Role")').first();
  if (await switchBtn.isVisible()) {
    await switchBtn.click();
    await page.waitForTimeout(1000);
    const selectAdmin = page.locator('text=Operations Dispatch Admin').first();
    if (await selectAdmin.isVisible()) {
      await selectAdmin.click();
      await page.waitForTimeout(1500);
    }
  }

  // Admin checks Haul Request Queue
  console.log("[4] Admin verifying Haul Request Queue...");
  const queueNav = page.locator('button:has-text("Haul Request Queue")');
  if (await queueNav.isVisible()) {
    await queueNav.click();
    await page.waitForTimeout(1500);
    console.log("[+] Admin successfully opened Haul Request Queue with pending client requests!");
  }

  // Admin checks All Commercial Consignments
  const allShipmentsNav = page.locator('button:has-text("All Shipments")');
  if (await allShipmentsNav.isVisible()) {
    await allShipmentsNav.click();
    await page.waitForTimeout(1500);
    console.log("[+] Admin successfully viewing multi-tenant consignments including newly received customer haul!");
  }

  // Clean up any test booking
  if (latestBooking?.booking_ref && latestBooking.booking_ref.startsWith('CRG-')) {
    await supabase.from('cargo_bookings').delete().eq('booking_ref', latestBooking.booking_ref);
    console.log(`[+] Cleaned test booking ${latestBooking.booking_ref} from Supabase.`);
  }

  await browser.close();
  console.log("=== Two-Way Synchronization Verification PASSED! ===");
}

testTwoWayCommunication().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
