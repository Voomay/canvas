import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundFX } from '../systems/SoundFX';

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
    
    // Scale high-res Hanover Park panorama so Table Mountain, flats, and sign align with the road
    const bgScale = (roadY + 16) / 670;
    const bgTile = this.add.tileSprite(0, 0, width, roadY + 24, locationKey).setOrigin(0, 0);
    bgTile.tileScaleX = bgScale;
    bgTile.tileScaleY = bgScale;

    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, roadY, width, roadHeight, roadKey).setOrigin(0, 0);

    // Curbside Minibus Taxi standing on Hanover Park road
    if (this.textures.exists('vehicle_taxi_minibus')) {
      const menuTaxi = this.add.sprite(isPortrait ? width * 0.70 : width * 0.72, roadY + 70, 'vehicle_taxi_minibus');
      menuTaxi.setOrigin(0.5, 1);
      menuTaxi.play('taxi_minibus_anim');
    }

    // Patriotic Alliance (PA) Banner standing on top of Hanover Park sidewalk pavement
    if (this.textures.exists('prop_curb_banner_pa')) {
      const pavementY = roadY + 16;
      const menuBanner = this.add.sprite(isPortrait ? width * 0.28 : width * 0.26, pavementY, 'prop_curb_banner_pa');
      menuBanner.setOrigin(0.5, 1);
      menuBanner.setDisplaySize(65, 200);

      this.tweens.add({
        targets: menuBanner,
        angle: { from: -1.2, to: 1.2 },
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Dark semi-transparent overlay for card readability
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a101a, 0.80);
    overlay.fillRect(0, 0, width, height);

    const partyList: { id: 'da' | 'anc' | 'pa'; name: string; full: string; slogan: string; color: number; textColor: string }[] = [
      { id: 'da', name: 'DA', full: 'Democratic Alliance', slogan: 'Spreadsheets & clean takkies', color: 0x005ba6, textColor: '#ffffff' },
      { id: 'anc', name: 'ANC', full: 'African National Congress', slogan: 'Historic rallies & warm greetings', color: 0xfcb813, textColor: '#0c1524' },
      { id: 'pa', name: 'PA', full: 'Patriotic Alliance', slogan: 'Bold swagger & rapid canvassing', color: 0x4ea81e, textColor: '#ffffff' }
    ];

    if (isPortrait) {
      // ----------------------------------------------------
      // MOBILE PORTRAIT VIEW (Bold, perfectly balanced, thumb-friendly)
      // ----------------------------------------------------
      // Prominent centered official logo (Strictly preserving 100% natural aspect ratio at all times)
      let logoH = 182;
      let logoCenterY = 10 + logoH / 2;
      if (this.textures.exists('logo_canvassing_sa')) {
        const logo = this.add.image(width / 2, 0, 'logo_canvassing_sa');
        const targetW = Math.min(width * 0.65, 275);
        const scale = targetW / logo.width;
        logo.setScale(scale);
        logoH = logo.height * scale;
        logoCenterY = 10 + logoH / 2;
        logo.setY(logoCenterY);
      }

      // Spacing before and after 'SELECT YOUR PARTY TO CANVASS'
      const headerY = logoCenterY + logoH / 2 + 14;
      this.add.text(width / 2, headerY, '🗳️ SELECT YOUR PARTY TO CANVASS', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#fcb813',
        fontStyle: '900',
        stroke: '#080d14',
        strokeThickness: 3
      }).setOrigin(0.5, 0.5);

      // 3 Vertically Stacked Party Cards with generous spacing, boldness, and full-card touch
      const cardW = Math.min(width - 24, 460);
      const cardH = 82;
      const cardGap = 92;
      const startY = headerY + 14 + cardH / 2;

      partyList.forEach((p, index) => {
        const cardY = startY + index * cardGap;
        const card = this.createPortraitCard(p.id, p.name, p.full, p.slogan, p.color, p.textColor, width / 2, cardY, cardW, cardH);
        this.cardContainers.push(card);
      });

      // How to Play brief (Clean, bold, highly legible)
      const infoW = cardW;
      const infoH = 94;
      const infoY = startY + 2 * cardGap + cardH / 2 + 10;

      const infoBg = this.add.graphics();
      infoBg.fillStyle(0x0c1524, 0.94);
      infoBg.fillRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 14);
      infoBg.lineStyle(2, 0x223552, 1);
      infoBg.strokeRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 14);

      this.add.text(width / 2, infoY + 14, '🎮 HOW TO PLAY', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13.5px',
        color: '#fcb813',
        fontStyle: '900',
        stroke: '#080d14',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);

      const instructions = [
        '• Tap Screen to JUMP over potholes & fix them (+5s bonus!)',
        '• Press & Hold Screen to SPRINT faster down the street',
        '• Meet residents: Stop to talk to gain votes, or keep running',
        '• Choose Truth, Excuse, Lie, or Spin to win votes & trust!'
      ];

      instructions.forEach((inst, i) => {
        this.add.text(width / 2, infoY + 31 + i * 16, inst, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: '600'
        }).setOrigin(0.5, 0.5);
      });

      // START CANVASSING button (Prominent Primary Mobile Action with clear space above)
      const btnH = 52;
      const btnGap = 14;
      const btnY = infoY + infoH + btnGap + btnH / 2;
      new Button(this, width / 2, btnY, 'START CANVASSING ➔', () => {
        ScoreManager.getInstance().resetGame();
        this.scene.start('GameScene', { partyId: this.selectedPartyId });
      }, {
        width: cardW,
        height: btnH,
        bgColor: 0x1f9137,
        hoverColor: 0x27ab42,
        fontSize: '22px'
      });

      // Floating PWA Install Prompt for mobile (disappears once installed)
      this.showPwaInstallPrompt(width, height);

      // Top corner music button for mobile portrait
      this.createMusicButton(width - 48, 26);
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

        const targetLogoW = 120;
        const logo = this.add.image(0, 0, 'logo_canvassing_sa');
        const scale = targetLogoW / logo.width;
        logo.setScale(scale);
        const actualLogoW = logo.displayWidth;
        const logoGap = 20;
        const textBlockWidth = Math.max(titleText.width, subText.width);
        const totalContentWidth = actualLogoW + logoGap + textBlockWidth;

        const contentStartX = width / 2 - totalContentWidth / 2;
        logo.setPosition(contentStartX + actualLogoW / 2, 20 + titleBoxH / 2);

        const textX = contentStartX + actualLogoW + logoGap;
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

      // Advertise links removed for now as requested

      // Top corner music button for desktop landscape
      this.createMusicButton(width - 240, 32);
    }

    this.updateSelection();
  }

  private createMusicButton(x: number, y: number): Phaser.GameObjects.Container {
    const soundFX = SoundFX.getInstance();
    const musicBtn = this.add.container(x, y);
    const musicBg = this.add.graphics();
    musicBg.fillStyle(0x0c1524, 0.94);
    musicBg.fillRoundedRect(-38, -14, 76, 28, 14);
    musicBg.lineStyle(1.5, 0x1f3c6e, 1);
    musicBg.strokeRoundedRect(-38, -14, 76, 28, 14);

    const isMuted = soundFX.isMusicMutedState();
    const musicTxt = this.add.text(0, 0, isMuted ? '🔇 MUTE' : '🎵 MUSIC', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: isMuted ? '#94a3b8' : '#fcb813',
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    const zone = this.add.zone(0, 0, 76, 28).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      const muted = soundFX.toggleMusicMute();
      musicTxt.setText(muted ? '🔇 MUTE' : '🎵 MUSIC');
      musicTxt.setColor(muted ? '#94a3b8' : '#fcb813');
      this.tweens.add({
        targets: musicBtn,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });

    musicBtn.add([musicBg, musicTxt, zone]);
    return musicBtn;
  }

  // Portrait Mobile Card: Horizontal layout with clear party badge, candidate illustration, and selected status
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
    const badgeW = 108;
    const banner = this.add.graphics();
    banner.fillStyle(colorNum, 1);
    banner.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, badgeW, h - 10, { tl: 10, bl: 10, tr: 4, br: 4 });
    container.add(banner);

    // Party Name in banner
    const nameText = this.add.text(-w / 2 + 5 + badgeW / 2, -14, name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '28px',
      color: textColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Full name in banner
    const fullText = this.add.text(-w / 2 + 5 + badgeW / 2, 18, fullName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: textColor === '#ffffff' ? '#f8fafc' : '#0f172a',
      fontStyle: '800',
      align: 'center',
      wordWrap: { width: badgeW - 8 }
    }).setOrigin(0.5, 0.5);
    container.add(fullText);

    // Authentic candidate sprite (cleanly scaled inside card borders with padding)
    const spriteKey = `player_${partyId}_idle`;
    const sprite = this.add.sprite(-w / 2 + badgeW + 38, 0, spriteKey);
    sprite.setScale(0.42);
    container.add(sprite);

    // Slogan in middle (Bolder, clearer font)
    const sloganText = this.add.text(-w / 2 + badgeW + 82, 0, slogan, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14.5px',
      color: '#ffffff',
      fontStyle: '700',
      wordWrap: { width: Math.max(80, w - badgeW - 190) }
    }).setOrigin(0, 0.5);
    container.add(sloganText);

    // Status Tag (Selected)
    const tagW = 92;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 10, 0);
    const tagBg = this.add.graphics();
    tagBg.fillStyle(0xfcb813, 1);
    tagBg.fillRoundedRect(-tagW / 2, -16, tagW, 32, 8);
    const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12.5px',
      color: '#111111',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    selectedTag.add([tagBg, tagTxt]);
    container.add(selectedTag);

    // Full Card Interactive Hit Zone - Tapping ANYWHERE on the card selects it instantly and smoothly!
    const hitZone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerdown', () => {
      this.selectedPartyId = partyId;
      this.updateSelection();
      SoundFX.getInstance().playButtonClick();
      this.tweens.add({
        targets: container,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
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

    const tagW = 82;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 8, -h / 2 + 16);
    const tagBg = this.add.graphics();
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
    container.add(selectedTag);

    // Full Card Interactive Hit Zone - Clicking ANYWHERE on the card selects it immediately!
    const hitZone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerdown', () => {
      this.selectedPartyId = partyId;
      this.updateSelection();
      SoundFX.getInstance().playButtonClick();
      this.tweens.add({
        targets: container,
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });

    hitZone.on('pointerover', () => {
      if (this.selectedPartyId !== partyId) {
        container.setScale(1.02);
      }
    });

    hitZone.on('pointerout', () => {
      if (this.selectedPartyId !== partyId) {
        container.setScale(1.0);
      }
    });

    return { partyId, container, borderGraphics: border, selectedTag, w, h };
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
        item.selectedTag.setVisible(false);
        item.container.setAlpha(0.85);
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

    const bannerW = Math.min(width - 20, 420);
    const bannerH = 58;
    const bannerY = height - bannerH / 2 - 12;

    const banner = this.add.container(width / 2, bannerY);
    banner.setName('pwaInstallBanner');
    banner.setDepth(120);

    // Glowing sleek background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1322, 0.98);
    bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
    bg.lineStyle(2, 0xfcb813, 0.95);
    bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);

    // Mini App Icon
    const iconBoxX = -bannerW / 2 + 28;
    let iconObj: Phaser.GameObjects.GameObject;
    if (this.textures.exists('app_icon')) {
      const iconImg = this.add.image(iconBoxX, 0, 'app_icon');
      iconImg.setDisplaySize(38, 38);
      iconObj = iconImg;
    } else {
      iconObj = this.add.text(iconBoxX, 0, '🗳️', {
        fontSize: '20px'
      }).setOrigin(0.5, 0.5);
    }

    // Catchy Title & Subtitle (Updated as requested)
    const textStartX = iconBoxX + 24;
    const titleTxt = this.add.text(textStartX, -10, 'Install Canvassing SA game on your phone', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11.5px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0, 0.5);

    const subTxt = this.add.text(textStartX, 10, 'Play fullscreen • Smooth & offline ready', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      color: '#e2e8f0',
      fontStyle: '600'
    }).setOrigin(0, 0.5);

    // Install Action Button
    const instBtnW = 82;
    const instBtnH = 32;
    const instBtnX = bannerW / 2 - 62;
    const instBg = this.add.graphics();
    instBg.fillStyle(0x1f9137, 1);
    instBg.fillRoundedRect(instBtnX - instBtnW / 2, -instBtnH / 2, instBtnW, instBtnH, 8);
    instBg.lineStyle(1.5, 0xffffff, 0.8);
    instBg.strokeRoundedRect(instBtnX - instBtnW / 2, -instBtnH / 2, instBtnW, instBtnH, 8);

    const instTxt = this.add.text(instBtnX, 0, 'INSTALL ⬇', {
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
        alert('To install: tap your browser menu (⋮ or Share) and choose "Add to Home screen" / "Install app"');
      }
    });

    // Close button (✕)
    const closeX = bannerW / 2 - 12;
    const closeTxt = this.add.text(closeX, 0, '✕', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    const closeZone = this.add.zone(closeX, 0, 22, 32).setInteractive({ useHandCursor: true });
    closeZone.on('pointerdown', () => {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
      banner.destroy();
    });

    banner.add([bg, iconObj, titleTxt, subTxt, instBg, instTxt, instZone, closeTxt, closeZone]);

    // Animate banner entry
    banner.setAlpha(0);
    this.tweens.add({
      targets: banner,
      alpha: 1,
      y: bannerY,
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
