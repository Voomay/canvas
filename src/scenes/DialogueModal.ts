import Phaser from 'phaser';
import { ComplaintData, ResponseType } from '../data/complaints';
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

  constructor(scene: Phaser.Scene, config: DialogueModalConfig) {
    super(scene, 0, 0);

    this.setDepth(150);

    const cx = scene.scale.width / 2;

    // 1. Comic Speech Bubble above resident / pavement
    this.speechBubble = this.createSpeechBubble(scene, Math.min(scene.scale.width - 240, cx - 60), 220, config.complaint.complaintText);
    this.add(this.speechBubble);

    // 2. 3 Bottom Response Buttons matching reference screenshot
    this.buttonsContainer = this.createResponseButtons(scene, config);
    this.add(this.buttonsContainer);

    // Keyboard shortcuts (1, 2, 3)
    if (scene.input.keyboard) {
      this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
      this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

      this.key1.once('down', () => config.onChoiceSelected('promise'));
      this.key2.once('down', () => config.onChoiceSelected('blame'));
      this.key3.once('down', () => config.onChoiceSelected('honesty'));
    }

    scene.add.existing(this);
  }

  private createSpeechBubble(scene: Phaser.Scene, x: number, y: number, text: string): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const bubbleW = 440;
    const bubbleH = 110;

    const bg = scene.add.graphics();
    // Shadow
    bg.fillStyle(0x000000, 0.4);
    bg.fillRoundedRect(-bubbleW / 2 + 4, -bubbleH / 2 + 6, bubbleW, bubbleH, 20);

    // Bubble body
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 20);
    bg.lineStyle(4, 0x111111, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 20);

    // Pointer tail pointing to resident
    bg.fillStyle(0xffffff, 1);
    bg.beginPath();
    bg.moveTo(-30, bubbleH / 2 - 2);
    bg.lineTo(-50, bubbleH / 2 + 22);
    bg.lineTo(-10, bubbleH / 2 - 2);
    bg.closePath();
    bg.fill();

    bg.lineStyle(4, 0x111111, 1);
    bg.beginPath();
    bg.moveTo(-30, bubbleH / 2 - 2);
    bg.lineTo(-50, bubbleH / 2 + 22);
    bg.lineTo(-10, bubbleH / 2 - 2);
    bg.stroke();

    // Cover outline inside tail
    bg.fillStyle(0xffffff, 1);
    bg.fillRect(-28, bubbleH / 2 - 4, 16, 4);

    // Complaint text
    const label = scene.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: text.length > 50 ? '18px' : '20px',
      color: '#111111',
      fontStyle: '900',
      align: 'center',
      wordWrap: { width: bubbleW - 40 }
    }).setOrigin(0.5, 0.5);

    container.add([bg, label]);

    // Entrance bounce animation
    container.setScale(0.85);
    scene.tweens.add({
      targets: container,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 250,
      ease: 'Back.easeOut'
    });

    return container;
  }

  private createResponseButtons(scene: Phaser.Scene, config: DialogueModalConfig): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    const { complaint, onChoiceSelected, partyId } = config;

    const cx = scene.scale.width / 2;
    const spacing = Math.min(400, (scene.scale.width - 60) / 3);
    const btnWidth = Math.min(370, spacing - 16);
    const btnHeight = 78;
    const btnY = 610;

    // Party-tailored responses if available
    const partyResp = (partyId && complaint.partyResponses) ? complaint.partyResponses[partyId] : undefined;
    const promiseText = partyResp?.promise || complaint.responses.promise;
    const blameText = partyResp?.blame || complaint.responses.blame;
    const honestyText = partyResp?.honesty || complaint.responses.honesty;
    const honestyEmoji = partyResp?.honestyEmoji || complaint.responses.honestyEmoji || '😂';

    // 1. Green Button: PROMISE / WE WILL FIX IT!
    const btn1 = new Button(scene, cx - spacing, btnY, promiseText, () => {
      onChoiceSelected('promise');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x1f9137,
      hoverColor: 0x27ab42,
      fontSize: promiseText.length > 25 ? '16px' : (promiseText.length > 18 ? '18px' : '21px'),
      shortcutKeyText: '[1]'
    });
    container.add(btn1);

    // 2. Orange Button: BLAME THE OTHER PARTIES / OPPOSITION
    const btn2 = new Button(scene, cx, btnY, blameText, () => {
      onChoiceSelected('blame');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0xdb580a,
      hoverColor: 0xf06a1a,
      fontSize: blameText.length > 35 ? '14px' : (blameText.length > 22 ? '16px' : '19px'),
      shortcutKeyText: '[2]'
    });
    container.add(btn2);

    // 3. Blue Button: Tailored Funny Honesty + Emoji
    const btn3 = new Button(scene, cx + spacing, btnY, honestyText, () => {
      onChoiceSelected('honesty');
    }, {
      width: btnWidth,
      height: btnHeight,
      bgColor: 0x176bc4,
      hoverColor: 0x2480e6,
      fontSize: honestyText.length > 35 ? '14px' : (honestyText.length > 22 ? '16px' : '18px'),
      emoji: honestyEmoji,
      shortcutKeyText: '[3]'
    });
    container.add(btn3);

    return container;
  }

  public destroyModal() {
    if (this.key1) this.key1.destroy();
    if (this.key2) this.key2.destroy();
    if (this.key3) this.key3.destroy();
    this.destroy();
  }
}
