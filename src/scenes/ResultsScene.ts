import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { PARTIES } from '../data/parties';
import { Button } from '../ui/Button';
import { SoundFX } from '../systems/SoundFX';

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

    // Main Results Container Card
    const card = this.add.graphics();
    const cw = 880;
    const ch = 580;
    card.fillStyle(0x0f1a29, 0.98);
    card.fillRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 24);
    card.lineStyle(4, 0xfcb813, 1);
    card.strokeRoundedRect(width / 2 - cw / 2, height / 2 - ch / 2, cw, ch, 24);

    // Header & Party Badge
    this.add.text(width / 2, 105, '🗳️ FINAL ELECTION RESULTS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '40px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 145, `Canvassing Report for ${party.name} (${party.fullName})`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    // Humorous Campaign Rating Banner
    const ratingBg = this.add.graphics();
    ratingBg.fillStyle(0x19283f, 1);
    ratingBg.fillRoundedRect(width / 2 - 380, 175, 760, 95, 14);
    ratingBg.lineStyle(3, 0xfcb813, 1);
    ratingBg.strokeRoundedRect(width / 2 - 380, 175, 760, 95, 14);

    this.add.text(width / 2, 202, `${rating.badgeEmoji} AWARD: "${rating.title.toUpperCase()}"`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 238, rating.subtitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5, 0.5);

    // Statistics Breakdown Grid
    const statsList = [
      { label: 'TOTAL VOTES', val: `${scoreManager.votes}`, color: '#44dd66', icon: '🗳️' },
      { label: 'COMMUNITY TRUST', val: `${Math.round(scoreManager.trust)}%`, color: '#fcb813', icon: '🤝' },
      { label: 'RESIDENTS APPROACHED', val: `${scoreManager.stats.residentsApproached}`, color: '#ffffff', icon: '🗣️' },
      { label: 'RESIDENTS IGNORED', val: `${scoreManager.stats.residentsIgnored}`, color: '#a0aec0', icon: '🏃' },
      { label: 'PROMISES MADE', val: `${scoreManager.stats.promisesMade}`, color: '#55dd88', icon: '📜' },
      { label: 'BLAMES ATTRIBUTED', val: `${scoreManager.stats.blamesGiven}`, color: '#f59e0b', icon: '👉' },
      { label: 'HONEST ANSWERS GIVEN', val: `${scoreManager.stats.honestyGiven}`, color: '#38bdf8', icon: '😂' },
      { label: 'ROAD OBSTACLES HIT', val: `${scoreManager.stats.obstaclesHit}`, color: '#ef4444', icon: '💥' }
    ];

    statsList.forEach((st, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const bx = width / 2 - 315 + col * 210;
      const by = 330 + row * 95;

      const statBox = this.add.graphics();
      statBox.fillStyle(0x0a121d, 0.9);
      statBox.fillRoundedRect(bx - 95, by - 38, 190, 76, 12);
      statBox.lineStyle(2, 0x1f3c6e, 1);
      statBox.strokeRoundedRect(bx - 95, by - 38, 190, 76, 12);

      this.add.text(bx, by - 16, `${st.icon} ${st.label}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      this.add.text(bx, by + 14, st.val, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '24px',
        color: st.color,
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
    });

    // Action Buttons: PLAY AGAIN & MAIN MENU
    new Button(this, width / 2 - 190, 580, '↺ CANVASS AGAIN', () => {
      ScoreManager.getInstance().resetGame();
      this.scene.start('MainMenuScene');
    }, {
      width: 320,
      height: 60,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: '20px'
    });

    new Button(this, width / 2 + 190, 580, 'MAIN MENU 🏠', () => {
      this.scene.start('MainMenuScene');
    }, {
      width: 320,
      height: 60,
      bgColor: 0x176bc4,
      hoverColor: 0x2480e6,
      fontSize: '20px'
    });
  }
}
