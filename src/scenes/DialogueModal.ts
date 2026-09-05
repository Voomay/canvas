import Phaser from 'phaser';
import { ComplaintData, ResponseType, getComplaintChoice } from '../data/complaints';
import { Button } from '../ui/Button';

export interface DialogueModalConfig {
  complaint: ComplaintData;
  partyId?: 'da' | 'anc' | 'pa';
  residentX?: number;
  targetBubbleY?: number;
  onChoiceSelected: (choice: ResponseType) => void;
  onCancel?: () => void;
}

export function getMobileDialoguePanelHeight(height: number): number {
  const cardH = height < 680 ? 58 : (height < 800 ? 64 : 68);
  const gap = height < 680 ? 7 : (height < 800 ? 8 : 10);
  const totalCardsH = (4 * cardH) + (3 * gap);
  const cancelH = height < 680 ? 28 : 32;
  const panelPaddingTop = height < 680 ? 12 : 16;
  const bottomMargin = height < 680 ? 12 : 20;
  return totalCardsH + cancelH + panelPaddingTop + bottomMargin;
}

export class DialogueModal extends Phaser.GameObjects.Container {
  private speechBubble: Phaser.GameObjects.Container;
  private buttonsContainer: Phaser.GameObjects.Container;
  private mobileResponsePanel: Phaser.GameObjects.Container | null = null;
  private key1?: Phaser.Input.Keyboard.Key;
  private key2?: Phaser.Input.Keyboard.Key;
  private key3?: Phaser.Input.Keyboard.Key;
  private key4?: Phaser.Input.Keyboard.Key;
  private isInputReady: boolean = false;
  private hasSelected: boolean = false;

  constructor(scene: Phaser.Scene, config: DialogueModalConfig) {
    super(scene, 0, 0);

    this.setDepth(150);
    this.isInputReady = false;
    this.hasSelected = false;

    // Safety input lockout: prevents previous tap ("TALK") from bleeding into answer buttons
    scene.time.delayedCall(320, () => {
      this.isInputReady = true;
    });

    const isPortrait = scene.scale.height > scene.scale.width;

    if (isPortrait) {
      // ═══════ MOBILE: Speech bubble top + 4 stacked cards bottom + Cancel ═══════
      this.speechBubble = this.createMobileSpeechBubble(
        scene,
        config.complaint.complaintText,
        config.residentX,
        config.targetBubbleY
      );
      this.add(this.speechBubble);

      this.buttonsContainer = this.createMobileResponseButtons(scene, config);
      this.add(this.buttonsContainer);
    } else {
      // ═══════ DESKTOP: Existing layout (unchanged) ═══════
      const cx = scene.scale.width / 2;

      const bubbleX = cx;
      const bubbleY = 160;
      this.speechBubble = this.createSpeechBubble(scene, bubbleX, bubbleY, config.complaint.complaintText);
      this.add(this.speechBubble);

      this.buttonsContainer = this.createResponseButtons(scene, config, bubbleY);
      this.add(this.buttonsContainer);
    }

    // Safe response handler with input debounce check
    const safeSelect = (choice: ResponseType) => {
      if (!this.isInputReady || this.hasSelected) return;
      this.hasSelected = true;
      config.onChoiceSelected(choice);
    };

    // Keyboard shortcuts (1, 2, 3, 4) - desktop only
    if (scene.input.keyboard) {
      this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
      this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
      this.key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

      this.key1.once('down', () => safeSelect('promise'));
      this.key2.once('down', () => safeSelect('blame'));
      this.key3.once('down', () => safeSelect('lie'));
      this.key4.once('down', () => safeSelect('honesty'));
    }

    scene.add.existing(this);
  }

  // ═══════ MOBILE SPEECH BUBBLE ═══════
  private createMobileSpeechBubble(
    scene: Phaser.Scene,
    text: string,
    residentX?: number,
    targetBubbleY?: number
  ): Phaser.GameObjects.Container {
    const cx = scene.scale.width / 2;
    const bubbleW = Math.min(scene.scale.width - 24, 460);
    const bubbleH = text.length > 85 ? 96 : (text.length > 50 ? 86 : 76);

    // Position directly above candidate/resident conversation area
    const bubbleY = targetBubbleY !== undefined
      ? targetBubbleY
      : Math.max(160, Math.min(220, Math.round(scene.scale.height * 0.28)));
    const container = scene.add.container(cx, bubbleY);
    container.setDepth(151);

    const bg = scene.add.graphics();
    // Shadow
    bg.fillStyle(0x000000, 0.45);
    bg.fillRoundedRect(-bubbleW / 2 + 3, -bubbleH / 2 + 5, bubbleW, bubbleH, 16);
    // Bubble body
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 16);
    bg.lineStyle(3, 0x111827, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 16);

