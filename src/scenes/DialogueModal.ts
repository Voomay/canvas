import Phaser from 'phaser';
import { ComplaintData, ResponseType, getComplaintChoice } from '../data/complaints';
import { Button } from '../ui/Button';

export interface DialogueModalConfig {
  complaint: ComplaintData;
  partyId?: 'da' | 'anc' | 'pa';
  onChoiceSelected: (choice: ResponseType) => void;
}

export class DialogueModal extends Phaser.GameObjects.Container {
  private speechBubble: Phaser.GameObjects.Container;
  private buttonsContainer: Phaser.GameObjects.Container;
  private key1?: Phaser.Input.Keyboard.Key;
  private key2?: Phaser.Input.Keyboard.Key;
  private key3?: Phaser.Input.Keyboard.Key;
  private key4?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, config: DialogueModalConfig) {
    super(scene, 0, 0);

    this.setDepth(150);

    const cx = scene.scale.width / 2;
    const isPortrait = scene.scale.height > scene.scale.width;

    // 1. Comic Speech Bubble anchored above resident
    const bubbleX = isPortrait ? cx : Math.min(scene.scale.width - 240, cx - 40);
    const bubbleY = isPortrait ? Math.max(420, Math.round(scene.scale.height - 245)) : 195;
    this.speechBubble = this.createSpeechBubble(scene, bubbleX, bubbleY, config.complaint.complaintText);
    this.add(this.speechBubble);

    // 2. 4 Response Buttons in a clear 2x2 Grid (Promise, Blame, Lie, Honesty)
    this.buttonsContainer = this.createResponseButtons(scene, config);
    this.add(this.buttonsContainer);

    // Keyboard shortcuts (1, 2, 3, 4)
    if (scene.input.keyboard) {
      this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
      this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
      this.key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

      this.key1.once('down', () => config.onChoiceSelected('promise'));
      this.key2.once('down', () => config.onChoiceSelected('blame'));
      this.key3.once('down', () => config.onChoiceSelected('lie'));
      this.key4.once('down', () => config.onChoiceSelected('honesty'));
    }

    scene.add.existing(this);
  }

  private createSpeechBubble(scene: Phaser.Scene, x: number, y: number, text: string): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const isPortrait = scene.scale.height > scene.scale.width;
    const bubbleW = Math.min(isPortrait ? 410 : 540, scene.scale.width - 24);
    const bubbleH = isPortrait ? 95 : 105;

    const bg = scene.add.graphics();
    // Shadow
    bg.fillStyle(0x000000, 0.45);
    bg.fillRoundedRect(-bubbleW / 2 + 4, -bubbleH / 2 + 6, bubbleW, bubbleH, 18);

    // Bubble body
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 18);
    bg.lineStyle(4, 0x111111, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 18);

    // Pointer tail pointing directly to resident on sidewalk
    const tailX = isPortrait ? 55 : -25;
    const tailTipX = isPortrait ? 75 : -45;
    const tailW = 20;

    bg.fillStyle(0xffffff, 1);
    bg.beginPath();
    bg.moveTo(tailX, bubbleH / 2 - 2);
    bg.lineTo(tailTipX, bubbleH / 2 + 20);
    bg.lineTo(tailX + tailW, bubbleH / 2 - 2);
    bg.closePath();
    bg.fill();

    bg.lineStyle(4, 0x111111, 1);
    bg.beginPath();
    bg.moveTo(tailX, bubbleH / 2 - 2);
    bg.lineTo(tailTipX, bubbleH / 2 + 20);
    bg.lineTo(tailX + tailW, bubbleH / 2 - 2);
    bg.stroke();

    // Cover outline inside tail
    bg.fillStyle(0xffffff, 1);
    bg.fillRect(tailX + 2, bubbleH / 2 - 4, tailW - 4, 4);

    // Complaint text
    const label = scene.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: text.length > 70 ? '15px' : (text.length > 45 ? '16.5px' : (isPortrait ? '17.5px' : '21px')),
      color: '#0f172a',
      fontStyle: '900',
      align: 'center',
      wordWrap: { width: bubbleW - 36 }
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

  private createResponseButtons(scene: Phaser.Scene, config: DialogueModalConfig): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    const { complaint, onChoiceSelected, partyId } = config;

    const cx = scene.scale.width / 2;
    const isPortrait = scene.scale.height > scene.scale.width;
    const colSpacing = isPortrait ? 104 : Math.min(270, scene.scale.width * 0.23);
    const btnWidth = isPortrait ? Math.min(196, (scene.scale.width - 24) / 2) : Math.min(480, colSpacing * 2 - 20);
    const btnHeight = isPortrait ? 80 : 72;

    const row1Y = isPortrait ? Math.max(180, Math.round(scene.scale.height * 0.28)) : 535;
    const row2Y = isPortrait ? row1Y + 92 : 620;

    const promiseChoice = getComplaintChoice(complaint, 'promise', partyId);
    const blameChoice = getComplaintChoice(complaint, 'blame', partyId);
    const lieChoice = getComplaintChoice(complaint, 'lie', partyId);
    const honestyChoice = getComplaintChoice(complaint, 'honesty', partyId);

    // 1. Green: TRUTH / DIRECT PROMISE
    const btn1 = new Button(scene, cx - colSpacing, row1Y, promiseChoice.text, () => {
      onChoiceSelected('promise');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      categoryTag: '[1] ✅ TRUTH / ACTION',
      tagBgColor: 0x0f421a,
      fontSize: isPortrait ? (promiseChoice.text.length > 25 ? '12px' : '13px') : (promiseChoice.text.length > 30 ? '15px' : '17px')
    });
    container.add(btn1);

    // 2. Orange: EXCUSE / BLAME
    const btn2 = new Button(scene, cx + colSpacing, row1Y, blameChoice.text, () => {
      onChoiceSelected('blame');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0xdb580a,
      hoverColor: 0xf06a1a,
      categoryTag: '[2] 👉 EXCUSE / BLAME',
      tagBgColor: 0x5e2303,
      fontSize: isPortrait ? (blameChoice.text.length > 25 ? '11.5px' : '12.5px') : (blameChoice.text.length > 30 ? '14px' : '16px')
    });
    container.add(btn2);

    // 3. Purple: BOLD LIE (High risk / High reward!)
    const btn3 = new Button(scene, cx - colSpacing, row2Y, lieChoice.text, () => {
      onChoiceSelected('lie');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x8e24aa,
      hoverColor: 0xab47bc,
      categoryTag: '[3] 🤥 BOLD LIE',
      tagBgColor: 0x3d0b4d,
      fontSize: isPortrait ? (lieChoice.text.length > 25 ? '11.5px' : '12.5px') : (lieChoice.text.length > 30 ? '14px' : '16px')
    });
    container.add(btn3);

    // 4. Blue: SPIN / DEFLECTION (Talking about something else / humorous pivot)
    const btn4 = new Button(scene, cx + colSpacing, row2Y, honestyChoice.text, () => {
      onChoiceSelected('honesty');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x176bc4,
      hoverColor: 0x2480e6,
      categoryTag: '[4] 🔄 SPIN / DEFLECTION',
      tagBgColor: 0x0b2f56,
      fontSize: isPortrait ? (honestyChoice.text.length > 25 ? '11.5px' : '12.5px') : (honestyChoice.text.length > 30 ? '14px' : '16px')
    });
    container.add(btn4);

    return container;
  }

  public destroyModal() {
    if (this.key1) this.key1.destroy();
    if (this.key2) this.key2.destroy();
    if (this.key3) this.key3.destroy();
    if (this.key4) this.key4.destroy();
    this.destroy();
  }
}
