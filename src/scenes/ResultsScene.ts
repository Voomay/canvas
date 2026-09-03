import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { PARTIES } from '../data/parties';
import { Button } from '../ui/Button';
import { SoundFX } from '../systems/SoundFX';
import { ShareModal } from '../ui/ShareModal';
import { AdvertiseModal } from '../ui/AdvertiseModal';

export class ResultsScene extends Phaser.Scene {
  private partyId: 'da' | 'anc' | 'pa' = 'da';

  constructor() {
    super('ResultsScene');
  }

  public init(data: { partyId: 'da' | 'anc' | 'pa' }) {
    this.partyId = data.partyId || 'da';
  }

  public create() {
    const { width, height } = this.scale;
    const scoreManager = ScoreManager.getInstance();
    const party = PARTIES[this.partyId];
    const rating = scoreManager.getRating();

    SoundFX.getInstance().playStreetVictory();

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    const bgKey = this.textures.exists('bg_location_capetown') ? 'bg_location_capetown' : 'bg_houses';
    const cloudKey = this.textures.exists('bg_clouds_sky') ? 'bg_clouds_sky' : 'bg_clouds';
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    this.add.tileSprite(0, 0, width, 432, bgKey).setOrigin(0, 0);
    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, 428, width, 292, roadKey).setOrigin(0, 0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a101a, 0.9);
    overlay.fillRect(0, 0, width, height);

    const isPortrait = height > width;
    const cw = isPortrait ? Math.min(width - 24, 424) : 900;
    const ch = isPortrait ? Math.min(height - 24, 700) : 610;

