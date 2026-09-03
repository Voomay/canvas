import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ScoreManager } from '../systems/ScoreManager';

interface PartyCardContainer {
  partyId: 'da' | 'anc' | 'pa';
  container: Phaser.GameObjects.Container;
  borderGraphics: Phaser.GameObjects.Graphics;
  selectedTag: Phaser.GameObjects.Container;
  w: number;
  h: number;
}

export class MainMenuScene extends Phaser.Scene {
  private selectedPartyId: 'da' | 'anc' | 'pa' = 'da';
  private cardContainers: PartyCardContainer[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public create() {
    const { width, height } = this.scale;
    const isPortrait = height > width;
    this.cardContainers = [];

    // 1. Background Location (Cape Town / Hanover Park), Moving Sky Clouds & Road
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    const cloudKey = this.textures.exists('bg_clouds_sky') ? 'bg_clouds_sky' : (this.textures.exists('real_bg_clouds') ? 'real_bg_clouds' : 'bg_clouds');
    const locationKey = this.textures.exists('bg_location_capetown') ? 'bg_location_capetown' : (this.textures.exists('real_bg_houses') ? 'real_bg_houses' : 'bg_houses');
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    
    const roadHeight = 292;
    const roadY = isPortrait ? height - roadHeight : 428;
    const locY = isPortrait ? roadY - 432 + 4 : 0;

    this.add.tileSprite(0, locY, width, 432, locationKey).setOrigin(0, 0);
    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, roadY, width, roadHeight, roadKey).setOrigin(0, 0);

    // Curbside Minibus Taxi standing on Hanover Park road
    if (this.textures.exists('vehicle_taxi_minibus')) {
      const menuTaxi = this.add.sprite(isPortrait ? width * 0.70 : width * 0.72, roadY + 70, 'vehicle_taxi_minibus');
      menuTaxi.setOrigin(0.5, 1);
      menuTaxi.play('taxi_minibus_anim');
    }

    // Dark semi-transparent overlay for card readability
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a101a, 0.80);
    overlay.fillRect(0, 0, width, height);

    const partyList: { id: 'da' | 'anc' | 'pa'; name: string; full: string; slogan: string; color: number; textColor: string }[] = [
      { id: 'da', name: 'DA', full: 'Democratic Alliance', slogan: 'Spreadsheets & clean takkies', color: 0x005ba6, textColor: '#ffffff' },
      { id: 'anc', name: 'ANC', full: 'African National Congress', slogan: 'Historic rallies & warm greetings', color: 0xfcb813, textColor: '#0c1524' },
      { id: 'pa', name: 'PA', full: 'Patriotic Alliance', slogan: 'Bold swagger & rapid canvassing', color: 0x1e6b38, textColor: '#ffffff' }
    ];

