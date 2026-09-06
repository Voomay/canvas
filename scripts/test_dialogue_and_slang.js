import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function runDialogueSlangTest() {
  const screenshotsDir = path.resolve('scratch/slang_verification');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const artifactDir = 'C:\\Users\\Cheslin Gabriels\\.gemini\\antigravity-ide\\brain\\2d56d387-699f-4fa7-a4f3-759d32b365e1';

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome'
  });

  const context = await browser.newContext({
    viewport: { width: 456, height: 663 } // exact user mobile viewport
  });

  const page = await context.newPage();

  console.log('1. Loading game on mobile viewport (456x663)...');
  await page.goto('http://localhost:3005/');
  await page.evaluate(() => {
    localStorage.setItem('canvassing_terms_accepted', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // If terms overlay is still present, click accept button
  const acceptBtn = await page.$('#csa-terms-accept');
  if (acceptBtn) {
    await acceptBtn.click();
    await page.waitForTimeout(300);
  }

  // 1. Hanover Park test with Kaapse Afrikaans
  console.log('2. Starting Ward 1 (Hanover Park)...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'pa'); // PA party
  });

  await page.waitForTimeout(1200);

  // Trigger Hanover Park complaint
  console.log('3. Triggering Hanover Park Kaapse complaint...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.targetSpeed = 0;
    scene.currentSpeed = 0;
    scene.player.setPlayerState('IDLE');
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];

    if (scene.residents.length === 0) {
      scene.spawnResident();
    }
    const res = scene.residents[0];
    const hpComplaint = window.COMPLAINTS && window.COMPLAINTS.find(c => c.id === 'hanover_court_sewage');
    if (hpComplaint) {
      res.complaint = hpComplaint;
    }
    res.x = scene.player.x + 180;
    res.hasEncountered = false;
    scene.triggerStopAndListen(res);
  });

  await page.waitForTimeout(500);

  const hpScreenshot = path.join(screenshotsDir, '1_hanover_park_kaapse_dialogue.png');
  await page.screenshot({ path: hpScreenshot });
  console.log('Saved 1_hanover_park_kaapse_dialogue.png');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(hpScreenshot, path.join(artifactDir, 'hanover_park_kaapse_dialogue.png'));
  }

  // 2. Khayelitsha test with isiXhosa slang
  console.log('4. Switching to Ward 3 (Khayelitsha)...');
  await page.goto('http://localhost:3005/');
  await page.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(3, 'da'); // DA party in Khayelitsha
  });

  await page.waitForTimeout(1200);

  console.log('5. Triggering Khayelitsha isiXhosa complaint encounter...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.targetSpeed = 0;
    scene.currentSpeed = 0;
    scene.player.setPlayerState('IDLE');
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];

    if (scene.residents.length === 0) {
      scene.spawnResident();
    }
    const res = scene.residents[0];
    const khComplaint = window.COMPLAINTS && window.COMPLAINTS.find(c => c.id === 'khayelitsha_communal_taps');
    if (khComplaint) {
      res.complaint = khComplaint;
    }
    res.x = scene.player.x + 180;
    res.hasEncountered = false;
    scene.triggerStopAndListen(res);
  });

  await page.waitForTimeout(500);

  const khScreenshot = path.join(screenshotsDir, '2_khayelitsha_xhosa_dialogue.png');
  await page.screenshot({ path: khScreenshot });
  console.log('Saved 2_khayelitsha_xhosa_dialogue.png');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(khScreenshot, path.join(artifactDir, 'khayelitsha_xhosa_dialogue.png'));
  }

  // 3. Click response card in Khayelitsha to test ReactionModal
  console.log('6. Clicking response card to inspect ReactionModal with isiXhosa reaction...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    const modal = scene.children.list.find(c => c.constructor.name === 'DialogueModal');
    if (modal && modal.mobileResponsePanel) {
      const zone = modal.mobileResponsePanel.list.find(c => c.type === 'Zone');
      if (zone) {
        zone.emit('pointerdown');
      }
    }
  });

  await page.waitForTimeout(700);

  const reactionScreenshot = path.join(screenshotsDir, '3_khayelitsha_reaction_modal.png');
  await page.screenshot({ path: reactionScreenshot });
  console.log('Saved 3_khayelitsha_reaction_modal.png');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(reactionScreenshot, path.join(artifactDir, 'khayelitsha_reaction_modal.png'));
  }

  await browser.close();
  console.log('Test completed successfully!');
}

runDialogueSlangTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
