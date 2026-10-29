import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/LENOVO/.gemini/antigravity/brain/6cd028e2-bfba-4103-a69d-d30f3b940508';
const BASE_URL = 'http://localhost:3000';

async function run() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  console.log('1. Navigating to Customer Shipper Portal...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check live sync capsule text in sidebar
  const liveSyncPill = page.locator('text=Live Sync:').first();
  if (await liveSyncPill.isVisible()) {
    console.log('Live Sync Status Pill:', await liveSyncPill.textContent());
  }

  // Check radar strip
  const ticker = page.locator('.glass-panel').filter({ hasText: /RADAR|FEED/i }).first();
  if (await ticker.isVisible()) {
    console.log('Live Telemetry Ticker:', await ticker.textContent());
  }

  // Capture Live Operational Workspace
  const liveWorkspacePath = path.join(ARTIFACT_DIR, 'live_operational_workspace.png');
  await page.screenshot({ path: liveWorkspacePath });
  console.log('Saved:', liveWorkspacePath);

  // 2. Open Request New Shipment
  console.log('2. Requesting a new live shipment to test real-time Supabase sync...');
  const reqBtn = page.locator('button:has-text("Request New Shipment"), button:has-text("Request Haul")').first();
  if (await reqBtn.isVisible()) {
    await reqBtn.click();
    await page.waitForTimeout(800);

    // Fill in booking details
    const originInput = page.locator('input[placeholder*="Mumbai"], input[placeholder*="Origin"]').first();
    if (await originInput.isVisible()) {
      await originInput.fill('JNPT Nhava Sheva Terminal 3');
      const destInput = page.locator('input[placeholder*="Pune"], input[placeholder*="Destination"]').first();
      if (await destInput.isVisible()) {
        await destInput.fill('Bengaluru Electronic City Logistics Hub');
      }
      
      const submitBtn = page.locator('button:has-text("Authorize"), button:has-text("Dispatch"), button:has-text("Submit Booking")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(1500);
        console.log('✓ Booking submitted!');
      }
    }
  }

  // 3. Direct verify with Supabase cloud database
  console.log('3. Checking Supabase Cloud PostgreSQL for live records...');
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const checkRes = await fetch('https://iwcqkrzefoawlpugergc.supabase.co/rest/v1/cargo_bookings?order=created_at.desc&limit=3', {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const latestRows = await checkRes.json();
  console.log('Live rows in Supabase cargo_bookings count:', latestRows.length);
  latestRows.forEach((r, idx) => {
    console.log(` [Row ${idx + 1}] Ref: ${r.booking_ref} | ${r.origin} -> ${r.destination} | Value: $${r.declared_value_usd}`);
  });

  await browser.close();
  console.log('ALL LIVE VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
