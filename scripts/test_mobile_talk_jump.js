import { chromium } from 'playwright';

async function testJumpOnTalk() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 456, height: 663 }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });

  // Start Area 1
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'da');
  });

  await page.waitForTimeout(1000);

  // Spawn resident and position for encounter
  const encounterInfo = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.spawnResident();
    const resident = scene.residents[scene.residents.length - 1];
    resident.x = scene.player.x + 300;
    return {
      playerX: scene.player.x,
      residentX: resident.x,
      mobileInteractionState: scene.mobileInteractionState
    };
  });
  console.log('Spawned resident:', encounterInfo);

  // Let scene update so distance triggers showEncounterChoiceBanner
  await page.waitForTimeout(400);

  const bannerState = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      mobileInteractionState: scene.mobileInteractionState,
      hasBanner: !!scene.encounterChoiceBanner,
      bannerY: scene.encounterChoiceBanner ? scene.encounterChoiceBanner.y : null,
      playerState: scene.player.playerState,
      playerY: Math.round(scene.player.y),
      playerX: Math.round(scene.player.x)
    };
  });
  console.log('Banner state:', bannerState);

  // Screenshot 1: Banner showing, player running
  await page.screenshot({ path: 'scratch/talk_verify_1_banner.png' });

  // Record states during mouse click on TALK button
  // Viewport is 456x663.
  // Banner is at centerX = 228, Y = ~560.
  // Talk button is at leftX = -118 relative to banner center = ~110, Y = ~580.
  const startRecording = page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const player = scene.player;
    window.__states = [];
    window.__interval = setInterval(() => {
      window.__states.push({
        state: player.playerState,
        y: Math.round(player.y),
        x: Math.round(player.x),
        vy: player.body ? Math.round(player.body.velocity.y) : null
      });
    }, 25);
  });

  await page.mouse.click(110, 580);
  await page.waitForTimeout(300);

  // Screenshot 2: Immediately stopped face to face in conversation
  await page.screenshot({ path: 'scratch/talk_verify_2_talking.png' });
  await page.waitForTimeout(400);

  const states = await page.evaluate(() => {
    clearInterval(window.__interval);
    return window.__states;
  });

  console.log('Player states during click TALK:');
  console.table(states.slice(0, 15));

  // Wait 400ms for DialogueModal input lockout (320ms) to clear
  await page.waitForTimeout(400);

  // Find DialogueModal and click response option 0
  const chosen = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const modal = scene.children.list.find(c => c.constructor && c.constructor.name === 'DialogueModal');
    if (modal && modal.mobileResponsePanel) {
      const panel = modal.mobileResponsePanel;
      // Zone 0 is the first card touch zone
      const zone = panel.list.find(item => item.type === 'Zone');
      if (zone) {
        zone.emit('pointerdown');
        return true;
      }
    }
    return false;
  });
  console.log('Clicked response card on mobileResponsePanel:', chosen);

  // Wait for response animation and ReactionModal appearance
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/talk_verify_3_reaction.png' });

  // Dismiss ReactionModal by clicking continueZone
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const reaction = scene.children.list.find(c => c.constructor && c.constructor.name === 'ReactionModal');
    if (reaction && reaction.list) {
      // reaction.list[0] is the card container
      const card = reaction.list.find(item => item.type === 'Container');
      if (card && card.list) {
        const zone = card.list.find(item => item.type === 'Zone');
        if (zone) zone.emit('pointerdown');
      }
    }
  });

  await page.waitForTimeout(600);

  // Verify running resumed properly
  const resumedState = await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    return {
      mobileInteractionState: scene.mobileInteractionState,
      playerState: scene.player.playerState,
      playerY: Math.round(scene.player.y),
      playerX: Math.round(scene.player.x),
      currentSpeed: scene.currentSpeed,
      isEncounterPaused: scene.isEncounterPaused
    };
  });

  console.log('Resumed running state:', resumedState);
  await page.screenshot({ path: 'scratch/talk_verify_4_resumed.png' });

  await browser.close();
}

testJumpOnTalk().catch(console.error);
