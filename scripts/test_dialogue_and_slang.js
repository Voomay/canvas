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

  // 1. Hanover Park test with Resident 6 (Muslim resident with hijab saying "Slamat!")
  console.log('2. Starting Ward 1 (Hanover Park)...');
  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'pa'); // PA party
  });

  await page.waitForTimeout(1200);

  // Spawn Resident 6 (Muslim woman wearing hijab)
  console.log('3. Triggering Resident 6 (Muslim resident wearing hijab) with Slamat! complaint...');
  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.targetSpeed = 0;
    scene.currentSpeed = 0;
    scene.player.setPlayerState('IDLE');
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];

    // Clear existing residents and spawn Resident 6
    scene.residents.forEach(r => r.destroy());
    scene.residents = [];

    // Construct resident with sprite '6'
    const res = new window.Resident(scene, scene.player.x + 180, scene.getGroundY(), scene.currentStreet.allowedComplaintCategories, scene.partyId, scene.currentStreet.locationKey);
    // Force sprite to 6 if not already
    res.residentId = '6';
    res.sprite.setTexture('resident_6_doubtful');
    // Assign Palestine mural or Sewage complaint with Muslim formatting
    const hpComplaint = window.COMPLAINTS && window.COMPLAINTS.find(c => c.id === 'cape_palestine_solidarity');
    if (hpComplaint) {
      res.complaint = {
        ...hpComplaint,
        complaintText: window.formatMuslimResidentComplaint ? window.formatMuslimResidentComplaint(hpComplaint.complaintText) : 'SLAMAT! Why did the City send law enforcement to whitewash our Palestine murals innie Flats?!'
      };
    }
    res.hasEncountered = false;
    scene.residents.push(res);
    scene.triggerStopAndListen(res);
  });

  await page.waitForTimeout(500);

  const muslimDialogueScreenshot = path.join(screenshotsDir, '1_muslim_resident_slamat_dialogue.png');
  await page.screenshot({ path: muslimDialogueScreenshot });
  console.log('Saved 1_muslim_resident_slamat_dialogue.png');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(muslimDialogueScreenshot, path.join(artifactDir, 'muslim_resident_slamat_dialogue.png'));
  }

  // 2. Click response card to inspect Muslim reaction modal (Slamat! / Shukran / Astaghfirullah)
  console.log('4. Clicking response card to inspect ReactionModal for Muslim resident...');
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

  const muslimReactionScreenshot = path.join(screenshotsDir, '2_muslim_resident_reaction_modal.png');
  await page.screenshot({ path: muslimReactionScreenshot });
  console.log('Saved 2_muslim_resident_reaction_modal.png');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(muslimReactionScreenshot, path.join(artifactDir, 'muslim_resident_reaction_modal.png'));
  }

  // 3. Test Coloured language resident in Hanover Park (e.g. Resident 8 or 1 with Kaapse Afrikaans "Awe my broer")
  console.log('5. Testing Coloured language complaint encounter...');
  await page.goto('http://localhost:3005/');
  await page.waitForFunction(() => window.game && window.game.scene.isActive('MainMenuScene'), { timeout: 25000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    const sm = window.ScoreManager.getInstance();
    sm.hasSeenObstacleTutorial = true;
    sm.hasSeenResidentTutorial = true;
    window.startArea(1, 'pa');
  });

  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    const scene = window.game.scene.getScene('GameScene');
    scene.targetSpeed = 0;
    scene.currentSpeed = 0;
    scene.player.setPlayerState('IDLE');
    scene.obstacles.forEach(o => o.destroy());
    scene.obstacles = [];

    scene.residents.forEach(r => r.destroy());
    scene.residents = [];

    const res = new window.Resident(scene, scene.player.x + 180, scene.getGroundY(), scene.currentStreet.allowedComplaintCategories, scene.partyId, scene.currentStreet.locationKey);
    res.residentId = '8'; // Young Coloured guy in tracksuit
    res.sprite.setTexture('resident_8_doubtful');
    const hpComplaint = window.COMPLAINTS && window.COMPLAINTS.find(c => c.id === 'hanover_court_sewage');
    if (hpComplaint) {
      res.complaint = hpComplaint;
    }
    res.hasEncountered = false;
    scene.residents.push(res);
    scene.triggerStopAndListen(res);
  });

  await page.waitForTimeout(500);

  const colouredDialogueScreenshot = path.join(screenshotsDir, '3_coloured_language_dialogue.png');
  await page.screenshot({ path: colouredDialogueScreenshot });
  console.log('Saved 3_coloured_language_dialogue.png');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(colouredDialogueScreenshot, path.join(artifactDir, 'coloured_language_dialogue.png'));
  }

  await browser.close();
  console.log('Test completed successfully!');
}

runDialogueSlangTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
