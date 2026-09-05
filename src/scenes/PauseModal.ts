import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { SoundFX } from '../systems/SoundFX';
import { ScoreManager } from '../systems/ScoreManager';
import { StreetLevel } from '../data/streets';

export interface PauseModalConfig {
  currentStreet: StreetLevel;
  partyId: 'da' | 'anc' | 'pa';
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export class PauseModal extends Phaser.GameObjects.Container {
  private soundFX: SoundFX;
  private scoreManager: ScoreManager;
  private keyP?: Phaser.Input.Keyboard.Key;
  private keyEsc?: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, config: PauseModalConfig) {
    super(scene, 0, 0);
    this.soundFX = SoundFX.getInstance();
    this.scoreManager = ScoreManager.getInstance();
    this.setDepth(200);

    const width = scene.scale.width;
    const height = scene.scale.height;
    const isPortrait = height > width;
    const cx = width / 2;
    const cy = height / 2;

    // 1. Dark Blur Backdrop (absorbs all clicks)
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x030712, 0.78);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    this.add(backdrop);

    // 2. Modal Box Dimensions
    const modalW = Math.min(isPortrait ? width - 28 : 510, 530);
    const modalH = isPortrait ? 465 : 445;

    const modalBox = scene.add.graphics();
    // Soft outer drop shadow
    modalBox.fillStyle(0x000000, 0.65);
    modalBox.fillRoundedRect(cx - modalW / 2 + 8, cy - modalH / 2 + 10, modalW, modalH, 22);

