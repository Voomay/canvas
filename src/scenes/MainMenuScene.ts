import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { ScoreManager } from '../systems/ScoreManager';
import { SoundFX } from '../systems/SoundFX';
import { TermsModal } from '../ui/TermsModal';

interface PartyCardItem {
  partyId: 'da' | 'anc' | 'pa';
  container: Phaser.GameObjects.Container;
  cardImage: Phaser.GameObjects.Image;
  glowGraphics: Phaser.GameObjects.Graphics;
  selectedTag: Phaser.GameObjects.Container;
  baseScale: number;
  w: number;
  h: number;
}

interface LocationShowcase {
  key: string;
  name: string;
  subtitle: string;
  texture: string;
  vehicleTexture?: string;
  isTaxi?: boolean;
  vehicleScale?: number;
  vehicleYOffset?: number;
  hasBanner?: boolean;
}

const SHOWCASE_LOCATIONS: LocationShowcase[] = [
  {
    key: 'hanover_park',
    name: 'Hanover Park',
    subtitle: 'Cape Town',
    texture: 'bg_location_hanover_park',
    vehicleTexture: 'vehicle_taxi_minibus',
    isTaxi: true,
    hasBanner: true
  },
  {
    key: 'mitchells_plain',
    name: 'Mitchells Plain',
    subtitle: 'Cape Town',
    texture: 'bg_location_mitchells_plain',
    vehicleTexture: 'vehicle_taxi_minibus',
    isTaxi: true,
    hasBanner: true
  },
  {
    key: 'khayelitsha',
    name: 'Khayelitsha',
    subtitle: 'Cape Town',
    texture: 'bg_location_khayelitsha',
    vehicleTexture: 'vehicle_taxi_minibus',
    isTaxi: true,
    hasBanner: true
  },
  {
    key: 'campsbay',
    name: 'Camps Bay',
    subtitle: 'Atlantic Seaboard',
    texture: 'bg_location_campsbay',
    vehicleTexture: 'vehicle_car_lambo',
    vehicleScale: 0.85,
    vehicleYOffset: 12,
    hasBanner: true
  },
  {
    key: 'joburg',
    name: 'Johannesburg',
    subtitle: 'Grand Finale',
    texture: 'bg_location_joburg',
    vehicleTexture: 'vehicle_taxi_minibus',
    isTaxi: true,
    hasBanner: true
  }
];

export class MainMenuScene extends Phaser.Scene {
  private selectedPartyId: 'da' | 'anc' | 'pa' = 'da';
  private cardItems: PartyCardItem[] = [];

  // Background & Vehicle Slideshow System
  private currentLocationIndex: number = 0;
  private bgContainerA!: Phaser.GameObjects.Container;
  private bgContainerB!: Phaser.GameObjects.Container;
  private activeBgContainer!: Phaser.GameObjects.Container;

  private vehicleContainerA!: Phaser.GameObjects.Container;
  private vehicleContainerB!: Phaser.GameObjects.Container;
  private activeVehicleContainer!: Phaser.GameObjects.Container;

  private slideshowTimer?: Phaser.Time.TimerEvent;
  private isSliding: boolean = false;

  // Mobile Carousel State
  private mobilePartyIndex: number = 0;
  private mobileCardContainer?: Phaser.GameObjects.Container;
  private mobileCardImage?: Phaser.GameObjects.Image;
  private mobileGlowGraphics?: Phaser.GameObjects.Graphics;
  private mobileSelectedTag?: Phaser.GameObjects.Container;
  private mobilePartyDots: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public create() {
    const { width, height } = this.scale;
    const isPortrait = height > width;
    this.cardItems = [];
    this.isSliding = false;
    this.currentLocationIndex = 0;

    // 1. SKY & CLOUDS BASE (Always visible at depth 0)
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height).setDepth(0);
    const cloudKey = this.textures.exists('bg_clouds_sky')
      ? 'bg_clouds_sky'
      : (this.textures.exists('real_bg_clouds') ? 'real_bg_clouds' : 'bg_clouds');
    this.add.tileSprite(0, 10, width, 120, cloudKey).setOrigin(0, 0).setDepth(2);

    // Road positioning
    const roadHeight = 352;
    const roadY = isPortrait ? height - roadHeight : 368;

    // 2. LOCATION SLIDESHOW CONTAINERS
    // Background scenery container (Houses, Table Mountain, flats) at depth 1 (behind road)
    this.bgContainerA = this.add.container(0, 0).setDepth(1);
    this.bgContainerB = this.add.container(width, 0).setDepth(1);

    // Curbside Vehicles container (Minibus Taxi, Ferrari, Lambo) at depth 6 (on top of road asphalt!)
    this.vehicleContainerA = this.add.container(0, 0).setDepth(6);
    this.vehicleContainerB = this.add.container(width, 0).setDepth(6);

