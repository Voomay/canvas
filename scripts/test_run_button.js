import { chromium } from 'playwright';

async function testRunButton() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 456, height: 663 } });
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

  // Spawn resident
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.spawnResident();
    const resident = scene.residents[scene.residents.length - 1];
    resident.x = scene.player.x + 300;
  });

  // Wait for encounter choice banner
  await page.waitForTimeout(400);

  // Record states during mouse click on RUN button
  // Run button is right button: centerX = 228 + 118 = ~346, Y = ~580
  await page.evaluate(() => {
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

  await page.mouse.click(346, 580);
  await page.waitForTimeout(500);

  const states = await page.evaluate(() => {
    clearInterval(window.__interval);
    return window.__states;
  });

  console.log('Player states during click RUN:');
  console.table(states.slice(0, 15));

  const jumped = states.some(s => s.state === 'JUMPING' || (s.vy !== null && s.vy < -50));
  console.log('DID PLAYER JUMP ON RUN?', jumped ? 'YES (FAILED)' : 'NO (PASSED)');

  await browser.close();
}

testRunButton().catch(console.error);