    // Deep midnight glass background
    modalBox.fillStyle(0x0b1329, 0.97);
    modalBox.fillRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 22);

    // Double-layered glowing neon border
    modalBox.lineStyle(2.5, 0x1e3a8a, 0.9);
    modalBox.strokeRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 22);

    modalBox.lineStyle(1.5, 0x38bdf8, 0.55);
    modalBox.strokeRoundedRect(cx - modalW / 2 + 3, cy - modalH / 2 + 3, modalW - 6, modalH - 6, 19);

    // Subtle glass top reflection rim
    modalBox.fillStyle(0xffffff, 0.08);
    modalBox.fillRoundedRect(cx - modalW / 2 + 6, cy - modalH / 2 + 5, modalW - 12, 34, 16);

    this.add(modalBox);

    // 3. Header Icon Badge + Title
    const headerY = cy - modalH / 2 + 42;

    // Mini icon badge
    const iconBadge = scene.add.graphics();
    iconBadge.fillStyle(0x1e293b, 0.9);
    iconBadge.fillCircle(cx - 105, headerY, 18);
    iconBadge.lineStyle(2, 0x38bdf8, 0.8);
    iconBadge.strokeCircle(cx - 105, headerY, 18);
    this.add(iconBadge);

    const pauseIcon = scene.add.text(cx - 105, headerY, '⏸', {
      fontSize: '15px',
      color: '#38bdf8'
    }).setOrigin(0.5, 0.5);
    this.add(pauseIcon);

    // Main Title
    const titleText = scene.add.text(cx + 12, headerY, 'GAME PAUSED', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '23px' : '26px',
      color: '#fbbf24',
      fontStyle: '900',
      stroke: '#050a12',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.add(titleText);

    // Subtitle Pill
    const cleanWardName = config.currentStreet.name.replace(/^Area \d+:\s*/i, '').toUpperCase();
    const wardNumber = this.scoreManager.currentStreetIndex;
    const subtitleY = headerY + 30;

    const subtitleBadge = scene.add.graphics();
    const subW = Math.min(modalW - 60, 380);
    const subH = 26;
    subtitleBadge.fillStyle(0x131f33, 0.85);
    subtitleBadge.fillRoundedRect(cx - subW / 2, subtitleY - subH / 2, subW, subH, 13);
    subtitleBadge.lineStyle(1.2, 0x243b60, 0.8);
    subtitleBadge.strokeRoundedRect(cx - subW / 2, subtitleY - subH / 2, subW, subH, 13);
    this.add(subtitleBadge);

    const subtitleText = scene.add.text(
      cx,
      subtitleY,
      `📍 WARD ${wardNumber}: ${cleanWardName} • WARD ${wardNumber} OF 5`,
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '11px' : '12px',
        color: '#94a3b8',
        fontStyle: '800'
      }
    ).setOrigin(0.5, 0.5);
    this.add(subtitleText);

    // 4. 3 Separate Modern Metric Tiles / Stat Cards
    const statsY = subtitleY + 52;
    const cardGap = 10;
    const totalW = modalW - 48;
    const cardW = Math.floor((totalW - cardGap * 2) / 3);
    const cardH = 62;

    const remaining = Math.max(0, Math.floor(this.scoreManager.totalTimeRemaining));
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = (remaining % 60).toString().padStart(2, '0');

    // Tile 1: Votes
    const card1X = cx - cardW - cardGap;
    this.createStatTile(
      scene,
      card1X,
      statsY,
      cardW,
      cardH,
      '🗳️ VOTES',
      `${this.scoreManager.votes}/${config.currentStreet.targetVotes}`,
      '#fbbf24'
    );

    // Tile 2: Trust
    const card2X = cx;
    const trustColor = this.scoreManager.trust >= 50 ? '#4ade80' : '#f87171';
    this.createStatTile(
      scene,
      card2X,
      statsY,
      cardW,
      cardH,
      '🤝 TRUST',
      `${Math.round(this.scoreManager.trust)}%`,
      trustColor
    );

    // Tile 3: Time Left
    const card3X = cx + cardW + cardGap;
    this.createStatTile(
      scene,
      card3X,
      statsY,
      cardW,
      cardH,
      '⏱️ TIME LEFT',
      `${mins}:${secs}`,
      '#f8fafc'
    );

    // 5. Action Buttons with Polished Spacing
    const btnW = Math.min(modalW - 48, 380);
    const btnH = 48;
    let currentBtnY = statsY + 62;
    const btnSpacing = 56;

    // Resume Button (Vibrant Emerald)
    const resumeBtn = new Button(
      scene,
      cx,
      currentBtnY,
      '▶   RESUME GAME',
      () => {
        this.closeModal();
        config.onResume();
      },
      {
        width: btnW,
        height: btnH,
        bgColor: 0x16a34a,
        hoverColor: 0x22c55e,
        borderColor: 0x4ade80,
        borderWidth: 2,
        radius: 12,
        fontSize: '15px',
        textColor: '#ffffff'
      }
    );
    this.add(resumeBtn);

    // Restart Ward Button (Royal Sapphire)
    currentBtnY += btnSpacing;
    const restartBtn = new Button(
      scene,
      cx,
      currentBtnY,
      '🔄   RESTART WARD',
      () => {
        this.closeModal();
        config.onRestart();
      },
      {
        width: btnW,
        height: btnH,
        bgColor: 0x2563eb,
        hoverColor: 0x3b82f6,
        borderColor: 0x60a5fa,
        borderWidth: 2,
        radius: 12,
        fontSize: '15px',
        textColor: '#ffffff'
      }
    );
    this.add(restartBtn);

    // Exit to Main Menu Button (Frosted Slate)
    currentBtnY += btnSpacing;
    const menuBtn = new Button(
      scene,
      cx,
      currentBtnY,
      '🏠   EXIT TO MAIN MENU',
      () => {
        this.closeModal();
        config.onMainMenu();
      },
      {
        width: btnW,
        height: btnH,
        bgColor: 0x1e293b,
        hoverColor: 0x334155,
        borderColor: 0x475569,
        borderWidth: 2,
        radius: 12,
        fontSize: '15px',
        textColor: '#cbd5e1'
      }
    );
    this.add(menuBtn);

    // 6. Interactive Audio Pill at Bottom
    currentBtnY += 44;
    const isMuted = this.soundFX.isMusicMutedState();

    const audioPill = scene.add.container(cx, currentBtnY);
    const pillW = 280;
    const pillH = 30;

    const pillBg = scene.add.graphics();
    const drawAudioPillBg = (hover: boolean) => {
      pillBg.clear();
      pillBg.fillStyle(hover ? 0x1e293b : 0x0f172a, 0.9);
      pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 15);
      pillBg.lineStyle(1.5, hover ? 0x60a5fa : 0x334155, 0.9);
      pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 15);
    };
    drawAudioPillBg(false);

    const audioLabel = scene.add.text(
      0,
      0,
      isMuted ? '🔇 MUSIC MUTED (CLICK TO UNMUTE)' : '🎵 MUSIC PLAYING (CLICK TO MUTE)',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '11px',
        color: isMuted ? '#94a3b8' : '#fbbf24',
        fontStyle: '800'
      }
    ).setOrigin(0.5, 0.5);

    audioPill.add([pillBg, audioLabel]);
    const pillHitPad = 8;
    audioPill.setSize(pillW, pillH);
    audioPill.setInteractive(
      new Phaser.Geom.Rectangle(-pillHitPad, -pillHitPad, pillW + pillHitPad * 2, pillH + pillHitPad * 2),
      Phaser.Geom.Rectangle.Contains
    );

    audioPill.on('pointerover', () => drawAudioPillBg(true));
    audioPill.on('pointerout', () => drawAudioPillBg(false));

    audioPill.on('pointerdown', () => {
      const nowMuted = this.soundFX.toggleMusicMute();
      audioLabel.setText(nowMuted ? '🔇 MUSIC MUTED (CLICK TO UNMUTE)' : '🎵 MUSIC PLAYING (CLICK TO MUTE)');
      audioLabel.setColor(nowMuted ? '#94a3b8' : '#fbbf24');
    });

    this.add(audioPill);

    // 7. Keyboard shortcuts to unpause (P or ESC)
    if (scene.input.keyboard) {
      this.keyP = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
      this.keyEsc = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

      this.keyP.once('down', () => {
        this.closeModal();
        config.onResume();
      });
      this.keyEsc.once('down', () => {
        this.closeModal();
        config.onResume();
      });
    }

    // Modal Entrance Spring Animation (Starts visible, subtle pop)
    this.setScale(1);
    this.setAlpha(1);

    scene.add.existing(this);
  }

  private createStatTile(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    valColor: string
  ) {
    const tile = scene.add.container(x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(0x111c2e, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(1.5, 0x223552, 0.85);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Top Label
    const lbl = scene.add.text(0, -h / 2 + 15, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      color: '#94a3b8',
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    // Bottom Value
    const val = scene.add.text(0, -h / 2 + 38, value, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: valColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    tile.add([bg, lbl, val]);
    this.add(tile);
  }

  private closeModal() {
    if (this.keyP) {
      this.keyP.removeAllListeners();
    }
    if (this.keyEsc) {
      this.keyEsc.removeAllListeners();
    }
    this.destroy();
  }
}
