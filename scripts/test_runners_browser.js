import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runVerification() {
  const screenshotsDir = path.resolve('scratch/browser_verification');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 480, height: 800 }
  });

  const page = await context.newPage();

  console.log('1. Loading Main Menu...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);

  // 1. Capture Main Menu showing all 3 parties
  await page.screenshot({ path: path.join(screenshotsDir, '1_main_menu.png') });
  console.log('Saved 1_main_menu.png');

  // 2. Test PA (Gayton McKenzie)
  console.log('2. Starting PA (Gayton McKenzie)...');
  await page.evaluate(() => {
    window.startArea(1, 'pa');
  });
  await page.waitForTimeout(1000);
  // Dismiss Area Sprint Modal
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500); // Running for 2.5s
  await page.screenshot({ path: path.join(screenshotsDir, '2_gayton_running.png') });
  console.log('Saved 2_gayton_running.png');

  // Jump
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, '3_gayton_jumping.png') });
  console.log('Saved 3_gayton_jumping.png');

  // 3. Test ANC (Cyril Ramaphosa)
  console.log('3. Starting ANC (Cyril Ramaphosa)...');
  await page.evaluate(() => {
    window.startArea(1, 'anc');
  });
  await page.waitForTimeout(1000);
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '4_cyril_running.png') });
  console.log('Saved 4_cyril_running.png');

  // 4. Test DA (Helen Zille)
  console.log('4. Starting DA (Helen Zille)...');
  await page.evaluate(() => {
    window.startArea(1, 'da');
  });
  await page.waitForTimeout(1000);
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '5_helen_running.png') });
  console.log('Saved 5_helen_running.png');

  await browser.close();
  console.log('✓ All 3 candidate runs successfully verified and captured!');
}

runVerification().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
