import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runTest() {
  const outputDir = path.resolve('scratch/mobile_curbside_verification');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 454, height: 697 }
  });

  const page = await context.newPage();

  console.log('1. Loading game on mobile viewport (454x697)...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });
  await page.waitForTimeout(1000);

  // 1. Check Main Menu taxi
  await page.screenshot({ path: path.join(outputDir, '1_main_menu_taxi.png') });
  console.log('Saved 1_main_menu_taxi.png');

  // 2. Start In-Game Area 1 (Hanover Park)
  console.log('2. Starting Area 1 (Hanover Park)...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'da');
  });

  await page.waitForTimeout(1000);

  // Position curbside taxi clearly in frame to verify exact contact line
  const taxiInfo = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    if (scene.curbsideTaxi) {
      scene.curbsideTaxi.x = 260; // Center in mobile screen
    }
    // Remove obstacles around taxi for crystal clear screenshot
    scene.clearObstaclesBetween(0, 520);
    return {
      taxiExists: !!scene.curbsideTaxi,
      taxiX: scene.curbsideTaxi ? scene.curbsideTaxi.x : null,
      taxiY: scene.curbsideTaxi ? scene.curbsideTaxi.y : null,
      taxiScale: scene.curbsideTaxi ? scene.curbsideTaxi.scaleX : null,
      roadY: scene.parallaxBg.roadTile ? scene.parallaxBg.roadTile.y : null,
      groundY: scene.getGroundY(),
      height: scene.scale.height,
      width: scene.scale.width
    };
  });
  console.log('In-Game Taxi Positioning Info:', JSON.stringify(taxiInfo, null, 2));

  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, '2_in_game_taxi_curbside.png') });
  console.log('Saved 2_in_game_taxi_curbside.png');

  // 3. Trigger 10-second urgency warning
  console.log('3. Triggering 10s Low-Time Urgency Warning...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.streetTimer = 10;
    scene.scoreManager.totalTimeRemaining = 10;
    scene.hud.showLowTimeUrgencyWarning();
  });

  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, '3_low_time_urgency_warning.png') });
  console.log('Saved 3_low_time_urgency_warning.png');

  // 4. Verify Obstacle Pool (no brokenDrain) and spawn obstacles
  console.log('4. Verifying Obstacle types and spacing...');
  const obstacleTest = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const street = scene.currentStreet;
    const hasBrokenDrain = street.obstaclePool.includes('brokenDrain');
    
    // Spawn 2 obstacles
    scene.spawnObstacle();
    const obsTypes = scene.obstacles.map(o => o.obstacleType);
    return {
      pool: street.obstaclePool,
      hasBrokenDrain,
      spawnedTypes: obsTypes
    };
  });
  console.log('Obstacle verification:', JSON.stringify(obstacleTest, null, 2));

  await browser.close();
  console.log('Verification completed successfully!');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
