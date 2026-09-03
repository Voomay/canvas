import Phaser from 'phaser';
import { PARTIES, Party } from '../data/parties';
import { Button } from '../ui/Button';
import { ScoreManager } from '../systems/ScoreManager';

export class PartySelectScene extends Phaser.Scene {
  private selectedPartyId: 'da' | 'anc' | 'pa' = 'da';
  private cardContainers: { partyId: 'da' | 'anc' | 'pa'; container: Phaser.GameObjects.Container; borderGraphics: Phaser.GameObjects.Graphics; selectedTag: Phaser.GameObjects.Container }[] = [];

  constructor() {
    super('PartySelectScene');
  }

  public create() {
    const { width, height } = this.scale;

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    const cloudKey = this.textures.exists('bg_clouds_sky') ? 'bg_clouds_sky' : (this.textures.exists('real_bg_clouds') ? 'real_bg_clouds' : 'bg_clouds');
    const locationKey = this.textures.exists('bg_location_capetown') ? 'bg_location_capetown' : (this.textures.exists('real_bg_houses') ? 'real_bg_houses' : 'bg_houses');
    const roadKey = this.textures.exists('real_bg_road') ? 'real_bg_road' : 'bg_road';
    this.add.tileSprite(0, 0, width, 432, locationKey).setOrigin(0, 0);
    this.add.tileSprite(0, 15, width, 120, cloudKey).setOrigin(0, 0);
    this.add.tileSprite(0, 428, width, 292, roadKey).setOrigin(0, 0);

    const darkOverlay = this.add.graphics();
    darkOverlay.fillStyle(0x0a101a, 0.82);
    darkOverlay.fillRect(0, 0, width, height);

    // Title Header
    this.add.text(width / 2, 55, 'SELECT YOUR POLITICAL PARTY', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '36px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#0c1524',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, 95, 'Choose a fictional representative to lead your canvassing trail', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '17px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // 3 Equal Party Cards
    const partyKeys: ('da' | 'anc' | 'pa')[] = ['da', 'anc', 'pa'];
    const cardWidth = 360;
    const cardHeight = 440;
    const cardSpacing = 400;
    const startX = width / 2 - cardSpacing;

    partyKeys.forEach((key, index) => {
      const party = PARTIES[key];
      const cardX = startX + index * cardSpacing;
      const cardY = 350;

      const card = this.createPartyCard(party, cardX, cardY, cardWidth, cardHeight);
      this.cardContainers.push(card);
    });

    this.updateSelection();

    // Large START CANVASSING button
    new Button(this, width / 2, 635, 'START CANVASSING ➔', () => {
      // Reset score & start game scene with selected party
      ScoreManager.getInstance().resetGame();
      this.scene.start('GameScene', { partyId: this.selectedPartyId });
    }, {
      width: 420,
      height: 70,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: '26px'
    });
  }

  private createPartyCard(
    party: Party,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f1826, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    container.add(bg);

    // Dynamic border graphic
    const border = this.add.graphics();
    container.add(border);

    // Top party banner
    const banner = this.add.graphics();
    banner.fillStyle(party.colorNum, 1);
    banner.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, 68, { tl: 12, tr: 12, bl: 4, br: 4 });
    container.add(banner);

    // Party Name
    const nameText = this.add.text(0, -h / 2 + 42, party.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '34px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Fictional character sprite preview
    const charSprite = this.add.sprite(0, -50, `player_${party.id}_idle`);
    charSprite.setScale(0.85);
    container.add(charSprite);

    // Candidate details
    const candidateName = this.add.text(0, 35, party.candidateName, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(candidateName);

    const candidateTitle = this.add.text(0, 62, party.candidateTitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#a0aec0',
      fontStyle: 'italic'
    }).setOrigin(0.5, 0.5);
    container.add(candidateTitle);

    // Slogan & Bio
    const sloganText = this.add.text(0, 105, `"${party.slogan}"`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: w - 40 }
    }).setOrigin(0.5, 0.5);
    container.add(sloganText);

    const traitBox = this.add.graphics();
    traitBox.fillStyle(0x182436, 1);
    traitBox.fillRoundedRect(-w / 2 + 16, 140, w - 32, 50, 10);
    container.add(traitBox);

    const traitText = this.add.text(0, 165, `Specialty: ${party.specialTrait}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#55dd88',
      align: 'center',
      fontStyle: 'bold',
      wordWrap: { width: w - 50 }
    }).setOrigin(0.5, 0.5);
    container.add(traitText);

    // Selected or Locked Tag container (Top right corner of card)
    const isAvailable = party.id === 'da';
    const tagW = isAvailable ? 90 : 130;
    const selectedTag = this.add.container(w / 2 - tagW / 2 - 10, -h / 2 + 20);
    const tagBg = this.add.graphics();
    
    if (isAvailable) {
      tagBg.fillStyle(0xfcb813, 1);
      tagBg.fillRoundedRect(-45, -14, 90, 28, 8);
      const tagTxt = this.add.text(0, 0, 'SELECTED ✓', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#111111',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
    } else {
      tagBg.fillStyle(0xd93838, 1);
      tagBg.fillRoundedRect(-65, -14, 130, 28, 8);
      const tagTxt = this.add.text(0, 0, 'COMING SOON 🔒', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      selectedTag.add([tagBg, tagTxt]);
      container.setAlpha(0.78);
    }
    container.add(selectedTag);

    // Interactivity
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: isAvailable });

    container.on('pointerdown', () => {
      if (isAvailable) {
        this.selectedPartyId = party.id;
        this.updateSelection();
      } else {
        this.showUnavailableToast(`${party.name} is currently locked! Only DA is available to canvass.`);
      }
    });

    return { partyId: party.id, container, borderGraphics: border, selectedTag };
  }

  private showUnavailableToast(msg: string) {
    const { width } = this.scale;
    const existing = this.children.getByName('unavailableToast');
    if (existing) existing.destroy();

    const toast = this.add.container(width / 2, 570);
    toast.setName('unavailableToast');
    toast.setDepth(20);

    const bg = this.add.graphics();
    bg.fillStyle(0x2d1212, 0.95);
    bg.lineStyle(2, 0xe53e3e, 1);
    bg.fillRoundedRect(-280, -22, 560, 44, 10);
    bg.strokeRoundedRect(-280, -22, 560, 44, 10);

    const txt = this.add.text(0, 0, msg, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#ffaaaa',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    toast.add([bg, txt]);

    this.tweens.add({
      targets: toast,
      alpha: { from: 0, to: 1 },
      y: { from: 580, to: 570 },
      duration: 200,
      hold: 2200,
      yoyo: true,
      onComplete: () => toast.destroy()
    });
  }

  private updateSelection() {
    const cardWidth = 360;
    const cardHeight = 440;

    this.cardContainers.forEach(item => {
      const isSelected = item.partyId === this.selectedPartyId;
      const party = PARTIES[item.partyId];

      item.borderGraphics.clear();
      if (isSelected) {
        // Glowing gold highlight border
        item.borderGraphics.lineStyle(5, 0xfcb813, 1);
        item.borderGraphics.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
        item.selectedTag.setVisible(true);
        item.container.setScale(1.03);
      } else {
        // Standard party colored border
        item.borderGraphics.lineStyle(2, party.colorNum, 0.6);
        item.borderGraphics.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
        if (item.partyId === 'da') {
          item.selectedTag.setVisible(false);
        } else {
          item.selectedTag.setVisible(true); // Locked badge remains visible
        }
        item.container.setScale(1.0);
      }
    });
  }
}
