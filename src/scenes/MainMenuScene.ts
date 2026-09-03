import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ScoreManager } from '../systems/ScoreManager';
import { AdvertiseModal } from '../ui/AdvertiseModal';

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
      // Prominent centered official logo (Nice & Big on Mobile)
      const mobileLogoSize = Math.min(width * 0.35, 130);
      const logoCenterY = mobileLogoSize / 2 + 8;
      if (this.textures.exists('logo_canvassing_sa')) {
        const logo = this.add.image(width / 2, logoCenterY, 'logo_canvassing_sa');
        logo.setDisplaySize(mobileLogoSize, mobileLogoSize);
      }

      this.add.text(width / 2, mobileLogoSize + 18, '🗳️ SELECT YOUR PARTY TO CANVASS', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '14.5px',
        color: '#fcb813',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      // 3 Vertically Stacked Party Cards
      const cardW = Math.min(width - 24, 424);
      const cardH = 80;
      const startY = mobileLogoSize + 56;
      const cardGap = 84;

      partyList.forEach((p, index) => {
        const cardY = startY + index * cardGap;
        const card = this.createPortraitCard(p.id, p.name, p.full, p.slogan, p.color, p.textColor, width / 2, cardY, cardW, cardH);
        this.cardContainers.push(card);
      });

      // How to Play brief
      const infoW = cardW;
      const infoH = 92;
      const infoY = startY + 2 * cardGap + 46;

      const infoBg = this.add.graphics();
      infoBg.fillStyle(0x0c1524, 0.92);
      infoBg.fillRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 12);
      infoBg.lineStyle(2, 0x223552, 1);
      infoBg.strokeRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 12);

      this.add.text(width / 2, infoY + 13, '🎮 HOW TO PLAY', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      const instructions = [
        '• Run down the neighbourhood canvassing (Tap to Jump)',
        '• Meet residents: Stop to talk to gain votes, or keep running',
        '• Choose Promise, Blame, or Honesty to win votes & trust!',
        '• Jump over potholes to fix them & gain extra time for votes!'
      ];

      instructions.forEach((inst, i) => {
        this.add.text(width / 2, infoY + 30 + i * 15, inst, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '11px',
          color: '#f1f5f9',
          fontStyle: '600'
        }).setOrigin(0.5, 0.5);
      });

      // START CANVASSING button (Prominent Primary Mobile Action)
      const btnY = infoY + infoH + 30;
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

      // Advertise with Us link for mobile
      const adMobileText = this.add.text(width / 2, btnY + 38, '📢 Want to feature your brand in-game? Advertise With Us ➔', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      adMobileText.setInteractive({ useHandCursor: true });
      adMobileText.on('pointerover', () => adMobileText.setColor('#ffffff'));
      adMobileText.on('pointerout', () => adMobileText.setColor('#fcb813'));
      adMobileText.on('pointerdown', () => AdvertiseModal.open());

      // Floating PWA Install Prompt for mobile (disappears once installed)
      this.showPwaInstallPrompt(width, height);
    } else {
      // ----------------------------------------------------
      // DESKTOP & LANDSCAPE VIEW (Side-by-side wide layout)
      // ----------------------------------------------------
      const titleBoxW = Math.min(width - 40, 780);
      const titleBoxH = 108;
      const titleBox = this.add.graphics();
      titleBox.fillStyle(0x0c1524, 0.95);
      titleBox.fillRoundedRect(width / 2 - titleBoxW / 2, 20, titleBoxW, titleBoxH, 18);
      titleBox.lineStyle(3, 0x1f3c6e, 1);
      titleBox.strokeRoundedRect(width / 2 - titleBoxW / 2, 20, titleBoxW, titleBoxH, 18);

      if (this.textures.exists('logo_canvassing_sa')) {
        const titleText = this.add.text(0, 0, 'CANVASSING SA', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '38px',
          color: '#fcb813',
          fontStyle: '900',
          stroke: '#080d14',
          strokeThickness: 5
        });

        const subText = this.add.text(0, 0, 'Join your political party canvassing around South Africa', {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '17px',
          color: '#ffffff',
          fontStyle: '600'
        });

        const logoSize = 92;
        const logoGap = 22;
        const textBlockWidth = Math.max(titleText.width, subText.width);
        const totalContentWidth = logoSize + logoGap + textBlockWidth;

        const contentStartX = width / 2 - totalContentWidth / 2;
        const logo = this.add.image(contentStartX + logoSize / 2, 20 + titleBoxH / 2, 'logo_canvassing_sa');
        logo.setDisplaySize(logoSize, logoSize);

        const textX = contentStartX + logoSize + logoGap;
        titleText.setPosition(textX, 52).setOrigin(0, 0.5);
        subText.setPosition(textX, 92).setOrigin(0, 0.5);
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
      infoBg.fillRoundedRect(width / 2 - 380, 440, 760, 126, 14);
      infoBg.lineStyle(2, 0x223552, 1);
      infoBg.strokeRoundedRect(width / 2 - 380, 440, 760, 126, 14);

      this.add.text(width / 2, 460, '🎮 HOW TO PLAY', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      const instructions = [
        '• Run down the neighbourhood canvassing (Spacebar / Up Arrow / Tap to Jump)',
        '• Meet residents: Stop to talk to gain votes, or keep running',
        '• Choose Promise, Blame, or Honesty to win votes & trust!',
        '• Jump over potholes to fix them & gain extra time to reach your vote target!'
      ];

      instructions.forEach((inst, i) => {
        this.add.text(width / 2, 484 + i * 19, inst, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '13.5px',
          color: '#f1f5f9',
          fontStyle: '600'
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

      // Advertise with Us Link & Top Sponsor Badge
      const adDesktopText = this.add.text(width / 2, 676, '📢 Want your brand on in-game minibus taxis & billboards? Advertise With Us ➔', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#fcb813',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      adDesktopText.setInteractive({ useHandCursor: true });
      adDesktopText.on('pointerover', () => adDesktopText.setColor('#ffffff'));
      adDesktopText.on('pointerout', () => adDesktopText.setColor('#fcb813'));
      adDesktopText.on('pointerdown', () => AdvertiseModal.open());

      // Top corner sponsor button
      const sponsorBadge = this.add.container(width - 110, 32);
      const sbBg = this.add.graphics();
      sbBg.fillStyle(0x0c1524, 0.94);
      sbBg.fillRoundedRect(-86, -15, 172, 30, 15);
      sbBg.lineStyle(1.5, 0xfcb813, 0.9);
      sbBg.strokeRoundedRect(-86, -15, 172, 30, 15);
      const sbTxt = this.add.text(0, 0, '📢 ADVERTISE WITH US', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#fcb813',
        fontStyle: '800'
      }).setOrigin(0.5, 0.5);
      const sbZone = this.add.zone(0, 0, 172, 30).setInteractive({ useHandCursor: true });
      sbZone.on('pointerover', () => {
        sbBg.clear();
        sbBg.fillStyle(0x1f3c6e, 1);
        sbBg.fillRoundedRect(-86, -15, 172, 30, 15);
        sbBg.lineStyle(1.5, 0xfcb813, 1);
        sbBg.strokeRoundedRect(-86, -15, 172, 30, 15);
      });
      sbZone.on('pointerout', () => {
        sbBg.clear();
        sbBg.fillStyle(0x0c1524, 0.94);
        sbBg.fillRoundedRect(-86, -15, 172, 30, 15);
        sbBg.lineStyle(1.5, 0xfcb813, 0.9);
        sbBg.strokeRoundedRect(-86, -15, 172, 30, 15);
      });
      sbZone.on('pointerdown', () => AdvertiseModal.open());
      sponsorBadge.add([sbBg, sbTxt, sbZone]);
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
      fontSize: '10.5px',
      color: textColor === '#ffffff' ? '#f8fafc' : '#0f172a',
      fontStyle: '800',
      align: 'center',
      wordWrap: { width: badgeW - 6 }
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
      fontSize: '12.5px',
      color: '#e2e8f0',
      fontStyle: '600',
      wordWrap: { width: Math.max(80, w - badgeW - 170) }
    }).setOrigin(0, 0.5);
    container.add(sloganText);

    // Status Tag (Selected / Locked)
    const tagW = isAvailable ? 78 : 100;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 8, 0);
    const tagBg = this.add.graphics();

    if (isAvailable) {
      tagBg.fillStyle(0xfcb813, 1);
      tagBg.fillRoundedRect(-tagW / 2, -13, tagW, 26, 7);
      const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#111111',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
    } else {
      tagBg.fillStyle(0xd93838, 1);
      tagBg.fillRoundedRect(-tagW / 2, -13, tagW, 26, 7);
      const tagTxt = this.add.text(0, 0, 'COMING SOON 🔒', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '10px',
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
      fontSize: '13px',
      color: '#e2e8f0',
      fontStyle: '700'
    }).setOrigin(0.5, 0.5);
    container.add(fullText);

    const spriteKey = `player_${partyId}_idle`;
    const sprite = this.add.sprite(0, 32, spriteKey);
    sprite.setScale(0.72);
    container.add(sprite);

    const tagW = isAvailable ? 82 : 110;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 8, -h / 2 + 16);
    const tagBg = this.add.graphics();

    if (isAvailable) {
      tagBg.fillStyle(0xfcb813, 1);
      tagBg.fillRoundedRect(-tagW / 2, -12, tagW, 24, 6);
      const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#111111',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
      selectedTag.setVisible(true);
    } else {
      tagBg.fillStyle(0xd93838, 1);
      tagBg.fillRoundedRect(-tagW / 2, -12, tagW, 24, 6);
      const tagTxt = this.add.text(0, 0, 'COMING SOON 🔒', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '10.5px',
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

  private showPwaInstallPrompt(width: number, height: number) {
    const isStandalone = (typeof window !== 'undefined') && (
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true ||
      sessionStorage.getItem('pwa_prompt_dismissed') === 'true'
    );
    if (isStandalone) return;

    const existing = this.children.getByName('pwaInstallBanner');
    if (existing) existing.destroy();

    const bannerW = Math.min(width - 24, 400);
    const bannerH = 46;
    const bannerY = Math.min(height - bannerH / 2 - 14, 760);

    const banner = this.add.container(width / 2, bannerY);
    banner.setName('pwaInstallBanner');
    banner.setDepth(120);

    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.96);
    bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 12);
    bg.lineStyle(2, 0xfcb813, 0.9);
    bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 12);

    const msg = this.add.text(-bannerW / 2 + 14, 0, '📲 Install on phone & enjoy!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Install action button
    const instBtnW = 74;
    const instBtnH = 28;
    const instBtnX = bannerW / 2 - 58;
    const instBg = this.add.graphics();
    instBg.fillStyle(0x1f9137, 1);
    instBg.fillRoundedRect(instBtnX - instBtnW / 2, -instBtnH / 2, instBtnW, instBtnH, 6);
    const instTxt = this.add.text(instBtnX, 0, 'INSTALL', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const instZone = this.add.zone(instBtnX, 0, instBtnW, instBtnH).setInteractive({ useHandCursor: true });
    instZone.on('pointerdown', async () => {
      if (typeof (window as any).promptPwaInstall === 'function') {
        const accepted = await (window as any).promptPwaInstall();
        if (accepted) {
          banner.destroy();
        }
      } else {
        alert('To install: tap your browser menu and choose "Add to Home screen" / "Install app"');
      }
    });

    // Close button (X)
    const closeTxt = this.add.text(bannerW / 2 - 12, 0, '✕', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    const closeZone = this.add.zone(bannerW / 2 - 12, 0, 24, 28).setInteractive({ useHandCursor: true });
    closeZone.on('pointerdown', () => {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
      banner.destroy();
    });

    banner.add([bg, msg, instBg, instTxt, instZone, closeTxt, closeZone]);

    // Animate banner entry
    banner.setAlpha(0);
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut'
    });

    // Listen for PWA installation event to automatically remove prompt
    const onInstalled = () => {
      if (banner.active) banner.destroy();
    };
    window.addEventListener('pwa-installed', onInstalled, { once: true });
  }
}