    // Tail pointing down directly towards the resident
    const targetTailX = residentX !== undefined ? (residentX - cx) : 70;
    const clampedTailX = Phaser.Math.Clamp(targetTailX, -bubbleW / 2 + 45, bubbleW / 2 - 45);
    const tailW = 20;

    bg.fillStyle(0xffffff, 1);
    bg.beginPath();
    bg.moveTo(clampedTailX - tailW / 2, bubbleH / 2 - 2);
    bg.lineTo(clampedTailX + 4, bubbleH / 2 + 15);
    bg.lineTo(clampedTailX + tailW / 2 + 4, bubbleH / 2 - 2);
    bg.closePath();
    bg.fill();

    bg.lineStyle(3, 0x111827, 1);
    bg.beginPath();
    bg.moveTo(clampedTailX - tailW / 2, bubbleH / 2 - 2);
    bg.lineTo(clampedTailX + 4, bubbleH / 2 + 15);
    bg.lineTo(clampedTailX + tailW / 2 + 4, bubbleH / 2 - 2);
    bg.stroke();

    // Cover inside border seam cleanly
    bg.fillStyle(0xffffff, 1);
    bg.fillRect(clampedTailX - tailW / 2 + 2, bubbleH / 2 - 4, tailW + 2, 5);

    // "RESIDENT" label badge (Dark navy pill with cyan outline on top-left of bubble)
    const labelBadgeW = 96;
    const labelBadgeH = 22;
    const labelBadgeX = -bubbleW / 2 + 14;
    const labelBadgeY = -bubbleH / 2 - 10;
    const labelBg = scene.add.graphics();
    labelBg.fillStyle(0x0f172a, 1);
    labelBg.fillRoundedRect(labelBadgeX, labelBadgeY, labelBadgeW, labelBadgeH, 6);
    labelBg.lineStyle(1.5, 0x38bdf8, 1);
    labelBg.strokeRoundedRect(labelBadgeX, labelBadgeY, labelBadgeW, labelBadgeH, 6);

    const labelTxt = scene.add.text(labelBadgeX + labelBadgeW / 2, labelBadgeY + labelBadgeH / 2, '👤 RESIDENT', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10.5px',
      color: '#38bdf8',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    // Complaint text
    const fontSize = text.length > 80 ? '12.5px' : (text.length > 50 ? '13.5px' : '15px');
    const label = scene.add.text(0, 4, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: fontSize,
      color: '#0f172a',
      fontStyle: '800',
      align: 'center',
      wordWrap: { width: bubbleW - 32 }
    }).setOrigin(0.5, 0.5);

    container.add([bg, labelBg, labelTxt, label]);

    // Synchronized entrance: smooth fade-in and subtle slide into final position (280ms Cubic.easeOut)
    container.setAlpha(0);
    container.setY(bubbleY + 16);
    scene.tweens.add({
      targets: container,
      alpha: 1,
      y: bubbleY,
      duration: 280,
      ease: 'Cubic.easeOut'
    });

