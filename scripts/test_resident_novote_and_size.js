import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runTest() {
  const screenshotsDir = path.resolve('scratch/mobile_scale_verification');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 892 } // Standard modern mobile screen
  });

  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:3005 ...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });
  await page.waitForTimeout(500);

  // Test 1: Start DA (Helen Zille) in Area 1
  console.log('2. Starting DA game in Area 1 on mobile portrait (412x892)...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'da');
  });

  await page.waitForTimeout(1000);

  // Measure Player Scale on Mobile
  const playerScaleCheck = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerScaleX: scene.player.scaleX,
      playerScaleY: scene.player.scaleY,
      partyId: scene.partyId,
      playerDisplayWidth: scene.player.displayWidth,
      playerDisplayHeight: scene.player.displayHeight
    };
  });
  console.log('Player Scale Check:', playerScaleCheck);

  // Programmatically check all resident texture dimensions in Phaser TextureManager
  const allTextureDimensions = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const results = [];
    for (let i = 1; i <= 17; i++) {
      const idle = scene.textures.get(`resident_${i}`).getSourceImage();
      const happy = scene.textures.get(`resident_${i}_happy`).getSourceImage();
      const doubtful = scene.textures.get(`resident_${i}_doubtful`).getSourceImage();
      const frustrated = scene.textures.get(`resident_${i}_frustrated`).getSourceImage();
      results.push({
        id: i,
        idleH: idle ? idle.height : 0,
        happyH: happy ? happy.height : 0,
        doubtfulH: doubtful ? doubtful.height : 0,
        frustratedH: frustrated ? frustrated.height : 0
      });
    }
    return results;
  });
  console.log('Resident Texture Dimensions Sample (Residents 1, 8, 12, 17):', [
    allTextureDimensions[0],
    allTextureDimensions[7],
    allTextureDimensions[11],
    allTextureDimensions[16]
  ]);

  // Clear obstacles and spawn Resident 8 specifically (the resident in user screenshot)
  console.log('3. Spawning Resident 8 on mobile...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];
    scene.residents.forEach(r => r.destroy());
    scene.residents = [];

    // Instantiate Resident 8
    const res = new window.Resident(scene, 480, scene.getGroundY());
    res.residentId = '8';
    res.sprite.setTexture('resident_8_doubtful');
    scene.residents.push(res);
  });

  await page.waitForTimeout(300);

  // Trigger talk with resident
  console.log('4. Triggering conversation with Resident 8 (triggerStopAndListen)...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const res = scene.residents[0];
    scene.triggerStopAndListen(res);
  });

  await page.waitForTimeout(600);

  // Measure scales and positions during conversation
  const dialogueMetrics = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const res = scene.residents[0];
    return {
      playerX: scene.player.x,
      playerY: scene.player.y,
      playerScale: scene.player.scaleX,
      residentX: res.x,
      residentY: res.y,
      residentScale: res.sprite.scaleX,
      residentTexture: res.sprite.texture.key,
      residentDisplayH: res.sprite.displayHeight,
      residentDisplayW: res.sprite.displayWidth
    };
  });
  console.log('Dialogue Metrics (Large mobile display):', dialogueMetrics);

  await page.screenshot({ path: path.join(screenshotsDir, '1_mobile_dialogue_large.png') });
  console.log('Saved 1_mobile_dialogue_large.png');

  // Trigger BAD MOVE outcome (NO VOTE)
  console.log('5. Triggering BAD MOVE / NO VOTE reaction...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const res = scene.residents[0];
    
    // Destroy active DialogueModal if present
    const dm = scene.children.list.find(c => c.constructor && c.constructor.name === 'DialogueModal');
    if (dm && dm.destroyModal) {
      dm.destroyModal();
    }

    // Force negative outcome
    const originalEval = scene.dialogueSystem.evaluateResponse;
    scene.dialogueSystem.evaluateResponse = () => ({
      responseType: 'lie',
      outcome: 'negative',
      voteGained: 0,
      trustChange: -12,
      mentalHealthChange: -6,
      mentalHealthReason: 'Resident insulted your party record!',
      reactionText: 'Voetsek man! You only visit our ward before elections!',
      personality: 'Rude',
      consecutivePromisesCount: 0
    });

    scene.handleResponseChosen(res, 'lie');
    scene.dialogueSystem.evaluateResponse = originalEval;
  });

  await page.waitForTimeout(600);

  // Measure resident bounds in frustrated pose ("BAD MOVE!")
  const boundsAfter = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const res = scene.residents[0];
    const sprite = res.sprite;
    return {
      displayHeight: sprite.displayHeight,
      displayWidth: sprite.displayWidth,
      scaleY: sprite.scaleY,
      scaleX: sprite.scaleX,
      texture: sprite.texture.key
    };
  });
  console.log('Resident bounds in frustrated pose (BAD MOVE / NO VOTE):', boundsAfter);

  await page.screenshot({ path: path.join(screenshotsDir, '2_mobile_bad_move_novote.png') });
  console.log('Saved 2_mobile_bad_move_novote.png');

  // Test other runners: ANC (Cyril) and PA (Gayton)
  console.log('6. Testing Cyril (ANC) mobile scale...');
  await page.evaluate(() => {
    window.startArea(1, 'anc');
  });
  await page.waitForTimeout(1000);
  const ancCheck = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      party: scene.partyId,
      scaleX: scene.player.scaleX,
      scaleY: scene.player.scaleY,
      texture: scene.player.texture.key,
      displayHeight: scene.player.displayHeight
    };
  });
  console.log('ANC Cyril Check:', ancCheck);
  await page.screenshot({ path: path.join(screenshotsDir, '3_cyril_running.png') });
  console.log('Saved 3_cyril_running.png');

  console.log('7. Testing Gayton (PA) mobile scale...');
  await page.evaluate(() => {
    window.startArea(1, 'pa');
  });
  await page.waitForTimeout(1000);
  const paCheck = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      party: scene.partyId,
      scaleX: scene.player.scaleX,
      scaleY: scene.player.scaleY,
      texture: scene.player.texture.key,
      displayHeight: scene.player.displayHeight
    };
  });
  console.log('PA Gayton Check:', paCheck);
  await page.screenshot({ path: path.join(screenshotsDir, '4_gayton_running.png') });
  console.log('Saved 4_gayton_running.png');

  await browser.close();
  console.log('--- Verification Test Complete! ---');
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