    // Populate initial location
    this.renderLocationContent(this.bgContainerA, this.vehicleContainerA, 0, width, roadY, isPortrait);
    this.activeBgContainer = this.bgContainerA;
    this.activeVehicleContainer = this.vehicleContainerA;

    // 3. PERSISTENT ROAD & CURBSIDE (Anchored at roadY, depth 5)
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    const roadSprite = this.add.tileSprite(0, roadY, width, roadHeight, roadKey).setOrigin(0, 0);
    roadSprite.setDepth(5);

    // 4. Location pill badge removed per user request
    // (createLocationBadge disabled)

    // Start automated 3.5s showcase slider
    this.slideshowTimer = this.time.addEvent({
      delay: 3500,
      loop: true,
      callback: () => this.slideNextLocation(width, roadY, isPortrait)
    });

    // Cleanup timer on scene shutdown
    this.events.once('shutdown', () => {
      if (this.slideshowTimer) {
        this.slideshowTimer.remove();
        this.slideshowTimer = undefined;
      }
    });

    // 5. SEMI-TRANSPARENT VIGNETTE OVERLAY
    // Perfectly calibrated opacity (0.32) so the dynamic background, houses, and curbside vehicles shine through!
    const overlay = this.add.graphics();
    overlay.fillStyle(0x080f1b, 0.32);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(10);

