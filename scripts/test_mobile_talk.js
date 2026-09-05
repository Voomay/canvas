import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runTalkTest() {
  const screenshotsDir = path.resolve('scratch/mobile_talk_verification');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

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

  // 0. Main menu party select screen - check taxi curbside positioning
  await page.screenshot({ path: path.join(screenshotsDir, '0_main_menu_taxi.png') });
  console.log('Saved 0_main_menu_taxi.png');

  // Start DA in Area 1 with tutorials cleared
  console.log('2. Starting Area 1 with DA...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'da');
  });

  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    // Clear any obstacles so player is running cleanly
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];
    scene.player.setPlayerState('RUNNING');
  });
  await page.waitForTimeout(200);

  // 1. Normal running state
  await page.screenshot({ path: path.join(screenshotsDir, '1_normal_running.png') });
  console.log('Saved 1_normal_running.png');

  // Trigger resident approach and Action Bar cleanly
  console.log('3. Triggering resident approach with authentic Cape complaint...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.targetSpeed = 0;
    scene.currentSpeed = 0;
    scene.player.setPlayerState('IDLE');
    scene.encounterChoiceBannerAnimating = false;
    scene.mobileInteractionState = 'RUNNING';
    if (scene.residents.length === 0) {
      scene.spawnResident();
    }
    const res = scene.residents[0];
    const capeComplaint = window.COMPLAINTS && window.COMPLAINTS.find(c => c.id === 'cape_palestine_solidarity');
    if (capeComplaint) {
      res.complaint = capeComplaint;
    }
    res.x = scene.player.x + 190;
    res.hasEncountered = false;
    scene.activeResidentInEncounter = res;
    scene.showEncounterChoiceBanner(res);
  });

  await page.waitForTimeout(400);

  const bannerInfo = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      hasBanner: !!scene.encounterChoiceBanner,
      bannerY: scene.encounterChoiceBanner ? scene.encounterChoiceBanner.y : null,
      bannerFinalY: scene.scale.height - 180 / 2 - 14,
      bannerVisible: scene.encounterChoiceBanner ? scene.encounterChoiceBanner.visible : null,
      depth: scene.encounterChoiceBanner ? scene.encounterChoiceBanner.depth : null,
      height: scene.scale.height,
      width: scene.scale.width,
      childrenCount: scene.encounterChoiceBanner ? scene.encounterChoiceBanner.list.length : 0
    };
  });
  console.log('[DEBUG BANNER]:', JSON.stringify(bannerInfo));

  // Check Action Bar state
  await page.screenshot({ path: path.join(screenshotsDir, '2_action_bar_talk_run.png') });
  console.log('Saved 2_action_bar_talk_run.png');

  // Unpause
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.isEncounterPaused = false;
  });

  // Tap [ TALK ]
  console.log('4. Tapping [ TALK ] to trigger mobile conversation position...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    if (scene.activeResidentInEncounter) {
      scene.triggerStopAndListen(scene.activeResidentInEncounter);
    } else if (scene.residents.length > 0) {
      scene.triggerStopAndListen(scene.residents[0]);
    }
  });

  // Wait 350ms for the 280ms synchronized transition to fully settle
  await page.waitForTimeout(350);

  // 3. Conversation state: characters translated up, speech bubble directly above, 4 cards below
  await page.screenshot({ path: path.join(screenshotsDir, '3_talk_conversation_composition.png') });
  console.log('Saved 3_talk_conversation_composition.png');

  // Inspect character Y, speech bubble Y, and road Y
  const metrics = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerY: scene.player.y,
      playerX: scene.player.x,
      normalGroundY: scene.getGroundY(),
      roadY: scene.parallaxBg.roadTile.y,
      residentY: scene.residents[0] ? scene.residents[0].y : null,
      residentX: scene.residents[0] ? scene.residents[0].x : null,
      speed: scene.currentSpeed
    };
  });
  console.log('Metrics during conversation:', JSON.stringify(metrics, null, 2));

  // 4. Tap the first response card (TRUTH / ACTION)
  console.log('5. Clicking TRUTH / ACTION button...');
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    // Find DialogueModal
    const modal = scene.children.list.find(c => c.constructor.name === 'DialogueModal');
    if (modal && modal.mobileResponsePanel) {
      const zone = modal.mobileResponsePanel.list.find(c => c.type === 'Zone');
      if (zone) {
        zone.emit('pointerdown');
      }
    }
  });

  // Wait 450ms for card bounce, panel slide down, and ReactionModal entrance
  await page.waitForTimeout(500);

  // 5. Reaction result modal
  await page.screenshot({ path: path.join(screenshotsDir, '4_reaction_modal.png') });
  console.log('Saved 4_reaction_modal.png');

  // 6. Dismiss reaction modal (tap Continue)
  console.log('6. Clicking CONTINUE button on ReactionModal...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const reactionModal = scene.children.list.find(c => c.constructor.name === 'ReactionModal');
    if (reactionModal && reactionModal.list) {
      const card = reactionModal.list.find(c => c.type === 'Container');
      if (card && card.list) {
        const zone = card.list.find(c => c.type === 'Zone');
        if (zone) {
          zone.emit('pointerdown');
        }
      }
    }
  });

  // Wait 500ms for smooth return translation down to road
  await page.waitForTimeout(500);

  // 7. Resumed gameplay on road
  await page.screenshot({ path: path.join(screenshotsDir, '5_running_resumed.png') });
  console.log('Saved 5_running_resumed.png');

  const finalMetrics = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerY: scene.player.y,
      normalGroundY: scene.getGroundY(),
      speed: scene.currentSpeed,
      playerState: scene.player.playerState
    };
  });
  console.log('Final Metrics after resume:', JSON.stringify(finalMetrics, null, 2));

  // 8. Test [ RUN ] choice on next encounter
  console.log('7. Testing [ RUN ] choice on encounter prompt...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.spawnResident();
    const newRes = scene.residents[scene.residents.length - 1];
    newRes.x = scene.player.x + 230;
    newRes.hasEncountered = false;
  });

  await page.waitForTimeout(600);

  // Click [ RUN ] on the action bar
  console.log('8. Clicking [ RUN ]...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    if (scene.activeResidentInEncounter) {
      scene.triggerKeepRunning(scene.activeResidentInEncounter);
    }
  });

  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, '6_run_selected_toast.png') });
  console.log('Saved 6_run_selected_toast.png');

  const runMetrics = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      playerY: scene.player.y,
      normalGroundY: scene.getGroundY(),
      speed: scene.currentSpeed,
      playerState: scene.player.playerState
    };
  });
  console.log('Run Choice Metrics:', JSON.stringify(runMetrics, null, 2));

  // 9. Test Ward Complete / Defeat screen
  console.log('9. Transitioning to StreetCompleteScene with 0 votes (Defeat)...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.votes = 0;
    sm.currentAreaObstaclesCleared = 2;
    sm.currentAreaObstaclesHit = 3;
    sm.trust = 24;
    sm.mentalHealth = 38;
    const gameScene = window.game.scene.getScene('GameScene');
    gameScene.scene.start('StreetCompleteScene', { partyId: 'da' });
  });

  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, '7_ward_complete_defeat.png') });
  console.log('Saved 7_ward_complete_defeat.png');

  // 10. Test Share Modal
  console.log('10. Opening ShareModal...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('StreetCompleteScene');
    // Click the share button or invoke the share callback directly
    const shareBtn = scene.children.list.find(c => c.labelText && c.labelText.text && c.labelText.text.includes('SHARE WARD RESULTS'));
    if (shareBtn && shareBtn.emit) {
      shareBtn.emit('pointerdown');
      shareBtn.emit('pointerup');
    }
  });

  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotsDir, '8_share_modal.png') });
  console.log('Saved 8_share_modal.png');

  await browser.close();
  console.log('✓ All verification tests finished successfully!');
}

runTalkTest().catch(err => {
  console.error('Error in talk test:', err);
  process.exit(1);
});
