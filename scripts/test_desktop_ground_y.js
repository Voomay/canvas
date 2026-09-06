import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runDesktopTest() {
  const screenshotsDir = path.resolve('scratch/desktop_ground_verification');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  console.log('1. Loading game on Desktop (1280x720)...');
  await page.goto('http://localhost:3005/');
  await page.evaluate(() => {
    localStorage.setItem('canvassing_terms_accepted', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const acceptBtn = await page.$('#csa-terms-accept');
  if (acceptBtn) {
    await acceptBtn.click();
    await page.waitForTimeout(300);
  }

  console.log('2. Starting Area 1 (Hanover Park) on Desktop...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'pa');
  });

  await page.waitForTimeout(1000);

  // Measure positions on desktop
  const initialMetrics = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      groundY: scene.getGroundY(),
      playerY: scene.player.y,
      roadY: scene.parallaxBg.roadTile.y,
      roadHeight: scene.parallaxBg.roadTile.height,
      screenHeight: scene.scale.height,
      screenWidth: scene.scale.width,
      curbsideTaxiY: scene.curbsideTaxi ? scene.curbsideTaxi.y : null
    };
  });
  console.log('Initial Desktop Metrics:', JSON.stringify(initialMetrics, null, 2));

  // Spawn resident and obstacle to see their alignment on the road
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    // Clear existing
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];
    scene.residents.forEach(r => r.destroy());
    scene.residents = [];

    // Spawn obstacle at player + 240
    scene.spawnObstacle();
    if (scene.obstacles[0]) {
      scene.obstacles[0].x = scene.player.x + 240;
    }

    // Spawn resident at player + 540
    scene.spawnResident();
    if (scene.residents[0]) {
      scene.residents[0].x = scene.player.x + 540;
    }
  });

  await page.waitForTimeout(400);

  const afterScreenshot = path.join(screenshotsDir, 'desktop_running_after.png');
  await page.screenshot({ path: afterScreenshot });
  console.log('Saved desktop_running_after.png');

  const artifactDir = 'C:\\Users\\Cheslin Gabriels\\.gemini\\antigravity-ide\\brain\\2d56d387-699f-4fa7-a4f3-759d32b365e1';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(afterScreenshot, path.join(artifactDir, 'desktop_running_after.png'));
  }

  await browser.close();
}

runDesktopTest().catch(err => {
  console.error(err);
  process.exit(1);
});
