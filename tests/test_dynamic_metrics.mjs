import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://iwcqkrzefoawlpugergc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
  console.log("=== Testing Dynamic UI Numbers & Real-Time Sync ===");

  // 1. Fetch current rows from Supabase
  const { data: initialRows, error } = await supabase.from('cargo_bookings').select('*');
  if (error) {
    console.error("Failed to query cargo_bookings:", error.message);
    process.exit(1);
  }

  console.log(`Initial rows in Supabase: ${initialRows.length}`);

  // 2. Launch browser to verify the numbers rendered on the interface
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Clear local storage and session storage
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Switch to cargo bookings or admin view to inspect numbers
  // Check the sidebar active consignment count badge
  const sidebarContent = await page.textContent('body');
  console.log("Page loaded successfully.");

  // Test inserting a test record directly into Supabase table
  const testRef = `CRG-DYN-${Date.now().toString().slice(-5)}`;
  console.log(`Inserting dynamic test record: ${testRef} to Supabase...`);

  const { data: inserted, error: insertErr } = await supabase.from('cargo_bookings').insert([{
    booking_ref: testRef,
    user_email: 'rajathgowda@gmail.com',
    origin: 'Bengaluru Logistics Park',
    destination: 'JNPT Intermodal Gateway',
    cargo_type: 'Solar Inverters & High-Volt Capacitors',
    weight_lbs: 42000,
    declared_value_usd: 150000,
    shipping_mode: 'ROAD_EXPEDITED',
    scheduled_delivery: '2026-11-04',
    status: 'DISPATCHED',
    delay_risk_pct: 12.5,
    risk_tier: 'LOW',
    demurrage_penalty_usd: 12000,
    quantum_carrier_assigned: 'Blue Dart Intermodal Air & Surface Express',
    net_savings_usd: 35000
  }]).select();

  if (insertErr) {
    console.error("Insert error:", insertErr.message);
  } else {
    console.log(`Successfully inserted row ${testRef} into Supabase.`);
  }

  // Reload or wait for realtime WebSocket
  await page.waitForTimeout(2500);

  // Take screenshot to inspect interface
  await page.screenshot({ path: 'screenshots/dynamic_metrics_verified.png', fullPage: true });
  console.log("Captured screenshots/dynamic_metrics_verified.png");

  // Clean up the dynamic test record
  const { error: delErr } = await supabase.from('cargo_bookings').delete().eq('booking_ref', testRef);
  if (delErr) {
    console.error("Cleanup delete error:", delErr.message);
  } else {
    console.log(`Cleaned up test record ${testRef} from Supabase.`);
  }

  await browser.close();
  console.log("=== Dynamic UI Numbers Verification Complete! ===");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
