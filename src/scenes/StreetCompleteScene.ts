import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { STREETS } from '../data/streets';
import { Button } from '../ui/Button';
import { SoundFX } from '../systems/SoundFX';

export class StreetCompleteScene extends Phaser.Scene {
  private partyId: 'da' | 'anc' | 'pa' = 'da';

  constructor() {
    super('StreetCompleteScene');
  }

  public init(data: { partyId: 'da' | 'anc' | 'pa' }) {
    this.partyId = data.partyId || 'da';
  }

  public create() {
    const { width, height } = this.scale;
    const scoreManager = ScoreManager.getInstance();
    const completedStreetIndex = scoreManager.currentStreetIndex;
    const currentStreetData = STREETS[completedStreetIndex - 1];

    SoundFX.getInstance().playStreetVictory();

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    const bgKey = currentStreetData?.locationKey === 'joburg' && this.textures.exists('bg_location_joburg')
      ? 'bg_location_joburg'
      : (this.textures.exists('bg_location_capetown') ? 'bg_location_capetown' : 'bg_houses');
    const cloudKey = this.textures.exists('bg_clouds_sky') ? 'bg_clouds_sky' : 'bg_clouds';
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    this.add.tileSprite(0, 0, width, 432, bgKey).setOrigin(0, 0);
    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, 428, width, 292, roadKey).setOrigin(0, 0);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x0c1524, 0.88);
    overlay.fillRect(0, 0, width, height);

    const isWardWon = scoreManager.votes >= 10;
    const isPortrait = height > width;
    const cw = isPortrait ? Math.min(width - 24, 424) : Math.min(740, width - 40);
    const ch = isPortrait ? Math.min(height - 40, 520) : 500;

    // Summary Card
    const card = this.add.graphics();
    card.fillStyle(0x131f30, 0.96);
    card.fillRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 20);
    card.lineStyle(3, 0xfcb813, 1);
    card.strokeRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 20);

    if (isWardWon) {
      SoundFX.getInstance().playStreetVictory();
    } else {
      SoundFX.getInstance().playVoteNegative();
    }

    // Header & Badge
    const headerTitle = isWardWon ? `🎉 SELECTED FOR AREA ${completedStreetIndex}!` : `❌ AREA ${completedStreetIndex} NOT WON`;
    const headerColor = isWardWon ? '#2ecc71' : '#ff5555';
    const subMsg = isWardWon
      ? `🏆 VICTORY! You secured ${scoreManager.votes}/10 votes in 30s and won this Area election!`
      : `⚠️ You got ${scoreManager.votes}/10 votes. You needed at least 10 votes in 30s to win this Area!`;

    const topOffset = height / 2 - ch / 2;

    this.add.text(width / 2, topOffset + (isPortrait ? 38 : 50), headerTitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '23px' : '36px',
      color: headerColor,
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, topOffset + (isPortrait ? 74 : 95), currentStreetData.suburb, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '16px' : '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, topOffset + (isPortrait ? 112 : 135), subMsg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '12px' : '15px',
      color: isWardWon ? '#86efac' : '#fca5a5',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: cw - 36 }
    }).setOrigin(0.5, 0.5);

    // Stats Grid
    const statItems = [
      { label: 'Area Votes Secured', val: `${scoreManager.votes} / 10 🗳️`, color: isWardWon ? '#44dd66' : '#ff7777' },
      { label: 'Community Trust', val: `${Math.round(scoreManager.trust)}%`, color: '#fcb813' },
      { label: 'Residents Approached', val: `${scoreManager.stats.residentsApproached} 🗣️`, color: '#ffffff' },
      { label: 'Area Status', val: isWardWon ? 'ELECTED! 🏆' : 'DEFEATED ❌', color: isWardWon ? '#44dd66' : '#ff5555' }
    ];

    const statBoxW = isPortrait ? (cw - 36) / 2 : 280;
    const statBoxH = isPortrait ? 58 : 68;
    const colGap = isPortrait ? statBoxW / 2 + 4 : 160;

    statItems.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const sx = col === 0 ? width / 2 - colGap : width / 2 + colGap;
      const sy = topOffset + (isPortrait ? 180 : 215) + row * (statBoxH + 12);

      const statBg = this.add.graphics();
      statBg.fillStyle(0x0c1524, 0.9);
      statBg.fillRoundedRect(sx - statBoxW / 2, sy - statBoxH / 2, statBoxW, statBoxH, 10);
      statBg.lineStyle(2, 0x1f3c6e, 1);
      statBg.strokeRoundedRect(sx - statBoxW / 2, sy - statBoxH / 2, statBoxW, statBoxH, 10);

      this.add.text(sx, sy - (isPortrait ? 10 : 12), st.label, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '11px' : '13px',
        color: '#a0aec0',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      this.add.text(sx, sy + (isPortrait ? 12 : 14), st.val, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '18px' : '22px',
        color: st.color,
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
    });

    // Buttons: Win vs Retry Loop
    const hasMoreStreets = completedStreetIndex < scoreManager.totalStreets;
    const btnY = topOffset + (isPortrait ? 360 : 395);

    if (isWardWon) {
      const btnText = hasMoreStreets 
        ? `PROCEED TO NEXT AREA ➔` 
        : 'VIEW FINAL ELECTION RESULTS ➔';

      new Button(this, width / 2, btnY, btnText, () => {
        if (hasMoreStreets) {
          scoreManager.currentStreetIndex++;
          this.scene.start('GameScene', { partyId: this.partyId });
        } else {
          this.scene.start('ResultsScene', { partyId: this.partyId });
        }
      }, {
        width: isPortrait ? cw - 32 : 440,
        height: isPortrait ? 48 : 64,
        bgColor: 0x1f9137,
        hoverColor: 0x27ab42,
        fontSize: isPortrait ? '17px' : '22px'
      });
    } else {
      const btnW = isPortrait ? (cw - 36) / 2 : 300;
      const btnH = isPortrait ? 48 : 64;
      const btnColOffset = isPortrait ? btnW / 2 + 4 : 160;

      // High-Urgency Retry Button
      new Button(this, width / 2 - btnColOffset, btnY, isPortrait ? 'RETRY AREA ↺' : '⚡ RETRY AREA (30s) ↺', () => {
        this.scene.start('GameScene', { partyId: this.partyId });
      }, {
        width: btnW,
        height: btnH,
        bgColor: 0xdb580a,
        hoverColor: 0xf06a1a,
        fontSize: isPortrait ? '13px' : '20px'
      });

      // Continue button anyway
      new Button(this, width / 2 + btnColOffset, btnY, isPortrait ? 'CONTINUE ➔' : 'CONTINUE ANYWAY ➔', () => {
        if (hasMoreStreets) {
          scoreManager.currentStreetIndex++;
          this.scene.start('GameScene', { partyId: this.partyId });
        } else {
          this.scene.start('ResultsScene', { partyId: this.partyId });
        }
      }, {
        width: btnW,
        height: btnH,
        bgColor: 0x1f3c6e,
        hoverColor: 0x2b5294,
        fontSize: isPortrait ? '13px' : '18px'
      });
    }
  }
}
