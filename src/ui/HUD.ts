import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';

export class HUD extends Phaser.GameObjects.Container {
  private votesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private trustText!: Phaser.GameObjects.Text;
  private streetProgressNodes: Phaser.GameObjects.Arc[] = [];
  private streetProgressLine: Phaser.GameObjects.Graphics;
  private streetLabelText!: Phaser.GameObjects.Text;
  private jumpTouchBtn?: Phaser.GameObjects.Container;
  private scoreManager: ScoreManager;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.scoreManager = ScoreManager.getInstance();

    this.setDepth(100);

    const width = scene.scale.width;

    // 1. Top Left Badge: VOTES
    this.createVotesBadge(scene, 95, 60);

    // 2. Top Center: Title & Timer
    this.createCenterTitleAndTimer(scene, width / 2, 50);

    // 3. Top Right Badge: TRUST
    this.createTrustBadge(scene, width - 95, 60);

    // 4. Bottom: Street Progress Track
    this.streetProgressLine = scene.add.graphics();
    this.add(this.streetProgressLine);
    this.createStreetProgressBar(scene, width / 2, 685);

    // 5. Mobile Jump Button (Bottom Right)
    this.createMobileJumpButton(scene, width - 80, 610);

    // 6. In-Game Exit / Menu Button (Top Left)
    this.createExitButton(scene, 95, 116);