    // 6. UI LAYER & PARTY SELECTION CARDS
    const partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }> = [
      { id: 'da', name: 'DA', texture: 'card_da', accentColor: 0x005ba6 },
      { id: 'anc', name: 'ANC', texture: 'card_anc', accentColor: 0xfcb813 },
      { id: 'pa', name: 'PA', texture: 'card_pa', accentColor: 0x4ea81e }
    ];

    if (isPortrait) {
      this.createPortraitLayout(width, height, partyList);
    } else {
      this.createLandscapeLayout(width, height, partyList);
      this.updateSelection();
    }

    // Auto-display Terms & Conditions / Disclaimer on launch if not yet accepted
    if (!TermsModal.isAccepted()) {
      this.time.delayedCall(300, () => {
        TermsModal.open();
      });
    }
  }

  // ----------------------------------------------------
  // LOCATION SHOWCASE SLIDER (Cycles every 3.5s smoothly)
  // ----------------------------------------------------
  private renderLocationContent(
    bgContainer: Phaser.GameObjects.Container,
    vehicleContainer: Phaser.GameObjects.Container,
    locIndex: number,
    width: number,
    roadY: number,
    isPortrait: boolean
  ) {
    bgContainer.removeAll(true);
    vehicleContainer.removeAll(true);
    const loc = SHOWCASE_LOCATIONS[locIndex];
    const locTexture = this.textures.exists(loc.texture) ? loc.texture : 'real_bg_houses';

    // Scaled panorama aligning with road
    // 740px+ panoramas align curb with road; shorter panoramas (Joburg at 432px) scale to fill full height without repetition
    const tex = this.textures.get(locTexture);
    const srcImg = tex && tex.getSourceImage() ? tex.getSourceImage() : null;
    const texHeight = srcImg && (srcImg as any).height ? (srcImg as any).height : 743;
    const targetH = roadY + 24;
    const bgScale = texHeight < 600 ? targetH / texHeight : (roadY + 16) / 670;

    const bgTile = this.add.tileSprite(0, 0, width, targetH, locTexture).setOrigin(0, 0);
    bgTile.tileScaleX = bgScale;
    bgTile.tileScaleY = bgScale;
    bgTile.tilePositionY = texHeight < 600 ? 0 : 50;
    bgContainer.add(bgTile);

    // Curbside Multi-Party Election Lamppost (ANC, DA, PA) on the sidewalk curb
    const bannerKey = this.textures.exists('prop_curb_banner_parties') ? 'prop_curb_banner_parties' : (this.textures.exists('prop_curb_banner_pa') ? 'prop_curb_banner_pa' : null);
    if (loc.hasBanner && bannerKey) {
      const bannerX = isPortrait ? width * 0.22 : width * 0.20;
      const bannerY = roadY + 20;
      const banner = this.add.sprite(bannerX, bannerY, bannerKey);
      banner.setOrigin(0.5, 1);
      banner.setDisplaySize(72, 288);

      this.tweens.add({
        targets: banner,
        angle: { from: -0.8, to: 0.8 },
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      vehicleContainer.add(banner);
    }

    // Curbside Vehicle - IN THE ROAD NEAR THE CURB (depth 6, resting squarely on the asphalt road!)
    if (loc.vehicleTexture && this.textures.exists(loc.vehicleTexture)) {
      const vehicleX = isPortrait ? width * 0.70 : width * 0.76;

      if (loc.isTaxi) {
        // Minibus Taxi resting firmly in the upper road lane next to the sidewalk curb
        const vehicleY = roadY + (isPortrait ? 132 : 140);
        const taxi = this.add.sprite(vehicleX, vehicleY, loc.vehicleTexture);
        taxi.setOrigin(0.5, 1);
        taxi.setScale(isPortrait ? 0.92 : 1.15);
        if (this.anims.exists('taxi_minibus_anim')) {
          taxi.play('taxi_minibus_anim');
        }
        vehicleContainer.add(taxi);
      } else {
        // Luxury Supercar (Yellow Lambo, Red Ferrari) resting near the curb
        const vehicleY = roadY + (isPortrait ? 130 : 138) + (loc.vehicleYOffset || 0);
        const car = this.add.image(vehicleX, vehicleY, loc.vehicleTexture);
        car.setOrigin(0.5, 1);
        const scale = isPortrait ? 0.62 : (loc.vehicleScale || 0.85);
        car.setScale(scale);
        vehicleContainer.add(car);
      }
    }
  }

  private slideNextLocation(width: number, roadY: number, isPortrait: boolean) {
    if (this.isSliding) return;
    this.isSliding = true;

    const nextIndex = (this.currentLocationIndex + 1) % SHOWCASE_LOCATIONS.length;
    const isAActive = this.activeBgContainer === this.bgContainerA;
    const incomingBg = isAActive ? this.bgContainerB : this.bgContainerA;
    const incomingVeh = isAActive ? this.vehicleContainerB : this.vehicleContainerA;
    const outgoingBg = this.activeBgContainer;
    const outgoingVeh = this.activeVehicleContainer;

    // Prepare incoming containers at off-screen right
    this.renderLocationContent(incomingBg, incomingVeh, nextIndex, width, roadY, isPortrait);
    incomingBg.setX(width);
    incomingVeh.setX(width);
    incomingVeh.setAlpha(1);

    // Rapidly fade out outgoing vehicle (250ms) so two vehicles never crowd each other or overlap
    this.tweens.add({
      targets: outgoingVeh,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeIn'
    });

    // Smooth horizontal slide for both background scenery and vehicle in unison
    this.tweens.add({
      targets: outgoingBg,
      x: -width,
      duration: 850,
      ease: 'Cubic.easeInOut'
    });

    this.tweens.add({
      targets: [incomingBg, incomingVeh],
      x: 0,
      duration: 850,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        this.currentLocationIndex = nextIndex;
        this.activeBgContainer = incomingBg;
        this.activeVehicleContainer = incomingVeh;
        this.isSliding = false;
      }
    });
  }

  // ----------------------------------------------------
  // DESKTOP & LANDSCAPE LAYOUT
  // Cleaned up header box, prominent authentic cards
  // ----------------------------------------------------
  private createLandscapeLayout(
    width: number,
    _height: number,
    partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }>
  ) {
    // 1. Sleek Title Header Box
    // Logo removed, subtitle removed, replaced with centered "SELECT YOUR POLITICAL PARTY TO CANVASS"
    const titleBoxW = Math.min(width - 40, 740);
    const titleBoxH = 56;
    const titleBox = this.add.graphics();
    titleBox.fillStyle(0x0c1524, 0.94);
    titleBox.fillRoundedRect(width / 2 - titleBoxW / 2, 16, titleBoxW, titleBoxH, 16);
    titleBox.lineStyle(2, 0x1f3c6e, 1);
    titleBox.strokeRoundedRect(width / 2 - titleBoxW / 2, 16, titleBoxW, titleBoxH, 16);
    titleBox.setDepth(15);

    this.add.text(width / 2, 16 + titleBoxH / 2, 'SELECT YOUR POLITICAL PARTY TO CANVASS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '23px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5).setDepth(16);

    // 2. 3 Sliced Authentic Party Cards (DA, ANC, PA)
    // Preserving 100% natural aspect ratio (564 x 925), prominent and proud
    const cardDisplayH = 272;
    const cardDisplayW = Math.round(cardDisplayH * (564 / 925)); // ~166px
    const cardSpacing = 224;
    const startX = width / 2 - cardSpacing;
    const cardY = 242;

    partyList.forEach((p, index) => {
      const cardX = startX + index * cardSpacing;
      const cardItem = this.createInteractivePartyCard(
        p.id,
        p.texture,
        cardX,
        cardY,
        cardDisplayW,
        cardDisplayH,
        p.accentColor,
        false
      );
      this.cardItems.push(cardItem);
    });

    // 3. How to Play Brief (Compact width fitting snugly around text)
    const infoW = 540;
    const infoBg = this.add.graphics();
    infoBg.fillStyle(0x0c1524, 0.94);
    infoBg.fillRoundedRect(width / 2 - infoW / 2, 428, infoW, 114, 14);
    infoBg.lineStyle(2, 0x223552, 1);
    infoBg.strokeRoundedRect(width / 2 - infoW / 2, 428, infoW, 114, 14);
    infoBg.setDepth(15);

    const howToTitle = this.add.text(width / 2, 446, '🎮 HOW TO PLAY', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14.5px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    howToTitle.setDepth(16);

    const instructions = [
      '• Run down the neighbourhood canvassing (Spacebar / Up Arrow / Tap to Jump)',
      '• Meet residents: Stop to talk to gain votes, or keep running',
      '• Choose Promise, Blame, or Honesty to win votes & trust!',
      '• Jump over potholes to fix them & gain extra time to reach your vote target!'
    ];

    instructions.forEach((inst, i) => {
      const line = this.add.text(width / 2, 468 + i * 18, inst, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#f1f5f9',
        fontStyle: '600'
      }).setOrigin(0.5, 0.5);
      line.setDepth(16);
    });

    // 4. Start Canvassing Button (Prominent, cleanly placed)
    const startBtn = new Button(this, width / 2, 595, 'START CANVASSING ➔', () => {
      ScoreManager.getInstance().resetGame();
      this.scene.start('GameScene', { partyId: this.selectedPartyId });
    }, {
      width: 360,
      height: 58,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: '23px'
    });
    startBtn.setDepth(100);

    // Music & Terms buttons
    this.createMusicButton(width - 120, 28).setDepth(110);
    this.createTermsButton(width - 225, 28).setDepth(110);
  }

  // ----------------------------------------------------
  // MOBILE PORTRAIT LAYOUT
  // Features single large hero card scroller with navigation arrows
  // ----------------------------------------------------
  private createPortraitLayout(
    width: number,
    height: number,
    partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }>
  ) {
    // Dynamic scaling factor to ensure elements are large and prominent on any mobile screen
    const vScale = Math.max(0.78, Math.min(1.0, (height - 60) / 840));

    // 1. App Logo: Substantially bigger, bolder, with generous top & bottom margins
    const topMargin = Math.round(24 * vScale);
    let logoH = Math.round(140 * vScale);
    let logoCenterY = topMargin + logoH / 2;
    if (this.textures.exists('logo_canvassing_sa')) {
      const logo = this.add.image(width / 2, 0, 'logo_canvassing_sa');
      const targetW = Math.min(width * 0.68, Math.round(340 * vScale));
      const scale = targetW / logo.width;
      logo.setScale(scale);
      logoH = logo.height * scale;
      logoCenterY = topMargin + logoH / 2;
      logo.setY(logoCenterY);
      logo.setDepth(16);
    }

    // 2. Subtitle Header: Clean spacing below logo, bold gold (more spacing as requested)
    const headerY = logoCenterY + logoH / 2 + Math.round(36 * vScale);
    const headerFontSize = Math.round(17 * vScale);
    this.add.text(width / 2, headerY, 'SELECT YOUR PARTY TO CANVASS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: `${headerFontSize}px`,
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#080d14',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5).setDepth(16);

    // 3. Mobile Hero Card Carousel: A little bit bigger per user request
    // Card height 395px, width ~240px (natural 564x925 aspect ratio)
    const cardDisplayH = Math.round(395 * vScale);
    const cardDisplayW = Math.round(cardDisplayH * (564 / 925)); // ~240px
    const carouselY = headerY + Math.round(26 * vScale) + cardDisplayH / 2;

    this.createMobileCardCarousel(width, carouselY, cardDisplayW, cardDisplayH, partyList, vScale);

    // 4. How to Play Brief: CLEAR, BIGGER, highly legible text
    const infoW = Math.min(width - 32, Math.round(440 * vScale));
    const infoH = Math.round(112 * vScale);
    const infoY = carouselY + cardDisplayH / 2 + Math.round(20 * vScale);

    const infoBg = this.add.graphics();
    infoBg.fillStyle(0x0c1524, 0.95);
    infoBg.fillRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 16);
    infoBg.lineStyle(2, 0x223552, 1);
    infoBg.strokeRoundedRect(width / 2 - infoW / 2, infoY, infoW, infoH, 16);
    infoBg.setDepth(15);

    const howToTitleSize = Math.round(15.5 * vScale);
    const howToTitle = this.add.text(width / 2, infoY + Math.round(18 * vScale), '🎮 HOW TO PLAY', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: `${howToTitleSize}px`,
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    howToTitle.setDepth(16);

    const instructions = [
      '• Tap Screen to JUMP over potholes & fix them (+5s bonus!)',
      '• Meet residents: Stop to talk to gain votes, or keep running',
      '• Choose Promise, Blame, or Honesty to win votes & trust!'
    ];

    const instFontSize = Math.round(13.5 * vScale);
    const lineSpacing = Math.round(23 * vScale);
    instructions.forEach((inst, i) => {
      const line = this.add.text(width / 2, infoY + Math.round(42 * vScale) + i * lineSpacing, inst, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: `${instFontSize}px`,
        color: '#ffffff',
        fontStyle: '600',
        stroke: '#080d14',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);
      line.setDepth(16);
    });

    // 5. Primary START CANVASSING button: Prominent, wide, juicy green with high interactive depth
    const btnH = Math.round(56 * vScale);
    const minBottomPad = 24;
    const computedBtnY = infoY + infoH + Math.round(16 * vScale) + btnH / 2;
    const maxBtnY = height - minBottomPad - btnH / 2;
    const btnY = Math.min(computedBtnY, maxBtnY);
    const btnFontSize = Math.round(22 * vScale);

    const startBtn = new Button(this, width / 2, btnY, 'START CANVASSING ➔', () => {
      ScoreManager.getInstance().resetGame();
      this.scene.start('GameScene', { partyId: this.selectedPartyId });
    }, {
      width: infoW,
      height: btnH,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: `${btnFontSize}px`
    });
    startBtn.setDepth(100);

    // 6. PWA Install Prompt (only when sufficient vertical headroom exists below start button)
    this.showPwaInstallPrompt(width, height, btnY, btnH);

    // 7. Top music & terms buttons
    this.createMusicButton(width - 48, 26).setDepth(110);
    this.createTermsButton(54, 26).setDepth(110);
  }

  // ----------------------------------------------------
  // MOBILE SINGLE HERO CARD CAROUSEL SYSTEM
  // ----------------------------------------------------
  private createMobileCardCarousel(
    width: number,
    carouselY: number,
    cardW: number,
    cardH: number,
    partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }>,
    vScale: number = 1.0
  ) {
    this.mobilePartyIndex = partyList.findIndex(p => p.id === this.selectedPartyId);
    if (this.mobilePartyIndex < 0) this.mobilePartyIndex = 0;

    // Main Card Container
    this.mobileCardContainer = this.add.container(width / 2, carouselY);
    this.mobileCardContainer.setDepth(22);

    this.mobileGlowGraphics = this.add.graphics();
    this.mobileCardContainer.add(this.mobileGlowGraphics);

    const initialParty = partyList[this.mobilePartyIndex];
    this.mobileCardImage = this.add.image(0, 0, initialParty.texture);
    this.mobileCardImage.setDisplaySize(cardW, cardH);
    this.mobileCardContainer.add(this.mobileCardImage);

    // Selected Badge on top of card (sized appropriately for large card)
    const tagW = Math.round(104 * vScale);
    const tagH = Math.round(27 * vScale);
    const tagY = -cardH / 2 + 2;
    this.mobileSelectedTag = this.add.container(0, tagY);

    const tagBg = this.add.graphics();
    tagBg.fillStyle(0xfcb813, 1);
    tagBg.fillRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 8);
    tagBg.lineStyle(1.5, 0xffffff, 0.9);
    tagBg.strokeRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 8);

    const tagFontSize = Math.round(12.5 * vScale);
    const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: `${tagFontSize}px`,
      color: '#111111',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.mobileSelectedTag.add([tagBg, tagTxt]);
    this.mobileCardContainer.add(this.mobileSelectedTag);

    // Card Touch / Tap Interactive Zone with horizontal swipe detection
    const cardHitZone = this.add.zone(0, 0, cardW + 16, cardH + 16).setInteractive({ useHandCursor: true });
    this.mobileCardContainer.add(cardHitZone);

    let touchStartX = 0;
    cardHitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      touchStartX = pointer.x;
      SoundFX.getInstance().playButtonClick();
      if (this.mobileCardContainer) {
        this.tweens.add({
          targets: this.mobileCardContainer,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 80,
          yoyo: true,
          ease: 'Quad.easeInOut'
        });
      }
    });

    cardHitZone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const deltaX = pointer.x - touchStartX;
      if (deltaX < -35) {
        this.stepMobileCarousel(1, partyList, cardW, cardH);
      } else if (deltaX > 35) {
        this.stepMobileCarousel(-1, partyList, cardW, cardH);
      }
    });

    // Left & Right Arrow Buttons (◀ and ▶)
    const arrowSpacing = cardW / 2 + Math.round(40 * vScale);
    this.createCarouselArrow(width / 2 - arrowSpacing, carouselY, '◀', () => {
      this.stepMobileCarousel(-1, partyList, cardW, cardH);
    }, vScale);

    this.createCarouselArrow(width / 2 + arrowSpacing, carouselY, '▶', () => {
      this.stepMobileCarousel(1, partyList, cardW, cardH);
    }, vScale);

    // Pagination Dot Indicators below the card
    const dotsY = carouselY + cardH / 2 + Math.round(18 * vScale);
    const dotSpacing = Math.round(28 * vScale);
    const dotsStartX = width / 2 - ((partyList.length - 1) * dotSpacing) / 2;
    this.mobilePartyDots = [];

    partyList.forEach((_p, idx) => {
      const dotX = dotsStartX + idx * dotSpacing;
      const dotG = this.add.graphics();
      dotG.setDepth(20);
      dotG.setInteractive(new Phaser.Geom.Circle(dotX, dotsY, 16), Phaser.Geom.Circle.Contains);
      dotG.on('pointerdown', () => {
        if (this.mobilePartyIndex !== idx) {
          const dir = idx > this.mobilePartyIndex ? 1 : -1;
          this.mobilePartyIndex = idx;
          this.animateMobileCardSwitch(dir, partyList, cardW, cardH);
        }
      });
      this.mobilePartyDots.push(dotG);
    });

    this.renderMobilePartySelection(partyList, cardW, cardH);
  }

  private createCarouselArrow(
    x: number,
    y: number,
    arrowSymbol: string,
    onClick: () => void,
    vScale: number = 1.0
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setDepth(25);

    const radius = Math.round(24 * vScale);
    const bg = this.add.graphics();
    bg.fillStyle(0x0c1524, 0.95);
    bg.fillCircle(0, 0, radius);
    bg.lineStyle(2.5, 0xfcb813, 0.95);
    bg.strokeCircle(0, 0, radius);
    container.add(bg);

    const arrowFontSize = Math.round(18 * vScale);
    const txt = this.add.text(arrowSymbol === '◀' ? -1 : 1, 0, arrowSymbol, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: `${arrowFontSize}px`,
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    container.add(txt);

    const hit = this.add.zone(0, 0, radius * 2 + 10, radius * 2 + 10).setInteractive({ useHandCursor: true });
    container.add(hit);

    hit.on('pointerdown', () => {
      SoundFX.getInstance().playButtonClick();
      this.tweens.add({
        targets: container,
        scale: 0.90,
        duration: 60,
        yoyo: true,
        onComplete: onClick
      });
    });

    hit.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.10, duration: 100 });
    });

    hit.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1.0, duration: 100 });
    });

    return container;
  }

  private stepMobileCarousel(
    direction: number,
    partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }>,
    cardW: number,
    cardH: number
  ) {
    this.mobilePartyIndex = (this.mobilePartyIndex + direction + partyList.length) % partyList.length;
    this.animateMobileCardSwitch(direction, partyList, cardW, cardH);
  }

  private animateMobileCardSwitch(
    direction: number,
    partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }>,
    cardW: number,
    cardH: number
  ) {
    if (!this.mobileCardContainer || !this.mobileCardImage) return;

    const currentParty = partyList[this.mobilePartyIndex];
    this.selectedPartyId = currentParty.id;

    // Slide current card out
    const slideOutX = direction > 0 ? -40 : 40;
    const slideInX = direction > 0 ? 40 : -40;

    this.tweens.add({
      targets: this.mobileCardContainer,
      x: this.scale.width / 2 + slideOutX,
      alpha: 0.3,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 100,
      ease: 'Quad.easeIn',
      onComplete: () => {
        if (!this.mobileCardContainer || !this.mobileCardImage) return;
        this.mobileCardImage.setTexture(currentParty.texture);
        this.mobileCardImage.setDisplaySize(cardW, cardH);
        this.mobileCardContainer.setX(this.scale.width / 2 + slideInX);
        this.renderMobilePartySelection(partyList, cardW, cardH);

        this.tweens.add({
          targets: this.mobileCardContainer,
          x: this.scale.width / 2,
          alpha: 1,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 150,
          ease: 'Back.easeOut'
        });
      }
    });
  }

  private renderMobilePartySelection(
    partyList: Array<{ id: 'da' | 'anc' | 'pa'; name: string; texture: string; accentColor: number }>,
    cardW: number,
    cardH: number
  ) {
    if (!this.mobileGlowGraphics) return;
    const currentParty = partyList[this.mobilePartyIndex];
    this.selectedPartyId = currentParty.id;

    // Gold outer glow halo & white inner shine - zero gap against card edge
    this.mobileGlowGraphics.clear();
    this.mobileGlowGraphics.lineStyle(4.5, 0xfcb813, 1);
    this.mobileGlowGraphics.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18);
    this.mobileGlowGraphics.lineStyle(1.5, 0xffffff, 0.9);
    this.mobileGlowGraphics.strokeRoundedRect(-cardW / 2 + 1, -cardH / 2 + 1, cardW - 2, cardH - 2, 17);

    // Pagination Dots
    const dotsY = this.mobileCardContainer ? this.mobileCardContainer.y + cardH / 2 + 16 : 420;
    const dotSpacing = 26;
    const dotsStartX = this.scale.width / 2 - ((partyList.length - 1) * dotSpacing) / 2;

    this.mobilePartyDots.forEach((dotG, idx) => {
      dotG.clear();
      const dotX = dotsStartX + idx * dotSpacing;
      const isActive = idx === this.mobilePartyIndex;

      if (isActive) {
        dotG.fillStyle(0xfcb813, 1);
        dotG.fillRoundedRect(dotX - 12, dotsY - 4, 24, 8, 4);
        dotG.lineStyle(1.5, 0xffffff, 0.9);
        dotG.strokeRoundedRect(dotX - 12, dotsY - 4, 24, 8, 4);
      } else {
        dotG.fillStyle(0x334155, 0.85);
        dotG.fillCircle(dotX, dotsY, 4);
      }
    });
  }

  // ----------------------------------------------------
  // INTERACTIVE PARTY SELECTION CARD COMPONENT (DESKTOP)
  // Uses the sliced transparent character card artworks
  // ----------------------------------------------------
  private createInteractivePartyCard(
    partyId: 'da' | 'anc' | 'pa',
    textureKey: string,
    x: number,
    y: number,
    w: number,
    h: number,
    _accentColor: number,
    isPortrait: boolean
  ): PartyCardItem {
    const container = this.add.container(x, y);
    container.setDepth(20);

    // Glowing aura / selection graphics
    const glowGraphics = this.add.graphics();
    container.add(glowGraphics);

    // The high-res sliced card image
    const cardImage = this.add.image(0, 0, textureKey);
    cardImage.setDisplaySize(w, h);
    container.add(cardImage);

    // Floating "SELECTED ✓" badge on the top border
    const tagW = isPortrait ? 78 : 96;
    const tagH = isPortrait ? 22 : 25;
    const tagY = -h / 2 + 2;
    const selectedTag = this.add.container(0, tagY);

    const tagBg = this.add.graphics();
    tagBg.fillStyle(0xfcb813, 1);
    tagBg.fillRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 8);
    tagBg.lineStyle(1.5, 0xffffff, 0.9);
    tagBg.strokeRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 8);

    const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '10.5px' : '12px',
      color: '#111111',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    selectedTag.add([tagBg, tagTxt]);
    selectedTag.setVisible(false);
    container.add(selectedTag);

    // Full Card Interactive Hit Zone - Smooth pointerover, pointerout, and tap/click
    const hitZone = this.add.zone(0, 0, w + 12, h + 24).setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerdown', () => {
      this.selectedPartyId = partyId;
      this.updateSelection();
      SoundFX.getInstance().playButtonClick();

      // Punchy selection bounce animation
      this.tweens.add({
        targets: container,
        scaleX: 1.10,
        scaleY: 1.10,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });

    hitZone.on('pointerover', () => {
      if (this.selectedPartyId !== partyId) {
        this.tweens.add({
          targets: container,
          scaleX: 1.03,
          scaleY: 1.03,
          alpha: 0.98,
          duration: 120,
          ease: 'Quad.easeOut'
        });
      }
    });

    hitZone.on('pointerout', () => {
      if (this.selectedPartyId !== partyId) {
        this.tweens.add({
          targets: container,
          scaleX: 0.96,
          scaleY: 0.96,
          alpha: 0.82,
          duration: 140,
          ease: 'Quad.easeOut'
        });
      }
    });

    return {
      partyId,
      container,
      cardImage,
      glowGraphics,
      selectedTag,
      baseScale: 1.0,
      w,
      h
    };
  }

  // ----------------------------------------------------
  // SELECTION STATE UPDATE (DESKTOP)
  // ----------------------------------------------------
  private updateSelection() {
    this.cardItems.forEach(item => {
      const isSelected = item.partyId === this.selectedPartyId;
      item.glowGraphics.clear();

      if (isSelected) {
        // Bright outer gold halo - zero gap, perfectly flush with card
        item.glowGraphics.lineStyle(4.5, 0xfcb813, 1);
        item.glowGraphics.strokeRoundedRect(
          -item.w / 2,
          -item.h / 2,
          item.w,
          item.h,
          18
        );

        // Subtle white inner shine
        item.glowGraphics.lineStyle(1.5, 0xffffff, 0.85);
        item.glowGraphics.strokeRoundedRect(
          -item.w / 2 + 1,
          -item.h / 2 + 1,
          item.w - 2,
          item.h - 2,
          17
        );

        item.selectedTag.setVisible(true);

        this.tweens.add({
          targets: item.container,
          scaleX: 1.05,
          scaleY: 1.05,
          alpha: 1.0,
          duration: 160,
          ease: 'Back.easeOut'
        });
        item.container.setDepth(24);
      } else {
        item.selectedTag.setVisible(false);

        this.tweens.add({
          targets: item.container,
          scaleX: 0.96,
          scaleY: 0.96,
          alpha: 0.82,
          duration: 160,
          ease: 'Quad.easeOut'
        });
        item.container.setDepth(20);
      }
    });
  }

  // ----------------------------------------------------
  // MUSIC TOGGLE BUTTON
  // ----------------------------------------------------
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

    musicBtn.setName('musicButton');
    musicBtn.add([musicBg, musicTxt]);
    musicBtn.setSize(76, 28);
    musicBtn.setInteractive(new Phaser.Geom.Rectangle(-38, -14, 76, 28), Phaser.Geom.Rectangle.Contains);

    musicBtn.on('pointerdown', () => {
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

    return musicBtn;
  }

  // ----------------------------------------------------
  // TERMS & DISCLAIMER BUTTON
  // ----------------------------------------------------
  private createTermsButton(x: number, y: number): Phaser.GameObjects.Container {
    const termsBtn = this.add.container(x, y);
    termsBtn.setName('termsButton');
    const termsBg = this.add.graphics();
    termsBg.fillStyle(0x0c1524, 0.94);
    termsBg.fillRoundedRect(-44, -14, 88, 28, 14);
    termsBg.lineStyle(1.5, 0x1f3c6e, 1);
    termsBg.strokeRoundedRect(-44, -14, 88, 28, 14);

    const termsTxt = this.add.text(0, 0, '⚖️ TERMS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#cbd5e1',
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    termsBtn.add([termsBg, termsTxt]);
    termsBtn.setSize(88, 28);
    termsBtn.setInteractive(new Phaser.Geom.Rectangle(-44, -14, 88, 28), Phaser.Geom.Rectangle.Contains);

    termsBtn.on('pointerover', () => {
      termsTxt.setColor('#fcb813');
      termsBg.clear();
      termsBg.fillStyle(0x132238, 0.98);
      termsBg.fillRoundedRect(-44, -14, 88, 28, 14);
      termsBg.lineStyle(1.5, 0xfcb813, 1);
      termsBg.strokeRoundedRect(-44, -14, 88, 28, 14);
    });

    termsBtn.on('pointerout', () => {
      termsTxt.setColor('#cbd5e1');
      termsBg.clear();
      termsBg.fillStyle(0x0c1524, 0.94);
      termsBg.fillRoundedRect(-44, -14, 88, 28, 14);
      termsBg.lineStyle(1.5, 0x1f3c6e, 1);
      termsBg.strokeRoundedRect(-44, -14, 88, 28, 14);
    });

    termsBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: termsBtn,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          TermsModal.open();
        }
      });
    });

    return termsBtn;
  }

  // ----------------------------------------------------
  // PWA INSTALL PROMPT
  // ----------------------------------------------------
  private showPwaInstallPrompt(width: number, height: number, startBtnY?: number, startBtnH?: number) {
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true ||
        sessionStorage.getItem('pwa_prompt_dismissed') === 'true');
    if (isStandalone) return;

    // Check if there is enough space below the start button
    const bannerH = 50;
    if (startBtnY !== undefined && startBtnH !== undefined) {
      const btnBottom = startBtnY + startBtnH / 2;
      const spaceBelow = height - btnBottom;
      if (spaceBelow < bannerH + 16) {
        // Not enough vertical room without overlapping start canvassing button
        return;
      }
    }

    const existing = this.children.getByName('pwaInstallBanner');
    if (existing) existing.destroy();

    const bannerW = Math.min(width - 20, 420);
    const bannerY = height - bannerH / 2 - 8;

    const banner = this.add.container(width / 2, bannerY);
    banner.setName('pwaInstallBanner');
    banner.setDepth(35);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1322, 0.98);
    bg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
    bg.lineStyle(2, 0xfcb813, 0.95);
    bg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);

    const iconBoxX = -bannerW / 2 + 28;
    let iconObj: Phaser.GameObjects.GameObject;
    if (this.textures.exists('app_icon')) {
      const iconImg = this.add.image(iconBoxX, 0, 'app_icon');
      iconImg.setDisplaySize(38, 38);
      iconObj = iconImg;
    } else {
      iconObj = this.add.text(iconBoxX, 0, '🗳️', { fontSize: '20px' }).setOrigin(0.5, 0.5);
    }

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

    const instBtnW = 88;
    const instBtnH = 34;
    const instBtnX = bannerW / 2 - 70;
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

    const instZone = this.add.zone(instBtnX, 0, instBtnW + 6, instBtnH + 6).setInteractive({ useHandCursor: true });
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

    const closeX = bannerW / 2 - 14;
    const closeTxt = this.add.text(closeX, 0, '✕', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    const closeZone = this.add.zone(closeX, 0, 20, 32).setInteractive({ useHandCursor: true });
    closeZone.on('pointerdown', () => {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
      banner.destroy();
    });

    banner.add([bg, iconObj, titleTxt, subTxt, instBg, instTxt, instZone, closeTxt, closeZone]);

    banner.setAlpha(0);
    this.tweens.add({
      targets: banner,
      alpha: 1,
      y: bannerY,
      duration: 300,
      ease: 'Power2.easeOut'
    });

    const onInstalled = () => {
      if (banner.active) banner.destroy();
    };
    window.addEventListener('pwa-installed', onInstalled, { once: true });
  }
}
