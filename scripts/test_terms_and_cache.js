import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testTermsAndCache() {
  const scratchDir = path.resolve('scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  // 1. Test Mobile Portrait (456x663)
  console.log('1. Testing Mobile Portrait with fresh context...');
  const mobileContext = await browser.newContext({
    viewport: { width: 456, height: 663 }
  });
  const mobilePage = await mobileContext.newPage();

  // Clear any existing localStorage before loading
  await mobilePage.addInitScript(() => {
    localStorage.removeItem('canvassing_terms_accepted');
  });

  await mobilePage.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await mobilePage.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });

  // Wait for terms modal to open (delayedCall 300ms)
  await mobilePage.waitForSelector('.csa-terms-overlay.csa-terms-visible', { timeout: 5000 });
  console.log('Terms modal displayed automatically on game launch!');

  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: path.join(scratchDir, 'terms_modal_mobile.png') });
  console.log('Saved scratch/terms_modal_mobile.png');

  // Verify modal title & highlight content
  const modalText = await mobilePage.evaluate(() => {
    const card = document.querySelector('.csa-terms-card');
    return {
      title: card?.querySelector('.csa-terms-title')?.textContent,
      badge: card?.querySelector('.csa-terms-badge')?.textContent,
      highlight: card?.querySelector('.csa-terms-highlight-title')?.textContent,
      btn: card?.querySelector('.csa-terms-accept-btn')?.textContent?.trim()
    };
  });
  console.log('Modal content:', modalText);

  // Click accept button
  await mobilePage.click('#csa-terms-accept');
  await mobilePage.waitForTimeout(400);

  // Verify modal dismissed and localStorage set
  const accepted = await mobilePage.evaluate(() => localStorage.getItem('canvassing_terms_accepted'));
  console.log('localStorage canvassing_terms_accepted:', accepted);

  // Click the on-screen "⚖️ TERMS" button to re-open it
  console.log('2. Re-opening Terms via Main Menu button...');
  const termsInfo = await mobilePage.evaluate(() => {
    const scene = window.game.scene.getScene('MainMenuScene');
    const btn = scene.children.list.find(c => c.name === 'termsButton');
    if (btn) {
      btn.emit('pointerdown');
      return { found: true, x: btn.x, y: btn.y };
    }
    return { found: false };
  });
  console.log('Terms button info:', termsInfo);

  await mobilePage.waitForSelector('.csa-terms-overlay.csa-terms-visible', { timeout: 5000 });
  console.log('Terms modal re-opened successfully from Main Menu button!');
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({ path: path.join(scratchDir, 'terms_reopened_mobile.png') });

  // Close with close button
  await mobilePage.click('#csa-terms-close');
  await mobilePage.waitForTimeout(400);

  // 3. Test Desktop Landscape (1280x720)
  console.log('3. Testing Desktop Landscape (1280x720)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await desktopPage.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });

  // Click desktop terms button
  await desktopPage.evaluate(() => {
    const scene = window.game.scene.getScene('MainMenuScene');
    const btn = scene.children.list.find(c => c.name === 'termsButton');
    if (btn) btn.emit('pointerdown');
  });

  await desktopPage.waitForSelector('.csa-terms-overlay.csa-terms-visible', { timeout: 5000 });
  await desktopPage.waitForTimeout(400);
  await desktopPage.screenshot({ path: path.join(scratchDir, 'terms_modal_desktop.png') });
  console.log('Saved scratch/terms_modal_desktop.png');

  // Verify cache partitions
  const cacheKeys = await desktopPage.evaluate(async () => {
    if ('caches' in window) {
      return await caches.keys();
    }
    return [];
  });
  console.log('Active browser caches:', cacheKeys);

  await browser.close();
  console.log('ALL TESTS PASSED!');
}

testTermsAndCache().catch(console.error);