    // Main Results Container Card
    const card = this.add.graphics();
    card.fillStyle(0x0f1a29, 0.98);
    card.fillRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 20);
    card.lineStyle(3, 0xfcb813, 1);
    card.strokeRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 20);

    const topOffset = height / 2 - ch / 2;

    // Header & Party Badge
    this.add.text(width / 2, topOffset + (isPortrait ? 30 : 45), '🗳️ FINAL ELECTION RESULTS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '22px' : '40px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, topOffset + (isPortrait ? 58 : 82), `Canvassing Report: ${party.name} (${party.fullName})`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '18px',
      color: '#ffffff',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    // Humorous Campaign Rating Banner
    const ratingW = isPortrait ? cw - 28 : 760;
    const ratingH = isPortrait ? 76 : 95;
    const ratingY = topOffset + (isPortrait ? 114 : 155);

    const ratingBg = this.add.graphics();
    ratingBg.fillStyle(0x19283f, 1);
    ratingBg.fillRoundedRect(width / 2 - ratingW / 2, ratingY - ratingH / 2, ratingW, ratingH, 12);
    ratingBg.lineStyle(2.5, 0xfcb813, 1);
    ratingBg.strokeRoundedRect(width / 2 - ratingW / 2, ratingY - ratingH / 2, ratingW, ratingH, 12);

    this.add.text(width / 2, ratingY - (isPortrait ? 14 : 18), `${rating.badgeEmoji} AWARD: "${rating.title.toUpperCase()}"`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '14px' : '24px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, ratingY + (isPortrait ? 14 : 18), rating.subtitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '15px',
      color: '#f1f5f9',
      align: 'center',
      wordWrap: { width: ratingW - 20 }
    }).setOrigin(0.5, 0.5);

    // Statistics Breakdown Grid
    const totalVotes = scoreManager.totalCampaignVotes > 0 ? scoreManager.totalCampaignVotes : scoreManager.votes;
    const statsList = [
      { label: 'TOTAL VOTES', val: `${totalVotes}`, color: '#44dd66', icon: '🗳️' },
      { label: 'COMMUNITY TRUST', val: `${Math.round(scoreManager.trust)}%`, color: '#fcb813', icon: '🤝' },
      { label: 'INFRA FIXED', val: `${scoreManager.stats.obstaclesCleared}`, color: '#38bdf8', icon: '🛠️' },
      { label: 'RESIDENTS MET', val: `${scoreManager.stats.residentsApproached}`, color: '#ffffff', icon: '🗣️' },
      { label: 'PROMISES', val: `${scoreManager.stats.promisesMade}`, color: '#55dd88', icon: '📜' },
      { label: 'BLAMES', val: `${scoreManager.stats.blamesGiven}`, color: '#f59e0b', icon: '👉' },
      { label: 'HONESTY', val: `${scoreManager.stats.honestyGiven}`, color: '#38bdf8', icon: '😂' },
      { label: 'HAZARDS HIT', val: `${scoreManager.stats.obstaclesHit}`, color: '#ef4444', icon: '💥' }
    ];

    const openShareCampaign = () => {
      ShareModal.open({
        partyName: party.name,
        partyFullName: party.fullName,
        partyId: this.partyId,
        wardName: 'South Africa (National Election)',
        suburb: 'National Campaign',
        votesSecured: totalVotes,
        targetVotes: scoreManager.totalStreets * 10,
        trustPercent: scoreManager.trust,
        obstaclesCleared: scoreManager.stats.obstaclesCleared,
        residentsApproached: scoreManager.stats.residentsApproached,
        areaIndex: scoreManager.totalStreets,
        isTotalCampaign: true
      });
    };

    if (isPortrait) {
      const boxW = (cw - 36) / 2;
      const boxH = 46;
      const colGap = boxW / 2 + 4;
      const startStatsY = ratingY + ratingH / 2 + 30;

      statsList.forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = col === 0 ? width / 2 - colGap : width / 2 + colGap;
        const by = startStatsY + row * (boxH + 8);

        const statBox = this.add.graphics();
        statBox.fillStyle(0x0a121d, 0.9);
        statBox.fillRoundedRect(bx - boxW / 2, by - boxH / 2, boxW, boxH, 8);
        statBox.lineStyle(1.5, 0x1f3c6e, 1);
        statBox.strokeRoundedRect(bx - boxW / 2, by - boxH / 2, boxW, boxH, 8);

        this.add.text(bx - boxW / 2 + 10, by, `${st.icon} ${st.label}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: '#cbd5e1',
          fontStyle: '700'
        }).setOrigin(0, 0.5);

        this.add.text(bx + boxW / 2 - 10, by, st.val, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '17px',
          color: st.color,
          fontStyle: '900'
        }).setOrigin(1, 0.5);
      });

      // Portrait Action Buttons
      const btnW = (cw - 36) / 2;
      const btnY = topOffset + ch - 62;

      // Share Campaign Results button
      new Button(this, width / 2, btnY - 48, '📤 SHARE CAMPAIGN RESULTS 🔗', openShareCampaign, {
        width: cw - 32,
        height: 42,
        bgColor: 0x005ba6,
        hoverColor: 0x1a75c2,
        fontSize: '14px'
      });

      new Button(this, width / 2 - btnW / 2 - 4, btnY, '↺ AGAIN', () => {
        ScoreManager.getInstance().resetGame();
        this.scene.start('MainMenuScene');
      }, {
        width: btnW,
        height: 40,
        bgColor: 0x1f9137,
        hoverColor: 0x27ab42,
        fontSize: '14px'
      });

      new Button(this, width / 2 + btnW / 2 + 4, btnY, '🏠 MENU', () => {
        this.scene.start('MainMenuScene');
      }, {
        width: btnW,
        height: 40,
        bgColor: 0x1f3c6e,
        hoverColor: 0x2b5294,
        fontSize: '14px'
      });

      // Advertise Link
      const adText = this.add.text(width / 2, topOffset + ch - 18, '📢 Want to advertise your brand in-game? Click here ➔', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      adText.setInteractive({ useHandCursor: true });
      adText.on('pointerover', () => adText.setColor('#ffffff'));
      adText.on('pointerout', () => adText.setColor('#fcb813'));
      adText.on('pointerdown', () => AdvertiseModal.open());

    } else {
      statsList.forEach((st, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        const bx = width / 2 - 315 + col * 210;
        const by = 325 + row * 92;

        const statBox = this.add.graphics();
        statBox.fillStyle(0x0a121d, 0.9);
        statBox.fillRoundedRect(bx - 95, by - 38, 190, 76, 12);
        statBox.lineStyle(2, 0x1f3c6e, 1);
        statBox.strokeRoundedRect(bx - 95, by - 38, 190, 76, 12);

        this.add.text(bx, by - 16, `${st.icon} ${st.label}`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12.5px',
          color: '#cbd5e1',
          fontStyle: '700'
        }).setOrigin(0.5, 0.5);

        this.add.text(bx, by + 14, st.val, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '26px',
          color: st.color,
          fontStyle: '900'
        }).setOrigin(0.5, 0.5);
      });

      // Action Buttons: PLAY AGAIN, SHARE, & MAIN MENU
      const btnRowY = topOffset + ch - 65;
      const bW = 260;

      new Button(this, width / 2 - 280, btnRowY, '↺ CANVASS AGAIN', () => {
        ScoreManager.getInstance().resetGame();
        this.scene.start('MainMenuScene');
      }, {
        width: bW,
        height: 52,
        bgColor: 0x1f9137,
        hoverColor: 0x27ab42,
        fontSize: '18px'
      });

      new Button(this, width / 2, btnRowY, '📤 SHARE RESULTS 🔗', openShareCampaign, {
        width: bW,
        height: 52,
        bgColor: 0x005ba6,
        hoverColor: 0x1a75c2,
        fontSize: '18px'
      });

      new Button(this, width / 2 + 280, btnRowY, '🏠 MAIN MENU', () => {
        this.scene.start('MainMenuScene');
      }, {
        width: bW,
        height: 52,
        bgColor: 0x176bc4,
        hoverColor: 0x2480e6,
        fontSize: '18px'
      });

      // Advertise with Us Link
      const adText = this.add.text(width / 2, topOffset + ch - 22, '📢 Want your brand featured on in-game minibus taxis & billboards? Advertise With Us ➔', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      adText.setInteractive({ useHandCursor: true });
      adText.on('pointerover', () => adText.setColor('#ffffff'));
      adText.on('pointerout', () => adText.setColor('#fcb813'));
      adText.on('pointerdown', () => AdvertiseModal.open());
    }
  }
}
