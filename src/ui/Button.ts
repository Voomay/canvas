import Phaser from 'phaser';
import { SoundFX } from '../systems/SoundFX';

export interface ButtonOptions {
  width?: number;
  height?: number;
  bgColor?: number;
  hoverColor?: number;
  textColor?: string;
  fontSize?: string;
  borderColor?: number;
  borderWidth?: number;
  radius?: number;
  emoji?: string;
  categoryTag?: string;
  tagBgColor?: number;
  shortcutKeyText?: string;
}

export class Button extends Phaser.GameObjects.Container {
  private bgGraphics: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private tagContainer?: Phaser.GameObjects.Container;
  private btnWidth: number;
  private btnHeight: number;
  private bgColor: number;
  private hoverColor: number;
  private borderColor: number;
  private borderWidth: number;
  private radius: number;
  private soundFX: SoundFX;
  private isEnabled: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options: ButtonOptions = {}
  ) {
    super(scene, x, y);

    this.btnWidth = options.width || 280;
    this.btnHeight = options.height || 64;
    this.bgColor = options.bgColor ?? 0x1f9137;
    this.hoverColor = options.hoverColor ?? 0x27ab42;
    this.borderColor = options.borderColor ?? 0x111111;
    this.borderWidth = options.borderWidth ?? 3;
    this.radius = options.radius ?? 12;
    this.soundFX = SoundFX.getInstance();

    // Background Graphic
    this.bgGraphics = scene.add.graphics();
    this.drawBackground(this.bgColor);
    this.add(this.bgGraphics);

    // If there's a category tag / badge, shift main text down for balanced layout
    const hasTag = Boolean(options.categoryTag || options.shortcutKeyText);
    const textOffsetY = hasTag ? 11 : 0;

    // Text Label with clean horizontal padding and line spacing
    this.labelText = scene.add.text(0, textOffsetY, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: options.fontSize || '16px',
      color: options.textColor || '#ffffff',
      fontStyle: '900',
      align: 'center',
      lineSpacing: 2,
      wordWrap: { width: this.btnWidth - 16 }
    });
    this.labelText.setOrigin(0.5, 0.5);
    this.add(this.labelText);

    // Crisp Category Tag Pill on top of button (e.g. "[1] TRUTH", "[2] BLAME", "[3] LIE", "[4] SPIN")
    if (options.categoryTag) {
      const tagText = options.categoryTag;
      const tagBg = scene.add.graphics();
      const tagW = Math.min(this.btnWidth - 14, tagText.length * 8 + 18);
      const tagH = 18;
      const tagY = -this.btnHeight / 2 + 12;

      const pillColor = options.tagBgColor ?? 0x0c1524;
      tagBg.fillStyle(pillColor, 0.95);
      tagBg.fillRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 6);
      tagBg.lineStyle(1.5, 0xffffff, 0.85);
      tagBg.strokeRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 6);

      const tagTxtObj = scene.add.text(0, 0, tagText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#ffea77',
        fontStyle: '900'
      }).setOrigin(0.5, 0.5);

      this.tagContainer = scene.add.container(0, tagY, [tagBg, tagTxtObj]);
      this.add(this.tagContainer);
    } else if (options.shortcutKeyText) {
      const shortcutText = scene.add.text(-this.btnWidth / 2 + 20, -this.btnHeight / 2 + 10, options.shortcutKeyText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#ffdd77',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.add(shortcutText);
    }

    // Interactivity with generous hit area for touch comfort
    const hitPad = 12;
    this.setSize(this.btnWidth, this.btnHeight);
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.btnWidth / 2 - hitPad,
        -this.btnHeight / 2 - hitPad,
        this.btnWidth + hitPad * 2,
        this.btnHeight + hitPad * 2
      ),
      Phaser.Geom.Rectangle.Contains
    );

    let isDown = false;

    this.on('pointerover', () => {
      if (!this.isEnabled) return;
      this.drawBackground(this.hoverColor);
      this.setScale(1.03);
    });

    this.on('pointerout', () => {
      if (!this.isEnabled) return;
      isDown = false;
      this.drawBackground(this.bgColor);
      this.setScale(1.0);
    });

    this.on('pointerdown', () => {
      if (!this.isEnabled) return;
      isDown = true;
      this.setScale(0.96);
    });

    this.on('pointerup', () => {
      if (!this.isEnabled) return;
      this.setScale(1.0);
      if (isDown) {
        isDown = false;
        this.soundFX.playButtonClick();
        onClick();
      }
    });

    this.on('pointerupoutside', () => {
      if (!this.isEnabled) return;
      this.setScale(1.0);
      if (isDown) {
        isDown = false;
        this.soundFX.playButtonClick();
        onClick();
      }
    });

    scene.add.existing(this);
  }

  private drawBackground(color: number) {
    this.bgGraphics.clear();
    // Dark shadow / 3D rim below
    this.bgGraphics.fillStyle(0x000000, 0.4);
    this.bgGraphics.fillRoundedRect(
      -this.btnWidth / 2 + 2,
      -this.btnHeight / 2 + 5,
      this.btnWidth,
      this.btnHeight,
      this.radius
    );

    // Main button face
    this.bgGraphics.fillStyle(color, 1);
    this.bgGraphics.fillRoundedRect(
      -this.btnWidth / 2,
      -this.btnHeight / 2,
      this.btnWidth,
      this.btnHeight,
      this.radius
    );

    // Outer border
    this.bgGraphics.lineStyle(this.borderWidth, this.borderColor, 1);
    this.bgGraphics.strokeRoundedRect(
      -this.btnWidth / 2,
      -this.btnHeight / 2,
      this.btnWidth,
      this.btnHeight,
      this.radius
    );
  }

  public setText(newText: string) {
    this.labelText.setText(newText);
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.setAlpha(enabled ? 1.0 : 0.5);
    if (!enabled) {
      this.disableInteractive();
    } else {
      this.setInteractive({ useHandCursor: true });
    }
  }
}
