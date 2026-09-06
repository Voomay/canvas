import { chromium } from 'playwright';

async function testTimerAndObstacleSpacing() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 456, height: 663 } });

  // Pre-accept terms to jump straight into game
  await page.addInitScript(() => {
    localStorage.setItem('canvassing_terms_accepted', 'true');
  });

  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'));

  // Start campaign
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('MainMenuScene');
    scene.scene.start('GameScene', { partyId: 'da' });
  });

  await page.waitForFunction(() => window.game && window.game.scene.isActive('GameScene'), { timeout: 10000 });
  console.log('GameScene active!');

  // 1. Verify initial timer is 20s
  const initialTime = await page.evaluate(() => {
    const gameScene = window.game.scene.getScene('GameScene');
    return {
      streetTimer: Math.round(gameScene.streetTimer),
      scoreManagerTime: Math.round(gameScene.scoreManager.totalTimeRemaining),
      currentStreetDuration: gameScene.currentStreet.durationSeconds
    };
  });
  console.log('Initial Timer Check:', initialTime);

  if (initialTime.streetTimer !== 20 || initialTime.currentStreetDuration !== 20) {
    throw new Error(`Expected 20 seconds, got: ${JSON.stringify(initialTime)}`);
  }
  console.log('✅ PASS: Starting timer is exactly 20 seconds!');

  // 2. Monitor obstacle positions and spacing over 8 seconds of running
  console.log('Monitoring obstacle positions and spacing during sprint...');
  const samples = [];
  const startTime = Date.now();

  while (Date.now() - startTime < 8000) {
    const data = await page.evaluate(() => {
      const scene = window.game.scene.getScene('GameScene');
      if (!scene || !scene.obstacles) return null;
      const activeObs = scene.obstacles.filter(o => o.active);
      return {
        timer: scene.streetTimer.toFixed(1),
        obsCount: activeObs.length,
        positions: activeObs.map(o => ({ x: Math.round(o.x), y: Math.round(o.y), type: o.obstacleType }))
      };
    });

    if (data) {
      samples.push(data);
      if (data.obsCount >= 2) {
        // Check distance between any two obstacles
        for (let i = 0; i < data.positions.length; i++) {
          for (let j = i + 1; j < data.positions.length; j++) {
            const dist = Math.abs(data.positions[i].x - data.positions[j].x);
            console.log(`Two obstacles present: Distance = ${dist}px`);
            if (dist < 800) {
              throw new Error(`Obstacles too close! Distance: ${dist}px`);
            }
          }
        }
      }
    }
    await page.waitForTimeout(100);
  }

  const maxSimultaneous = Math.max(...samples.map(s => s.obsCount));
  console.log('Maximum simultaneous active obstacles on screen/road:', maxSimultaneous);

  // 3. Test jumping over obstacle grants +5s time bonus
  console.log('Testing jump over obstacle...');
  const jumpResult = await page.evaluate(async () => {
    const scene = window.game.scene.getScene('GameScene');
    const groundY = scene.getGroundY();
    
    // Spawn a test obstacle right ahead of player
    scene.spawnObstacle();
    const obs = scene.obstacles[scene.obstacles.length - 1];
    obs.x = scene.player.x + 100;
    
    // Player jumps
    scene.player.playerState = 'JUMPING';
    scene.player.y = groundY - 50;

    const timerBefore = scene.streetTimer;
    // Advance scene to trigger jump collision resolution
    obs.x = scene.player.x;
    scene.updateObstacles(16);
    const timerAfter = scene.streetTimer;

    return {
      cleared: obs.isResolved,
      timerBefore: timerBefore.toFixed(1),
      timerAfter: timerAfter.toFixed(1),
      diff: (timerAfter - timerBefore).toFixed(1),
      obstaclesClearedCount: scene.scoreManager.currentAreaObstaclesCleared
    };
  });

  console.log('Jump Result:', jumpResult);
  if (jumpResult.diff < 4.9) {
    throw new Error(`Expected +5s time bonus on obstacle jump, got: ${jumpResult.diff}`);
  }
  console.log('✅ PASS: Obstacle jump awarded +5s extra time!');

  await browser.close();
  console.log('🎉 ALL VERIFICATIONS PASSED!');
}

testTimerAndObstacleSpacing().catch(err => {
  console.error(err);
  process.exit(1);
});