    if (isPortrait) {
      // ----------------------------------------------------
      // MOBILE PORTRAIT VIEW (Clean, stacked, thumb-friendly)
      // ----------------------------------------------------
      const titleW = Math.min(width - 20, 430);
      const titleH = 86;
      const titleBox = this.add.graphics();
      titleBox.fillStyle(0x0c1524, 0.95);
      titleBox.fillRoundedRect(width / 2 - titleW / 2, 12, titleW, titleH, 14);
      titleBox.lineStyle(2.5, 0x1f3c6e, 1);
      titleBox.strokeRoundedRect(width / 2 - titleW / 2, 12, titleW, titleH, 14);

      if (this.textures.exists('logo_canvassing_sa')) {
        const logo = this.add.image(width / 2 - titleW / 2 + 46, 12 + titleH / 2, 'logo_canvassing_sa');
        logo.setDisplaySize(68, 68);

        this.add.text(width / 2 - titleW / 2 + 88, 36, 'CANVASSING SA', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '22px',
          color: '#fcb813',
          fontStyle: '900',
          stroke: '#080d14',
          strokeThickness: 4
        }).setOrigin(0, 0.5);

        this.add.text(width / 2 - titleW / 2 + 88, 66, 'Join your political party canvassing around South Africa', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '10.5px',
          color: '#e2e8f0',
          fontStyle: '600',
          wordWrap: { width: titleW - 96 }
        }).setOrigin(0, 0.5);
      } else {
        this.add.text(width / 2, 38, 'CANVASSING SA', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '26px',
          color: '#fcb813',
          fontStyle: '900',
          stroke: '#080d14',
          strokeThickness: 4
        }).setOrigin(0.5, 0.5);

        this.add.text(width / 2, 68, 'Join your political party canvassing around South Africa', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: '600',
          align: 'center',
          wordWrap: { width: titleW - 24 }
        }).setOrigin(0.5, 0.5);
      }

      this.add.text(width / 2, 118, '🗳️ SELECT YOUR PARTY TO CANVASS', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#fcb813',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      // 3 Vertically Stacked Party Cards
      const cardW = Math.min(width - 24, 424);
      const cardH = 92;
      const startY = 180;
      const cardGap = 100;

      partyList.forEach((p, index) => {
        const cardY = startY + index * cardGap;
        const card = this.createPortraitCard(p.id, p.name, p.full, p.slogan, p.color, p.textColor, width / 2, cardY, cardW, cardH);
        this.cardContainers.push(card);
      });

      // How to Play brief
      const infoW = cardW;
      const infoH = 78;
      const infoY = startY + 3 * cardGap + 6;

      const infoBg = this.add.graphics();
      infoBg.fillStyle(0x0c1524, 0.92);
      infoBg.fillRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 12);
      infoBg.lineStyle(2, 0x223552, 1);
      infoBg.strokeRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 12);

      this.add.text(width / 2, infoY + 16, '🎮 HOW TO PLAY', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      const instructions = [
        '• Tap JUMP! or screen to leap over sidewalk obstacles',
        '• Meet residents on sidewalk: Stop to talk or keep running',
        '• Promise, Blame, or Funny Honesty to win votes & trust!'
      ];

      instructions.forEach((inst, i) => {
        this.add.text(width / 2, infoY + 36 + i * 16, inst, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '10px',
          color: '#cbd5e1'
        }).setOrigin(0.5, 0.5);
      });

      // START CANVASSING button (Prominent)
      const btnY = infoY + infoH + 34;
      new Button(this, width / 2, btnY, 'START CANVASSING ➔', () => {
        ScoreManager.getInstance().resetGame();
        this.scene.start('GameScene', { partyId: this.selectedPartyId });
      }, {
        width: Math.min(width - 32, 400),
        height: 50,
        bgColor: 0x1f9137,
        hoverColor: 0x27ab42,
        fontSize: '20px'
      });

      // Mobile Bottom Bar: INSTALL APP & FULLSCREEN buttons
      const utilY = btnY + 48;
      const utilBtnW = (cardW - 16) / 2;

      new Button(this, width / 2 - utilBtnW / 2 - 4, utilY, '📲 INSTALL APP', async () => {
        if (typeof (window as any).promptPwaInstall === 'function') {
          const accepted = await (window as any).promptPwaInstall();
          if (accepted) console.log('User installed PWA!');
        } else {
          alert('To install: tap your browser menu and choose "Add to Home screen" / "Install app"');
        }
      }, {
        width: utilBtnW,
        height: 38,
        bgColor: 0x132338,
        hoverColor: 0x1f3c6e,
        fontSize: '13px'
      });

      new Button(this, width / 2 + utilBtnW / 2 + 4, utilY, '⛶ FULLSCREEN', () => {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
      }, {
        width: utilBtnW,
        height: 38,
        bgColor: 0x132338,
        hoverColor: 0x1f3c6e,
        fontSize: '13px'
      });

    } else {
      // ----------------------------------------------------
      // DESKTOP & LANDSCAPE VIEW (Side-by-side wide layout)
      // ----------------------------------------------------
      const titleBoxW = Math.min(width - 40, 880);
      const titleBoxH = 108;
      const titleBox = this.add.graphics();
      titleBox.fillStyle(0x0c1524, 0.95);
      titleBox.fillRoundedRect(width / 2 - titleBoxW / 2, 20, titleBoxW, titleBoxH, 18);
      titleBox.lineStyle(3, 0x1f3c6e, 1);
      titleBox.strokeRoundedRect(width / 2 - titleBoxW / 2, 20, titleBoxW, titleBoxH, 18);

      if (this.textures.exists('logo_canvassing_sa')) {
        const logo = this.add.image(width / 2 - titleBoxW / 2 + 68, 20 + titleBoxH / 2, 'logo_canvassing_sa');
        logo.setDisplaySize(92, 92);

        this.add.text(width / 2 - titleBoxW / 2 + 130, 52, 'CANVASSING SA', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '38px',
          color: '#fcb813',
          fontStyle: '900',
          stroke: '#080d14',
          strokeThickness: 5
        }).setOrigin(0, 0.5);

        this.add.text(width / 2 - titleBoxW / 2 + 130, 92, 'Join your political party canvassing around South Africa', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '17px',
          color: '#ffffff',
          fontStyle: '600'
        }).setOrigin(0, 0.5);
      } else {
        this.add.text(width / 2, 52, 'CANVASSING SA', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '42px',
          color: '#fcb813',
          fontStyle: '900',
          stroke: '#080d14',
          strokeThickness: 5
        }).setOrigin(0.5, 0.5);

        this.add.text(width / 2, 94, 'Join your political party canvassing around South Africa', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '17px',
          color: '#ffffff',
          fontStyle: '600'
        }).setOrigin(0.5, 0.5);
      }

      this.add.text(width / 2, 155, '🗳️ SELECT YOUR PARTY TO CANVASS', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '20px',
        color: '#fcb813',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      const cardWidth = 240;
      const cardHeight = 250;
      const cardSpacing = 265;
      const startX = width / 2 - cardSpacing;
      const cardY = 300;

      partyList.forEach((p, index) => {
        const cardX = startX + index * cardSpacing;
        const card = this.createLandscapeCard(p.id, p.name, p.full, p.color, p.textColor, cardX, cardY, cardWidth, cardHeight);
        this.cardContainers.push(card);
      });

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

    this.updateSelection();
  }

  // Portrait Mobile Card: Horizontal layout with clear party badge, candidate illustration, and locked/selected status
  private createPortraitCard(
    partyId: 'da' | 'anc' | 'pa',
    name: string,
    fullName: string,
    slogan: string,
    colorNum: number,
    textColor: string,
    x: number,
    y: number,
    w: number,
    h: number
  ): PartyCardContainer {
    const isAvailable = partyId === 'da' || partyId === 'anc';
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x111c2c, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    container.add(bg);

    // Dynamic border graphic
    const border = this.add.graphics();
    container.add(border);

    // Left party badge block
    const badgeW = 90;
    const banner = this.add.graphics();
    banner.fillStyle(colorNum, 1);
    banner.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, badgeW, h - 10, { tl: 10, bl: 10, tr: 4, br: 4 });
    container.add(banner);

    // Party Name in banner
    const nameText = this.add.text(-w / 2 + 5 + badgeW / 2, -10, name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '22px',
      color: textColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Full name in banner
    const fullText = this.add.text(-w / 2 + 5 + badgeW / 2, 16, fullName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '8px',
      color: textColor === '#ffffff' ? '#f1f5f9' : '#1e293b',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: badgeW - 8 }
    }).setOrigin(0.5, 0.5);
    container.add(fullText);

    // Authentic candidate sprite (cleanly scaled)
    const spriteKey = `player_${partyId}_idle`;
    const sprite = this.add.sprite(-w / 2 + badgeW + 36, 4, spriteKey);
    sprite.setScale(0.50);
    container.add(sprite);

    // Slogan in middle
    const sloganText = this.add.text(-w / 2 + badgeW + 74, 0, slogan, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#94a3b8',
      fontStyle: '600',
      wordWrap: { width: Math.max(80, w - badgeW - 170) }
    }).setOrigin(0, 0.5);
    container.add(sloganText);

    // Status Tag (Selected / Locked)
    const tagW = isAvailable ? 74 : 96;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 8, 0);
    const tagBg = this.add.graphics();

    if (isAvailable) {
      tagBg.fillStyle(0xfcb813, 1);
      tagBg.fillRoundedRect(-tagW / 2, -13, tagW, 26, 7);
      const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '10px',
        color: '#111111',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
    } else {
      tagBg.fillStyle(0xd93838, 1);
      tagBg.fillRoundedRect(-tagW / 2, -13, tagW, 26, 7);
      const tagTxt = this.add.text(0, 0, 'COMING SOON 🔒', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '9px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
      container.setAlpha(0.75);
    }
    container.add(selectedTag);

    // Interactivity
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: isAvailable });

    container.on('pointerdown', () => {
      if (isAvailable) {
        this.selectedPartyId = partyId;
        this.updateSelection();
      } else {
        this.showUnavailableToast("PA is not available yet! We're still building Gayton's character. Play as DA or ANC to start canvassing now.");
      }
    });

    return { partyId, container, borderGraphics: border, selectedTag, w, h };
  }

  // Landscape Card: Original 3-column layout
  private createLandscapeCard(
    partyId: 'da' | 'anc' | 'pa',
    name: string,
    fullName: string,
    colorNum: number,
    textColor: string,
    x: number,
    y: number,
    w: number,
    h: number
  ): PartyCardContainer {
    const isAvailable = partyId === 'da' || partyId === 'anc';
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x111c2c, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    container.add(bg);

    const border = this.add.graphics();
    container.add(border);

    const banner = this.add.graphics();
    banner.fillStyle(colorNum, 1);
    banner.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, 44, { tl: 10, tr: 10, bl: 4, br: 4 });
    container.add(banner);

    const nameText = this.add.text(0, -h / 2 + 28, name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '26px',
      color: textColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    const fullText = this.add.text(0, -h / 2 + 60, fullName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(fullText);

    const spriteKey = `player_${partyId}_idle`;
    const sprite = this.add.sprite(0, 32, spriteKey);
    sprite.setScale(0.72);
    container.add(sprite);

    const tagW = isAvailable ? 76 : 106;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 8, -h / 2 + 16);
    const tagBg = this.add.graphics();

    if (isAvailable) {
      tagBg.fillStyle(0xfcb813, 1);
      tagBg.fillRoundedRect(-38, -11, 76, 22, 6);
      const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '10px',
        color: '#111111',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
      selectedTag.setVisible(true);
    } else {
      tagBg.fillStyle(0xd93838, 1);
      tagBg.fillRoundedRect(-53, -11, 106, 22, 6);
      const tagTxt = this.add.text(0, 0, 'COMING SOON 🔒', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '9px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
      selectedTag.setVisible(true);
      container.setAlpha(0.75);
    }
    container.add(selectedTag);

    container.setSize(w, h);
    container.setInteractive({ useHandCursor: isAvailable });

    container.on('pointerdown', () => {
      if (isAvailable) {
        this.selectedPartyId = partyId;
        this.updateSelection();
      } else {
        this.showUnavailableToast("PA is not available yet! We're still building Gayton's character. Play as DA or ANC to start canvassing now.");
      }
    });

    container.on('pointerover', () => {
      if (isAvailable && this.selectedPartyId !== partyId) {
        container.setScale(1.02);
      }
    });

    container.on('pointerout', () => {
      if (isAvailable && this.selectedPartyId !== partyId) {
        container.setScale(1.0);
      }
    });

    return { partyId, container, borderGraphics: border, selectedTag, w, h };
  }

  private showUnavailableToast(msg: string) {
    const { width, height } = this.scale;
    const isPortrait = height > width;
    const existing = this.children.getByName('unavailableToast');
    if (existing) existing.destroy();

    const toastY = isPortrait ? height / 2 : 420;
    const toastW = Math.min(width - 40, 620);
    const toast = this.add.container(width / 2, toastY);
    toast.setName('unavailableToast');
    toast.setDepth(30);

    const bg = this.add.graphics();
    bg.fillStyle(0x2d1212, 0.95);
    bg.lineStyle(2, 0xe53e3e, 1);
    bg.fillRoundedRect(-toastW / 2, -22, toastW, 44, 10);
    bg.strokeRoundedRect(-toastW / 2, -22, toastW, 44, 10);

    const txt = this.add.text(0, 0, msg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '12px' : '14px',
      color: '#ffaaaa',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: toastW - 20 }
    }).setOrigin(0.5, 0.5);

    toast.add([bg, txt]);

    this.tweens.add({
      targets: toast,
      alpha: { from: 0, to: 1 },
      y: { from: toastY + 10, to: toastY },
      duration: 200,
      hold: 2400,
      yoyo: true,
      onComplete: () => toast.destroy()
    });
  }

  private updateSelection() {
    this.cardContainers.forEach(item => {
      const isSelected = item.partyId === this.selectedPartyId;
      item.borderGraphics.clear();

      if (isSelected) {
        item.borderGraphics.lineStyle(4, 0xfcb813, 1);
        item.borderGraphics.strokeRoundedRect(-item.w / 2, -item.h / 2, item.w, item.h, 16);
        item.selectedTag.setVisible(true);
        item.container.setScale(1.02);
        item.container.setAlpha(1.0);
      } else {
        item.borderGraphics.lineStyle(2, 0x223552, 0.8);
        item.borderGraphics.strokeRoundedRect(-item.w / 2, -item.h / 2, item.w, item.h, 16);
        if (item.partyId === 'da' || item.partyId === 'anc') {
          item.selectedTag.setVisible(false);
          item.container.setAlpha(0.85);
        } else {
          item.selectedTag.setVisible(true);
          item.container.setAlpha(0.72);
        }
        item.container.setScale(1.0);
      }
    });
  }
}
