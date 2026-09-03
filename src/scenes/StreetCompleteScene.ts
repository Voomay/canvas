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

    // Summary Card
    const card = this.add.graphics();
    const cw = 700;
    const ch = 480;
    card.fillStyle(0x131f30, 0.96);
    card.fillRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2 - 20, cw, ch, 20);
    card.lineStyle(4, 0xfcb813, 1);
    card.strokeRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2 - 20, cw, ch, 20);

    // Header
    this.add.text(width / 2, height / 2 - 210, `🎉 STREET ${completedStreetIndex} COMPLETED!`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '38px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, height / 2 - 165, currentStreetData.suburb, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, height / 2 - 135, `Theme: "${currentStreetData.theme}"`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#a0aec0',
      fontStyle: 'italic'
    }).setOrigin(0.5, 0.5);

    // Stats Grid
    const statItems = [
      { label: 'Total Votes Won', val: `${scoreManager.votes} 🗳️`, color: '#44dd66' },
      { label: 'Community Trust', val: `${Math.round(scoreManager.trust)}%`, color: '#fcb813' },
      { label: 'Residents Approached', val: `${scoreManager.stats.residentsApproached} 🗣️`, color: '#ffffff' },
      { label: 'Potholes / Hazards Hit', val: `${scoreManager.stats.obstaclesHit} 💥`, color: '#ff6b6b' }
    ];

    statItems.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const sx = width / 2 - 160 + col * 320;
      const sy = height / 2 - 60 + row * 90;

      const statBg = this.add.graphics();
      statBg.fillStyle(0x0c1524, 0.9);
      statBg.fillRoundedRect(sx - 140, sy - 34, 280, 68, 12);
      statBg.lineStyle(2, 0x1f3c6e, 1);
      statBg.strokeRoundedRect(sx - 140, sy - 34, 280, 68, 12);

      this.add.text(sx, sy - 12, st.label, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#a0aec0',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      this.add.text(sx, sy + 14, st.val, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '22px',
        color: st.color,
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
    });

    // Button: Next Street or Final Results
    const hasMoreStreets = completedStreetIndex < scoreManager.totalStreets;
    const btnText = hasMoreStreets 
      ? `PROCEED TO STREET ${completedStreetIndex + 1} ➔` 
      : 'VIEW FINAL ELECTION RESULTS ➔';

    new Button(this, width / 2, height / 2 + 165, btnText, () => {
      if (hasMoreStreets) {
        scoreManager.currentStreetIndex++;
        this.scene.start('GameScene', { partyId: this.partyId });
      } else {
        this.scene.start('ResultsScene', { partyId: this.partyId });
      }
    }, {
      width: 440,
      height: 64,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: '22px'
    });
  }
}
