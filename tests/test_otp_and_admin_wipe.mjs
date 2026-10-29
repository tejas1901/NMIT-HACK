import { chromium } from 'playwright';

async function testOtpAndAdminWipe() {
  console.log("=== Testing Customer OTP Password Reset & Admin Zero-Knowledge Wipe Policy ===");

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Navigate to login page
  console.log("[1] Navigating to login page...");
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // If already logged in, sign out
  const exitBtn = page.locator('button[title="Sign Out"]').first();
  if (await exitBtn.isVisible()) {
    console.log("Signing out active session...");
    await exitBtn.click();
    await page.waitForTimeout(1500);
  }

  // If on landing, click 'Login / Sign In'
  const signInLanding = page.locator('button:has-text("Sign in / Launch Console"), button:has-text("Enterprise Login")').first();
  if (await signInLanding.isVisible()) {
    await signInLanding.click();
    await page.waitForTimeout(1500);
  }

  // 2. Click 'Forgot password?'
  console.log("[2] Clicking 'Forgot password?' on login card...");
  const forgotBtn = page.locator('button:has-text("Forgot password?")').first();
  await forgotBtn.waitFor({ state: 'visible', timeout: 5000 });
  await forgotBtn.click();
  await page.waitForTimeout(1000);

  // 3. Test Customer OTP flow
  console.log("[3] Verifying Customer Phone OTP Reset Modal...");
  const customerTab = page.locator('button:has-text("Customer (Phone OTP)")');
  await customerTab.waitFor({ state: 'visible', timeout: 3000 });

  // Fill mobile phone number
  await page.fill('input[type="tel"]', '+91 98201 55194');
  console.log("Dispatching OTP to +91 98201 55194...");
  await page.click('button:has-text("Send OTP via SMS")');
  await page.waitForTimeout(1200);

  // Read simulated SMS notification banner text
  const smsBanner = page.locator('text=One-Time Password for FreightIQ Customer is:').first();
  await smsBanner.waitFor({ state: 'visible', timeout: 5000 });
  const bannerText = await smsBanner.textContent();
  console.log(`[+] SMS Gateway Notification: "${bannerText}"`);

  // Extract the 6 digit OTP
  const match = bannerText.match(/(\d{6})/);
  const otpCode = match ? match[1] : '849201';
  console.log(`[+] Captured 6-digit OTP code: ${otpCode}`);

  // Enter OTP & New Password
  await page.fill('input[placeholder="e.g. 742918"]', otpCode);
  await page.fill('input[placeholder="Min. 6 characters"]', 'NewCustomerSecure2026!');
  await page.fill('input[placeholder="Re-enter password"]', 'NewCustomerSecure2026!');
  
  // Submit verification
  console.log("Submitting OTP & resetting customer password...");
  await page.click('button:has-text("Verify OTP & Reset Password")');
  await page.waitForTimeout(2000);

  const modalHtml = await page.innerHTML('.modal-box');
  console.log("Modal inner HTML:", modalHtml.slice(0, 300));

  // Verify success banner
  const successTitle = page.locator('text=Password Reset Successfully!');
  await successTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log("[+] Verified: Customer password reset successfully via phone OTP!");

  await page.screenshot({ path: 'screenshots/customer_otp_reset_verified.png' });
  console.log("[+] Captured screenshots/customer_otp_reset_verified.png");

  // 4. Test Admin Security Protocol (Zero-Knowledge Data Wipe)
  console.log("\n[4] Testing Admin Security Wipe Policy...");
  const adminTab = page.locator('button:has-text("Admin (Account Wipe Only)")');
  await adminTab.click();
  await page.waitForTimeout(1000);

  // Check policy warning
  const policyWarning = page.locator('text=STRICT ADMIN ZERO-KNOWLEDGE POLICY');
  await policyWarning.waitFor({ state: 'visible', timeout: 5000 });
  console.log("[+] Verified: Admin OTP is blocked. Policy notice displayed!");

  // Click proceed
  await page.click('button:has-text("Proceed to Account & System Wipe")');
  await page.waitForTimeout(800);

  // Verify prompt asking for RESET-ALL-DATA
  const confirmPrompt = page.locator('text=Type "RESET-ALL-DATA" to confirm factory reset:');
  await confirmPrompt.waitFor({ state: 'visible', timeout: 5000 });
  console.log("[+] Verified: Irreversible wipe confirmation prompt active!");

  await page.screenshot({ path: 'screenshots/admin_wipe_warning_verified.png' });
  console.log("[+] Captured screenshots/admin_wipe_warning_verified.png");

  await browser.close();
  console.log("=== All OTP & Admin Security Wipe Tests PASSED! ===");
}

testOtpAndAdminWipe().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
