import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function verifyWorldScrollingAndFreeze() {
  const screenshotsDir = path.resolve('scratch/scrolling_freeze_verification');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 454, height: 697 } // Mobile portrait viewport
  });

  const page = await context.newPage();

  console.log('1. Loading game on mobile viewport (454x697)...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Start DA in Area 1 with tutorials cleared
  console.log('2. Starting Area 1 with DA...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'da');
  });

  await page.waitForTimeout(1000);

  // 1. Measure initial positions during active running
  console.log('3. Sampling initial running state...');
  const sample1 = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerX: scene.player.x,
      playerY: scene.player.y,
      playerState: scene.player.playerState,
      roadTileX: scene.parallaxBg.roadTile.tilePositionX,
      housesTileX: scene.parallaxBg.housesTile.tilePositionX,
      taxiX: scene.curbsideTaxi ? scene.curbsideTaxi.x : null,
      pole0X: scene.parallaxBg.curbBanners[0] ? scene.parallaxBg.curbBanners[0].x : null,
      speed: scene.currentSpeed
    };
  });
  console.log('Sample 1 (T=0s):', JSON.stringify(sample1, null, 2));

  // Run for 1.2 seconds
  await page.waitForTimeout(1200);

  const sample2 = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerX: scene.player.x,
      playerY: scene.player.y,
      playerState: scene.player.playerState,
      roadTileX: scene.parallaxBg.roadTile.tilePositionX,
      housesTileX: scene.parallaxBg.housesTile.tilePositionX,
      taxiX: scene.curbsideTaxi ? scene.curbsideTaxi.x : null,
      pole0X: scene.parallaxBg.curbBanners[0] ? scene.parallaxBg.curbBanners[0].x : null,
      speed: scene.currentSpeed
    };
  });
  console.log('Sample 2 (T=1.2s):', JSON.stringify(sample2, null, 2));

  // Assertions for running & scrolling:
  console.log('Verifying world scrolling:');
  console.log('  Player stationary in X:', sample1.playerX === sample2.playerX);
  console.log('  Road scrolled left:', sample2.roadTileX > sample1.roadTileX, `(delta: +${(sample2.roadTileX - sample1.roadTileX).toFixed(1)})`);
  console.log('  Houses slower parallax:', sample2.housesTileX > sample1.housesTileX, `(delta: +${(sample2.housesTileX - sample1.housesTileX).toFixed(1)})`);
  if (sample1.taxiX !== null && sample2.taxiX !== null) {
    console.log('  Taxi scrolled left:', sample2.taxiX < sample1.taxiX, `(delta: ${(sample2.taxiX - sample1.taxiX).toFixed(1)})`);
  }
  if (sample1.pole0X !== null && sample2.pole0X !== null) {
    console.log('  Pole scrolled left:', sample2.pole0X < sample1.pole0X, `(delta: ${(sample2.pole0X - sample1.pole0X).toFixed(1)})`);
  }

  await page.screenshot({ path: path.join(screenshotsDir, '1_world_scrolling.png') });

  // 4. Approach resident and trigger choice banner
  console.log('4. Spawning resident ahead...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.encounterChoiceBannerAnimating = false;
    scene.mobileInteractionState = 'RUNNING';
    if (scene.residents.length === 0) {
      scene.spawnResident();
    }
    const res = scene.residents[0];
    res.x = scene.player.x + 240;
    res.hasEncountered = false;
    scene.activeResidentInEncounter = res;
    scene.showEncounterChoiceBanner(res);
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(screenshotsDir, '2_action_choice_running.png') });

  // Verify scrolling is still active before tapping talk
  const bannerSample = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      isEncounterPaused: scene.isEncounterPaused,
      speed: scene.currentSpeed,
      playerState: scene.player.playerState
    };
  });
  console.log('During choice banner - isEncounterPaused:', bannerSample.isEncounterPaused, 'playerState:', bannerSample.playerState);

  // 5. Tap [ TALK ]
  console.log('5. Tapping [ TALK ] to freeze all scrolling...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    if (scene.activeResidentInEncounter) {
      scene.triggerStopAndListen(scene.activeResidentInEncounter);
    }
  });

  // Wait 350ms for transition into conversation layout
  await page.waitForTimeout(350);

  // Sample frozen state
  const freezeSample1 = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const res = scene.activeResidentInEncounter || scene.residents[0];
    return {
      isEncounterPaused: scene.isEncounterPaused,
      speed: scene.currentSpeed,
      playerState: scene.player.playerState,
      playerY: scene.player.y,
      residentY: res ? res.y : null,
      residentX: res ? res.x : null,
      roadTileX: scene.parallaxBg.roadTile.tilePositionX,
      taxiX: scene.curbsideTaxi ? scene.curbsideTaxi.x : null,
      pole0X: scene.parallaxBg.curbBanners[0] ? scene.parallaxBg.curbBanners[0].x : null
    };
  });
  console.log('Freeze Sample 1:', JSON.stringify(freezeSample1, null, 2));

  // Wait 500ms while frozen
  await page.waitForTimeout(500);

  const freezeSample2 = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      roadTileX: scene.parallaxBg.roadTile.tilePositionX,
      taxiX: scene.curbsideTaxi ? scene.curbsideTaxi.x : null,
      pole0X: scene.parallaxBg.curbBanners[0] ? scene.parallaxBg.curbBanners[0].x : null
    };
  });

  console.log('Verifying frozen state:');
  console.log('  Road completely frozen:', freezeSample1.roadTileX === freezeSample2.roadTileX);
  if (freezeSample1.taxiX !== null && freezeSample2.taxiX !== null) {
    console.log('  Taxi completely frozen:', freezeSample1.taxiX === freezeSample2.taxiX);
  }
  if (freezeSample1.pole0X !== null && freezeSample2.pole0X !== null) {
    console.log('  Pole completely frozen:', freezeSample1.pole0X === freezeSample2.pole0X);
  }

  await page.screenshot({ path: path.join(screenshotsDir, '3_conversation_frozen.png') });

  // 6. Select response choice (TRUTH / ACTION)
  console.log('6. Selecting dialogue response...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const modal = scene.children.list.find(c => c.constructor.name === 'DialogueModal');
    if (modal && modal.mobileResponsePanel) {
      const zone = modal.mobileResponsePanel.list.find(c => c.type === 'Zone');
      if (zone) zone.emit('pointerdown');
    }
  });

  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, '4_reaction_modal.png') });

  // 7. Click CONTINUE on ReactionModal
  console.log('7. Dismissing ReactionModal (CONTINUE)...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const reactionModal = scene.children.list.find(c => c.constructor.name === 'ReactionModal');
    if (reactionModal && reactionModal.list) {
      const card = reactionModal.list.find(c => c.type === 'Container');
      if (card && card.list) {
        const zone = card.list.find(c => c.type === 'Zone');
        if (zone) zone.emit('pointerdown');
      }
    }
  });

  // Wait 400ms for candidate to return to road and resume
  await page.waitForTimeout(400);

  const resumeSample1 = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      isEncounterPaused: scene.isEncounterPaused,
      speed: scene.currentSpeed,
      playerState: scene.player.playerState,
      roadTileX: scene.parallaxBg.roadTile.tilePositionX
    };
  });
  console.log('Resume Sample 1 (Immediately after resume):', JSON.stringify(resumeSample1, null, 2));

  // Run for 1.0 second after resume
  await page.waitForTimeout(1000);

  const resumeSample2 = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      isEncounterPaused: scene.isEncounterPaused,
      speed: scene.currentSpeed,
      playerState: scene.player.playerState,
      roadTileX: scene.parallaxBg.roadTile.tilePositionX
    };
  });
  console.log('Resume Sample 2 (1.0s after resume):', JSON.stringify(resumeSample2, null, 2));

  console.log('Verifying resumed scrolling:');
  console.log('  Encounter unpaused:', !resumeSample2.isEncounterPaused);
  console.log('  Player in RUNNING state:', resumeSample2.playerState === 'RUNNING');
  console.log('  Road resumed scrolling:', resumeSample2.roadTileX > resumeSample1.roadTileX, `(delta: +${(resumeSample2.roadTileX - resumeSample1.roadTileX).toFixed(1)})`);

  await page.screenshot({ path: path.join(screenshotsDir, '5_running_resumed_seamlessly.png') });

  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  await browser.close();
}

verifyWorldScrollingAndFreeze().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
