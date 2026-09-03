import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ScoreManager } from '../systems/ScoreManager';

interface PartyCardContainer {
  partyId: 'da' | 'anc' | 'pa';
  container: Phaser.GameObjects.Container;
  borderGraphics: Phaser.GameObjects.Graphics;
  selectedTag: Phaser.GameObjects.Container;
}

export class MainMenuScene extends Phaser.Scene {
  private selectedPartyId: 'da' | 'anc' | 'pa' = 'da';
  private cardContainers: PartyCardContainer[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public create() {
    const { width, height } = this.scale;
    this.cardContainers = [];

    // 1. Background Location (Cape Town / Hanover Park), Moving Sky Clouds & Road
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    const cloudKey = this.textures.exists('bg_clouds_sky') ? 'bg_clouds_sky' : (this.textures.exists('real_bg_clouds') ? 'real_bg_clouds' : 'bg_clouds');
    const locationKey = this.textures.exists('bg_location_capetown') ? 'bg_location_capetown' : (this.textures.exists('real_bg_houses') ? 'real_bg_houses' : 'bg_houses');
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    this.add.tileSprite(0, 0, width, 432, locationKey).setOrigin(0, 0);
    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, 428, width, 292, roadKey).setOrigin(0, 0);

    // Dark semi-transparent overlay for card readability
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a101a, 0.78);
    overlay.fillRect(0, 0, width, height);

    // 2. Main Title Card (Compact & crisp)
    const titleBox = this.add.graphics();
    titleBox.fillStyle(0x0c1524, 0.95);
    titleBox.fillRoundedRect(width / 2 - 420, 25, 840, 105, 18);
    titleBox.lineStyle(3, 0x1f3c6e, 1);
    titleBox.strokeRoundedRect(width / 2 - 420, 25, 840, 105, 18);

    this.add.text(width / 2, 55, 'CAMPAIGN TRAIL', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '42px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 98, 'The Humorous South African Political Canvassing Game', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: '600'
    }).setOrigin(0.5, 0.5);

    // 3. "SELECT YOUR PARTY" Subtitle
    this.add.text(width / 2, 155, '🗳️ SELECT YOUR PARTY TO CANVASS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    // 4. Interactive Party Selection Cards (DA, ANC, PA - NO candidate names!)
    const partyList: { id: 'da' | 'anc' | 'pa'; name: string; full: string; color: number; hex: string }[] = [
      { id: 'da', name: 'DA', full: 'Democratic Alliance', color: 0x005ba6, hex: '#005ba6' },
      { id: 'anc', name: 'ANC', full: 'African National Congress', color: 0x007a3d, hex: '#007a3d' },
      { id: 'pa', name: 'PA', full: 'Patriotic Alliance', color: 0x1e6b38, hex: '#1e6b38' }
    ];

    const cardWidth = 240;
    const cardHeight = 250;
    const cardSpacing = 265;
    const startX = width / 2 - cardSpacing;
    const cardY = 300;

    partyList.forEach((p, index) => {
      const cardX = startX + index * cardSpacing;
      const card = this.createPartyCard(p.id, p.name, p.full, p.color, cardX, cardY, cardWidth, cardHeight);
      this.cardContainers.push(card);
    });

    this.updateSelection();

    // 5. How to Play Brief
    const infoBg = this.add.graphics();
    infoBg.fillStyle(0x0c1524, 0.92);
    infoBg.fillRoundedRect(width / 2 - 380, 445, 760, 110, 14);
    infoBg.lineStyle(2, 0x223552, 1);
    infoBg.strokeRoundedRect(width / 2 - 380, 445, 760, 110, 14);

    this.add.text(width / 2, 468, '🎮 HOW TO PLAY', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const instructions = [
      '• Run down neighbourhood streets (Spacebar / Up Arrow / Tap to Jump)',
      '• Meet residents on sidewalk: Stop to talk or keep running',
      '• Choose Promise, Blame, or Funny Honesty to win votes & trust!'
    ];

    instructions.forEach((inst, i) => {
      this.add.text(width / 2, 496 + i * 20, inst, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#cbd5e1'
      }).setOrigin(0.5, 0.5);
    });

    // 6. Direct START CANVASSING Button
    new Button(this, width / 2, 620, 'START CANVASSING ➔', () => {
      ScoreManager.getInstance().resetGame();
      this.scene.start('GameScene', { partyId: this.selectedPartyId });
    }, {
      width: 380,
      height: 64,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: '24px'
    });
  }

  private createPartyCard(
    partyId: 'da' | 'anc' | 'pa',
    name: string,
    fullName: string,
    colorNum: number,
    x: number,
    y: number,
    w: number,
    h: number
  ): PartyCardContainer {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x111c2c, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    container.add(bg);

    // Dynamic border graphic
    const border = this.add.graphics();
    container.add(border);

    // Top party badge banner
    const banner = this.add.graphics();
    banner.fillStyle(colorNum, 1);
    banner.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, 44, { tl: 10, tr: 10, bl: 4, br: 4 });
    container.add(banner);

    // Party Name
    const nameText = this.add.text(0, -h / 2 + 28, name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Full name
    const fullText = this.add.text(0, -h / 2 + 60, fullName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(fullText);

    // Character preview sprite (cleanly scaled)
    const spriteKey = `player_${partyId}_idle`;
    const sprite = this.add.sprite(0, 32, spriteKey);
    sprite.setScale(0.72);
    container.add(sprite);

    // Selected Tag container (Top right corner of card)
    const selectedTag = this.add.container(w / 2 - 46, -h / 2 + 16);
    const tagBg = this.add.graphics();
    tagBg.fillStyle(0xfcb813, 1);
    tagBg.fillRoundedRect(-38, -11, 76, 22, 6);
    const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      color: '#111111',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    selectedTag.add([tagBg, tagTxt]);
    selectedTag.setVisible(false);
    container.add(selectedTag);

    // Make entire card interactive
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.selectedPartyId = partyId;
      this.updateSelection();
    });

    container.on('pointerover', () => {
      if (this.selectedPartyId !== partyId) {
        container.setScale(1.02);
      }
    });

    container.on('pointerout', () => {
      if (this.selectedPartyId !== partyId) {
        container.setScale(1.0);
      }
    });

    return { partyId, container, borderGraphics: border, selectedTag };
  }

  private updateSelection() {
    const cardWidth = 240;
    const cardHeight = 250;

    this.cardContainers.forEach(item => {
      const isSelected = item.partyId === this.selectedPartyId;
      item.borderGraphics.clear();

      if (isSelected) {
        // Glowing gold highlight border
        item.borderGraphics.lineStyle(4, 0xfcb813, 1);
        item.borderGraphics.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
        item.selectedTag.setVisible(true);
        item.container.setScale(1.04);
        item.container.setAlpha(1.0);
      } else {
        // Subtle border
        item.borderGraphics.lineStyle(2, 0x223552, 0.8);
        item.borderGraphics.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
        item.selectedTag.setVisible(false);
        item.container.setScale(1.0);
        item.container.setAlpha(0.85);
      }
    });
  }
}
