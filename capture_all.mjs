import { chromium } from 'playwright';
import path from 'path';

const resolutions = [390, 768, 1280, 1600, 1920];
const loginTestResolutions = [320, 375, 768, 1280];

const pagesToCapture = [
  { name: 'landing', url: 'http://localhost:3000/?page=landing' },
  { name: 'login_user', url: 'http://localhost:3000/?page=login&role=customer' },
  { name: 'login_admin', url: 'http://localhost:3000/?page=login&role=admin' },
  { name: 'customer_portal', url: 'http://localhost:3000/?role=customer' },
  { name: 'admin_portal', url: 'http://localhost:3000/?role=admin' },
];

async function run() {
  const browser = await chromium.launch({ channel: 'chrome' });

  for (const p of pagesToCapture) {
    for (const width of resolutions) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
      });

      await page.goto(p.url, { waitUntil: 'domcontentloaded' });
      // Allow skeleton and initial animations to settle
      await page.waitForTimeout(1600);

      const filePath = path.join('screenshots', `${p.name}_${width}px.png`);
      await page.screenshot({ path: filePath });
      console.log(`Saved ${filePath}`);
      await page.close();
    }
  }

  // Extra step: test login admin overflow at 320 and 375 px specifically
  for (const width of loginTestResolutions) {
    const page = await browser.newPage({
      viewport: { width, height: 800 },
      deviceScaleFactor: 1,
    });
    await page.goto('http://localhost:3000/?page=login&role=admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const filePath = path.join('screenshots', `login_admin_overflow_check_${width}px.png`);
    await page.screenshot({ path: filePath });
    console.log(`Saved overflow check: ${filePath}`);
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
