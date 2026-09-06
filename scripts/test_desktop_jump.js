import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testDesktopJump() {
  const screenshotsDir = path.resolve('scratch/desktop_ground_verification');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3005/');
  await page.evaluate(() => localStorage.setItem('canvassing_terms_accepted', 'true'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const acceptBtn = await page.$('#csa-terms-accept');
  if (acceptBtn) {
    await acceptBtn.click();
    await page.waitForTimeout(300);
  }

  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'pa');
  });

  await page.waitForTimeout(1000);

  // Clear existing and spawn obstacle ahead
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];
    scene.residents.forEach(r => r.destroy());
    scene.residents = [];

    scene.spawnObstacle();
    if (scene.obstacles[0]) {
      scene.obstacles[0].x = scene.player.x + 300;
    }
  });

  // Jump using Spacebar
  await page.keyboard.press('Space');
  await page.waitForTimeout(280); // mid-air

  const jumpScreenshot = path.join(screenshotsDir, 'desktop_jumping.png');
  await page.screenshot({ path: jumpScreenshot });
  console.log('Saved desktop_jumping.png');

  const artifactDir = 'C:\\Users\\Cheslin Gabriels\\.gemini\\antigravity-ide\\brain\\2d56d387-699f-4fa7-a4f3-759d32b365e1';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(jumpScreenshot, path.join(artifactDir, 'desktop_jumping.png'));
  }

  // Wait for landing
  await page.waitForTimeout(600);

  const cleared = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerY: scene.player.y,
      groundY: scene.getGroundY(),
      cleared: scene.obstacles.length === 0 || scene.obstacles[0].isCleared
    };
  });
  console.log('Jump Result:', JSON.stringify(cleared, null, 2));

  await browser.close();
}

testDesktopJump().catch(err => {
  console.error(err);
  process.exit(1);
});