    return container;
  }

  // ═══════ MOBILE STACKED RESPONSE CARDS (Matches Image 2) ═══════
  private createMobileResponseButtons(scene: Phaser.Scene, config: DialogueModalConfig): Phaser.GameObjects.Container {
    const { width, height } = scene.scale;
    const { complaint, onChoiceSelected, partyId, onCancel } = config;

    const promiseChoice = getComplaintChoice(complaint, 'promise', partyId);
    const blameChoice = getComplaintChoice(complaint, 'blame', partyId);
    const lieChoice = getComplaintChoice(complaint, 'lie', partyId);
    const honestyChoice = getComplaintChoice(complaint, 'honesty', partyId);

    const cardW = Math.min(width - 24, 480);
    const cardH = height < 680 ? 58 : (height < 800 ? 64 : 68);
    const gap = height < 680 ? 7 : (height < 800 ? 8 : 10);
    const cancelH = height < 680 ? 28 : 32;
    const panelPaddingTop = height < 680 ? 12 : 16;
    const bottomMargin = height < 680 ? 12 : 20;
    const panelH = getMobileDialoguePanelHeight(height);

    const panel = scene.add.container(0, 0);
    panel.setDepth(152);

    // Bottom sheet background container
    const sheetBg = scene.add.graphics();
    sheetBg.fillStyle(0x070e1a, 0.96);
    sheetBg.fillRoundedRect(0, height - panelH, width, panelH + 50, { tl: 24, tr: 24, bl: 0, br: 0 });
    sheetBg.lineStyle(1.5, 0x1e293b, 1);
    sheetBg.strokeRoundedRect(0, height - panelH, width, panelH + 50, { tl: 24, tr: 24, bl: 0, br: 0 });
    panel.add(sheetBg);

    const responses: {
      type: ResponseType;
      title: string;
      text: string;
      bgColor: number;
      borderColor: number;
      iconType: 'check' | 'emoji';
      icon: string;
      subColor: string;
    }[] = [
      {
        type: 'promise',
        title: 'TRUTH / ACTION',
        text: promiseChoice.text,
        bgColor: 0x16a34a,
        borderColor: 0x4ade80,
        iconType: 'check',
        icon: '✔',
        subColor: '#f0fdf4'
      },
      {
        type: 'blame',
        title: 'EXCUSE / BLAME',
        text: blameChoice.text,
        bgColor: 0xea580c,
        borderColor: 0xfb923c,
        iconType: 'emoji',
        icon: '👆',
        subColor: '#fff7ed'
      },
      {
        type: 'lie',
        title: 'BOLD LIE',
        text: lieChoice.text,
        bgColor: 0x9333ea,
        borderColor: 0xc084fc,
        iconType: 'emoji',
        icon: '😏',
        subColor: '#faf5ff'
      },
      {
        type: 'honesty',
        title: 'SPIN / DEFLECTION',
        text: honestyChoice.text,
        bgColor: 0x0284c7,
        borderColor: 0x38bdf8,
        iconType: 'emoji',
        icon: '🔄',
        subColor: '#f0f9ff'
      }
    ];

    const allBtnContainers: Phaser.GameObjects.Container[] = [];
    const allBtnZones: Phaser.GameObjects.Zone[] = [];
    const startY = height - panelH + panelPaddingTop + cardH / 2;

    responses.forEach((resp, idx) => {
      const cardY = startY + idx * (cardH + gap);
      const cardContainer = scene.add.container(width / 2, cardY);

      // Card Background with generous padding
      const cardBg = scene.add.graphics();
      cardBg.fillStyle(resp.bgColor, 1);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
      cardBg.lineStyle(1.8, resp.borderColor, 0.95);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
      cardContainer.add(cardBg);

      // Left Icon
      const iconX = -cardW / 2 + 28;
      if (resp.iconType === 'check') {
        const iconCircle = scene.add.graphics();
        iconCircle.fillStyle(0xffffff, 1);
        iconCircle.fillCircle(iconX, 0, 15);
        iconCircle.lineStyle(3, 0x16a34a, 1);
        iconCircle.beginPath();
        iconCircle.moveTo(iconX - 6, 0);
        iconCircle.lineTo(iconX - 2, 4.5);
        iconCircle.lineTo(iconX + 6.5, -4);
        iconCircle.stroke();
        cardContainer.add(iconCircle);
      } else {
        const iconTxt = scene.add.text(iconX, 0, resp.icon, {
          fontSize: '25px'
        }).setOrigin(0.5, 0.5);
        cardContainer.add(iconTxt);
      }

      // Center Text Layout (Bolder, bigger titles & clear complaint response text)
      const textX = -cardW / 2 + 56;
      const textW = cardW - 92;

      // Title Line (TRUTH / ACTION, EXCUSE / BLAME, BOLD LIE, SPIN / DEFLECTION)
      const titleTxt = scene.add.text(textX, -12, resp.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: '900',
        letterSpacing: 0.6
      }).setOrigin(0, 0.5);
      cardContainer.add(titleTxt);

      // Subtitle Line (Complaint response)
      const subFontSize = resp.text.length > 55 ? '12px' : '13px';
      const subTxt = scene.add.text(textX, 13, resp.text, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: subFontSize,
        color: resp.subColor,
        fontStyle: '600',
        wordWrap: { width: textW }
      }).setOrigin(0, 0.5);
      cardContainer.add(subTxt);

      // Right Chevron ( > )
      const chevron = scene.add.text(cardW / 2 - 20, 0, '›', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);
      cardContainer.add(chevron);

      panel.add(cardContainer);
      allBtnContainers.push(cardContainer);

      // Touch Zone
      const zone = scene.add.zone(width / 2, cardY, cardW, cardH).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        if (!this.isInputReady || this.hasSelected) return;
        this.hasSelected = true;

        allBtnContainers.forEach((bc, bidx) => {
          if (bidx !== idx) {
            scene.tweens.add({
              targets: bc,
              alpha: 0.35,
              duration: 100
            });
          }
        });
        allBtnZones.forEach((z, zidx) => {
          if (zidx !== idx) {
            z.disableInteractive();
          }
        });

        // Highlight selected button with bounce
        scene.tweens.add({
          targets: cardContainer,
          scaleX: 0.97,
          scaleY: 0.97,
          duration: 80,
          yoyo: true,
          ease: 'Quad.easeInOut',
          onComplete: () => {
            // Slide panel down and fade out speech bubble
            scene.tweens.add({
              targets: panel,
              y: panelH + 60,
              duration: 220,
              ease: 'Cubic.easeIn'
            });
            scene.tweens.add({
              targets: this.speechBubble,
              alpha: 0,
              y: '-=20',
              duration: 180,
              ease: 'Cubic.easeIn',
              onComplete: () => {
                onChoiceSelected(resp.type);
              }
            });
          }
        });
      });

      panel.add(zone);
      allBtnZones.push(zone);
    });

    // ═══════ Cancel Button ═══════
    const cancelY = height - bottomMargin - cancelH / 2;
    const cancelTxt = scene.add.text(width / 2, cancelY, 'Cancel', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: '700'
    }).setOrigin(0.5, 0.5);
    panel.add(cancelTxt);

    const cancelZone = scene.add.zone(width / 2, cancelY, 140, 36).setInteractive({ useHandCursor: true });
    cancelZone.on('pointerover', () => cancelTxt.setColor('#94a3b8'));
    cancelZone.on('pointerout', () => cancelTxt.setColor('#ffffff'));
    cancelZone.on('pointerdown', () => {
      if (!this.isInputReady || this.hasSelected) return;
      this.hasSelected = true;

      scene.tweens.add({
        targets: panel,
        y: panelH + 60,
        duration: 220,
        ease: 'Cubic.easeIn'
      });
      scene.tweens.add({
        targets: this.speechBubble,
        alpha: 0,
        y: '-=20',
        duration: 180,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          if (onCancel) {
            onCancel();
          }
        }
      });
    });
    panel.add(cancelZone);
    allBtnZones.push(cancelZone);

    // Slide-up entrance animation for bottom sheet (280ms Cubic.easeOut synchronized with characters)
    panel.setY(panelH + 60);
    scene.tweens.add({
      targets: panel,
      y: 0,
      duration: 280,
      ease: 'Cubic.easeOut'
    });

    this.mobileResponsePanel = panel;
    return scene.add.container(0, 0);
  }

  // ═══════ DESKTOP SPEECH BUBBLE (unchanged) ═══════
  private createSpeechBubble(scene: Phaser.Scene, x: number, y: number, text: string): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const isPortrait = scene.scale.height > scene.scale.width;
    const bubbleW = Math.min(isPortrait ? 414 : 560, scene.scale.width - 24);
    const bubbleH = isPortrait ? 88 : 96;

    const bg = scene.add.graphics();
    // Shadow
    bg.fillStyle(0x000000, 0.45);
    bg.fillRoundedRect(-bubbleW / 2 + 4, -bubbleH / 2 + 6, bubbleW, bubbleH, 18);

    // Bubble body
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 18);
    bg.lineStyle(4, 0x111111, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 18);

    // Pointer tail pointing directly down to resident on sidewalk
    const tailX = isPortrait ? 40 : 60;
    const tailTipX = isPortrait ? 55 : 75;
    const tailW = 18;

    bg.fillStyle(0xffffff, 1);
    bg.beginPath();
    bg.moveTo(tailX, bubbleH / 2 - 2);
    bg.lineTo(tailTipX, bubbleH / 2 + 16);
    bg.lineTo(tailX + tailW, bubbleH / 2 - 2);
    bg.closePath();
    bg.fill();

    bg.lineStyle(4, 0x111111, 1);
    bg.beginPath();
    bg.moveTo(tailX, bubbleH / 2 - 2);
    bg.lineTo(tailTipX, bubbleH / 2 + 16);
    bg.lineTo(tailX + tailW, bubbleH / 2 - 2);
    bg.stroke();

    // Cover outline inside tail
    bg.fillStyle(0xffffff, 1);
    bg.fillRect(tailX + 2, bubbleH / 2 - 4, tailW - 4, 4);

    // Complaint text (Bold, crisp contrast, larger font)
    const label = scene.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: text.length > 70 ? '14.5px' : (text.length > 45 ? '16px' : (isPortrait ? '17.5px' : '20px')),
      color: '#0f172a',
      fontStyle: '900',
      align: 'center',
      wordWrap: { width: bubbleW - 28 }
    }).setOrigin(0.5, 0.5);

    container.add([bg, label]);

    // Entrance bounce animation
    container.setScale(0.85);
    scene.tweens.add({
      targets: container,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 220,
      ease: 'Back.easeOut'
    });

    return container;
  }

  // ═══════ DESKTOP RESPONSE BUTTONS (unchanged) ═══════
  private createResponseButtons(scene: Phaser.Scene, config: DialogueModalConfig, bubbleY: number): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    const { complaint, onChoiceSelected, partyId } = config;

    const cx = scene.scale.width / 2;
    const isPortrait = scene.scale.height > scene.scale.width;
    const colSpacing = isPortrait ? 104 : Math.min(270, scene.scale.width * 0.23);
    const btnWidth = isPortrait ? Math.min(198, (scene.scale.width - 24) / 2) : Math.min(480, colSpacing * 2 - 20);
    const btnHeight = isPortrait ? 80 : 74;

    // Position rows directly underneath question bubble
    const row1Y = isPortrait ? bubbleY + 94 : 270;
    const row2Y = isPortrait ? row1Y + 88 : 355;

    const promiseChoice = getComplaintChoice(complaint, 'promise', partyId);
    const blameChoice = getComplaintChoice(complaint, 'blame', partyId);
    const lieChoice = getComplaintChoice(complaint, 'lie', partyId);
    const honestyChoice = getComplaintChoice(complaint, 'honesty', partyId);

    const safeSelect = (choice: ResponseType) => {
      if (!this.isInputReady || this.hasSelected) return;
      this.hasSelected = true;
      onChoiceSelected(choice);
    };

    // 1. Green: TRUTH / DIRECT PROMISE
    const btn1 = new Button(scene, cx - colSpacing, row1Y, promiseChoice.text, () => {
      safeSelect('promise');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      categoryTag: '[1] \u2705 TRUTH / ACTION',
      tagBgColor: 0x0f421a,
      fontSize: isPortrait ? (promiseChoice.text.length > 25 ? '13px' : '14px') : (promiseChoice.text.length > 30 ? '15px' : '17px')
    });
    container.add(btn1);

    // 2. Orange: EXCUSE / BLAME
    const btn2 = new Button(scene, cx + colSpacing, row1Y, blameChoice.text, () => {
      safeSelect('blame');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0xdb580a,
      hoverColor: 0xf06a1a,
      categoryTag: '[2] \ud83d\udc49 EXCUSE / BLAME',
      tagBgColor: 0x5e2303,
      fontSize: isPortrait ? (blameChoice.text.length > 25 ? '12.5px' : '13.5px') : (blameChoice.text.length > 30 ? '14.5px' : '16px')
    });
    container.add(btn2);

    // 3. Purple: BOLD LIE (High risk / High reward!)
    const btn3 = new Button(scene, cx - colSpacing, row2Y, lieChoice.text, () => {
      safeSelect('lie');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x8e24aa,
      hoverColor: 0xab47bc,
      categoryTag: '[3] \ud83e\udd25 BOLD LIE',
      tagBgColor: 0x3d0b4d,
      fontSize: isPortrait ? (lieChoice.text.length > 25 ? '12.5px' : '13.5px') : (lieChoice.text.length > 30 ? '14.5px' : '16px')
    });
    container.add(btn3);

    // 4. Blue: SPIN / DEFLECTION (Talking about something else / humorous pivot)
    const btn4 = new Button(scene, cx + colSpacing, row2Y, honestyChoice.text, () => {
      safeSelect('honesty');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x176bc4,
      hoverColor: 0x2480e6,
      categoryTag: '[4] \ud83d\udd04 SPIN / DEFLECTION',
      tagBgColor: 0x0b2f56,
      fontSize: isPortrait ? (honestyChoice.text.length > 25 ? '12.5px' : '13.5px') : (honestyChoice.text.length > 30 ? '14.5px' : '16px')
    });
    container.add(btn4);

    // Soft fade-in for response buttons to visually distinguish from speech bubble
    container.setAlpha(0);
    scene.tweens.add({
      targets: container,
      alpha: 1,
      duration: 180,
      delay: 100
    });

    return container;
  }

  public destroyModal() {
    if (this.key1) this.key1.destroy();
    if (this.key2) this.key2.destroy();
    if (this.key3) this.key3.destroy();
    if (this.key4) this.key4.destroy();
    if (this.mobileResponsePanel) {
      this.mobileResponsePanel.destroy();
      this.mobileResponsePanel = null;
    }
    this.destroy();
  }
}