    scene.add.existing(this);
    this.updateValues();
  }

  private createVotesBadge(scene: Phaser.Scene, x: number, y: number) {
    const bg = scene.add.graphics();
    const w = 150;
    const h = 76;

    bg.fillStyle(0x0c1524, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(3, 0x1f3c6e, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const title = scene.add.text(0, -18, 'VOTES', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.votesText = scene.add.text(0, 12, '0', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '34px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const badgeContainer = scene.add.container(x, y, [bg, title, this.votesText]);
    this.add(badgeContainer);
  }

  private createCenterTitleAndTimer(scene: Phaser.Scene, x: number, y: number) {
    const title = scene.add.text(0, -14, 'CAMPAIGN TRAIL', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: '900',
      stroke: '#0c1524',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    this.timerText = scene.add.text(0, 16, '02:00', {
      fontFamily: 'Outfit, monospace',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#0c1524',
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5, 0.5);

    const centerContainer = scene.add.container(x, y, [title, this.timerText]);
    this.add(centerContainer);
  }

  private createTrustBadge(scene: Phaser.Scene, x: number, y: number) {
    const bg = scene.add.graphics();
    const w = 150;
    const h = 76;

    bg.fillStyle(0x0c1524, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(3, 0x1f3c6e, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const title = scene.add.text(0, -18, 'TRUST', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.trustText = scene.add.text(0, 12, '50%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '34px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const badgeContainer = scene.add.container(x, y, [bg, title, this.trustText]);
    this.add(badgeContainer);
  }

  private createStreetProgressBar(scene: Phaser.Scene, cx: number, cy: number) {
    const totalStreets = 5;
    const trackWidth = 320;
    const startX = cx - trackWidth / 2;
    const step = trackWidth / (totalStreets - 1);

    for (let i = 0; i < totalStreets; i++) {
      const nodeX = startX + i * step;
      const node = scene.add.circle(nodeX, cy - 8, 7, 0x5a6e85);
      node.setStrokeStyle(2, 0x111111);
      this.streetProgressNodes.push(node);
      this.add(node);
    }

    this.streetLabelText = scene.add.text(cx, cy + 12, 'STREET 1 OF 5', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: '900',
      stroke: '#0c1524',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.add(this.streetLabelText);
  }

  private createMobileJumpButton(scene: Phaser.Scene, x: number, y: number) {
    const bg = scene.add.graphics();
    const size = 66;

    bg.fillStyle(0x005ba6, 0.85);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(3, 0xffffff, 0.9);
    bg.strokeCircle(0, 0, size / 2);

    const txt = scene.add.text(0, 0, 'JUMP ⬆', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.jumpTouchBtn = scene.add.container(x, y, [bg, txt]);
    this.jumpTouchBtn.setSize(size, size);
    this.jumpTouchBtn.setInteractive({ useHandCursor: true });

    this.jumpTouchBtn.on('pointerdown', () => {
      this.scene.events.emit('player-jump');
      this.jumpTouchBtn?.setScale(0.92);
    });

    this.jumpTouchBtn.on('pointerup', () => {
      this.jumpTouchBtn?.setScale(1.0);
    });

    this.jumpTouchBtn.on('pointerout', () => {
      this.jumpTouchBtn?.setScale(1.0);
    });

    this.add(this.jumpTouchBtn);
  }

  private createExitButton(scene: Phaser.Scene, x: number, y: number) {
    const w = 130;
    const h = 34;

    const bg = scene.add.graphics();
    bg.fillStyle(0x131f33, 0.92);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, 0x273b57, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    const txt = scene.add.text(0, 0, '🏠 MENU / EXIT', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#e2e8f0',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const exitBtn = scene.add.container(x, y, [bg, txt]);
    exitBtn.setSize(w, h);
    exitBtn.setInteractive({ useHandCursor: true });

    exitBtn.on('pointerdown', () => {
      exitBtn.setScale(0.95);
      this.scene.events.emit('exit-to-menu');
    });

    exitBtn.on('pointerup', () => {
      exitBtn.setScale(1.0);
    });

    exitBtn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x7a1f1f, 0.95);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, 0xe53e3e, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      txt.setColor('#ffffff');
      exitBtn.setScale(1.03);
    });

    exitBtn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x131f33, 0.92);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, 0x273b57, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      txt.setColor('#e2e8f0');
      exitBtn.setScale(1.0);
    });

    this.add(exitBtn);
  }

  public updateValues() {
    this.votesText.setText(this.scoreManager.votes.toString());
    this.trustText.setText(`${Math.round(this.scoreManager.trust)}%`);

    // Color code trust
    if (this.scoreManager.trust >= 60) {
      this.trustText.setColor('#44dd66');
    } else if (this.scoreManager.trust >= 40) {
      this.trustText.setColor('#fcb813');
    } else {
      this.trustText.setColor('#ff4444');
    }

    // Format timer
    const remaining = Math.max(0, Math.floor(this.scoreManager.totalTimeRemaining));
    const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
    const secs = (remaining % 60).toString().padStart(2, '0');
    this.timerText.setText(`${mins}:${secs}`);

    // Update street progress track
    const current = this.scoreManager.currentStreetIndex;
    this.streetLabelText.setText(`STREET ${current} OF ${this.scoreManager.totalStreets}`);

    const trackWidth = 320;
    const cx = this.scene.scale.width / 2;
    const startX = cx - trackWidth / 2;
    const step = trackWidth / (this.scoreManager.totalStreets - 1);

    this.streetProgressLine.clear();
    // Background track
    this.streetProgressLine.lineStyle(4, 0x3d4a5c, 1);
    this.streetProgressLine.lineBetween(startX, 685 - 8, startX + trackWidth, 685 - 8);

    // Active progress line
    const activeLength = (current - 1) * step;
    if (activeLength > 0) {
      this.streetProgressLine.lineStyle(4, 0x27ae60, 1);
      this.streetProgressLine.lineBetween(startX, 685 - 8, startX + activeLength, 685 - 8);
    }

    this.streetProgressNodes.forEach((node, idx) => {
      const streetNum = idx + 1;
      if (streetNum < current) {
        // Completed street: solid green
        node.setFillStyle(0x27ae60, 1);
        node.setScale(1.0);
      } else if (streetNum === current) {
        // Active street: glowing bright green
        node.setFillStyle(0x2ecc71, 1);
        node.setScale(1.35);
      } else {
        // Upcoming: dark grey
        node.setFillStyle(0x5a6e85, 1);
        node.setScale(1.0);
      }
    });
  }
}
