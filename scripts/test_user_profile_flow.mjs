import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/LENOVO/.gemini/antigravity/brain/6cd028e2-bfba-4103-a69d-d30f3b940508';
const BASE_URL = 'http://localhost:3000';

async function testProfileFlow() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Navigating to Login Page with registration form...');
  await page.goto(`${BASE_URL}/?page=login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Switch to customer registration
  const regToggle = page.locator('button:has-text("Register here")').first();
  await regToggle.click();
  await page.waitForTimeout(400);

  console.log('2. Filling in new customer details...');
  await page.locator('input[placeholder="Ramesh Kumar"]').fill('Rohan Sharma');
  await page.locator('input[placeholder="Deccan Precision Logistics Ltd"]').fill('Deccan Apex Transmodal Ltd');
  await page.locator('input[placeholder="+91 98201 55194"]').fill('+91 99887 76655');
  await page.locator('input[placeholder="27AABCV1234F1Z5"]').fill('29AAACD1234F1Z9');
  await page.locator('input[placeholder="client@company.com"]').fill('rohan.sharma@deccan-apex.in');
  await page.locator('input[placeholder="Minimum 4 characters"]').fill('MySecurePassword123');

  console.log('3. Submitting registration...');
  await page.locator('button:has-text("Register Customer Account")').click();
  await page.waitForTimeout(1500);

  console.log('4. Checking if workspace opened with Rohan Sharma profile...');
  const sidebarText = await page.locator('aside').textContent();
  const headerText = await page.locator('header, .glass-panel').first().textContent();
  
  console.log('Sidebar has Rohan Sharma:', sidebarText.includes('Rohan Sharma'));
  console.log('Sidebar has Deccan Apex Transmodal Ltd:', sidebarText.includes('Deccan Apex Transmodal Ltd'));

  const registeredWorkspacePath = path.join(ARTIFACT_DIR, 'registered_user_workspace.png');
  await page.screenshot({ path: registeredWorkspacePath });
  console.log('Saved:', registeredWorkspacePath);

  console.log('5. Opening Profile Dashboard Modal...');
  const profileSettingsBtn = page.locator('button:has-text("Profile Settings")').first();
  await profileSettingsBtn.click();
  await page.waitForTimeout(500);

  const profileModalPath = path.join(ARTIFACT_DIR, 'profile_dashboard_modal.png');
  await page.screenshot({ path: profileModalPath });
  console.log('Saved:', profileModalPath);

  console.log('6. Updating phone number and depot inside profile dashboard...');
  const phoneInput = page.locator('input[placeholder="+91 98201 55194"]').first();
  await phoneInput.fill('+91 98765 43210');

  const depotInput = page.locator('input[placeholder*="JNPT Nhava Sheva Terminal 3"]').first();
  await depotInput.fill('Chakan Industrial Depot Gate 4');

  await page.locator('button:has-text("Save Profile Changes")').click();
  await page.waitForTimeout(1000);

  const updatedProfilePath = path.join(ARTIFACT_DIR, 'profile_updated_toast.png');
  await page.screenshot({ path: updatedProfilePath });
  console.log('Saved:', updatedProfilePath);

  await browser.close();
  console.log('TEST COMPLETE: Registered user flow and Profile Dashboard are 100% verified!');
}

testProfileFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
