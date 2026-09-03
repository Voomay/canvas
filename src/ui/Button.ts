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
  shortcutKeyText?: string;
}

export class Button extends Phaser.GameObjects.Container {
  private bgGraphics: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private emojiText?: Phaser.GameObjects.Text;
  private shortcutText?: Phaser.GameObjects.Text;
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

    // Text Label
    this.labelText = scene.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: options.fontSize || '20px',
      color: options.textColor || '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: this.btnWidth - 40 }
    });
    this.labelText.setOrigin(0.5, 0.5);
    this.add(this.labelText);

    // Optional Emoji on the right
    if (options.emoji) {
      this.emojiText = scene.add.text(this.btnWidth / 2 - 32, 0, options.emoji, {
        fontSize: '28px'
      });
      this.emojiText.setOrigin(0.5, 0.5);
      this.add(this.emojiText);
    }

    // Optional Keyboard Shortcut badge
    if (options.shortcutKeyText) {
      this.shortcutText = scene.add.text(-this.btnWidth / 2 + 24, -this.btnHeight / 2 + 10, options.shortcutKeyText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: '#ffdd77',
        fontStyle: 'bold'
      });
      this.shortcutText.setOrigin(0.5, 0.5);
      this.add(this.shortcutText);
    }

    // Interactivity
    this.setSize(this.btnWidth, this.btnHeight);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', () => {
      if (!this.isEnabled) return;
      this.drawBackground(this.hoverColor);
      this.setScale(1.03);
    });

    this.on('pointerout', () => {
      if (!this.isEnabled) return;
      this.drawBackground(this.bgColor);
      this.setScale(1.0);
    });

    this.on('pointerdown', () => {
      if (!this.isEnabled) return;
      this.setScale(0.97);
    });

    this.on('pointerup', () => {
      if (!this.isEnabled) return;
      this.setScale(1.0);
      this.soundFX.playButtonClick();
      onClick();
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
