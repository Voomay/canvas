import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';

export class HUD extends Phaser.GameObjects.Container {
  private votesText!: Phaser.GameObjects.Text;
  private goalSubtitleText!: Phaser.GameObjects.Text;
  private newResidentTab?: Phaser.GameObjects.Container;
  private timerText!: Phaser.GameObjects.Text;
  private trustText!: Phaser.GameObjects.Text;
  private trustSubText!: Phaser.GameObjects.Text;
  private streetProgressNodes: (Phaser.GameObjects.Arc | Phaser.GameObjects.Text)[] = [];
  private streetProgressLine: Phaser.GameObjects.Graphics;
  private streetLabelText!: Phaser.GameObjects.Text;
  private jumpTouchBtn?: Phaser.GameObjects.Container;
  private scoreManager: ScoreManager;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.scoreManager = ScoreManager.getInstance();
    this.setDepth(100);

    const width = scene.scale.width;
    const height = scene.scale.height;
    const isPortrait = height > width;

    // 1. Top Left Badge: WARD VOTES (Matching sample screenshot)
    const votesX = isPortrait ? 76 : 95;
    const votesY = isPortrait ? 52 : 60;
    this.createVotesBadge(scene, votesX, votesY, isPortrait);

    // 2. Top Center: CAMPAIGN TRAIL Title & 00:20 Pill Timer
    const centerX = width / 2;
    const centerY = isPortrait ? 44 : 50;
    this.createCenterTitleAndTimer(scene, centerX, centerY, isPortrait);

    // 3. Top Right Badge: TRUST (Matching sample screenshot)
    const trustX = isPortrait ? width - 76 : width - 95;
    const trustY = isPortrait ? 52 : 60;
    this.createTrustBadge(scene, trustX, trustY, isPortrait);

    // 4. Street Progress Track (Bottom Center on sandy verge)
    this.streetProgressLine = scene.add.graphics();
    this.add(this.streetProgressLine);
    const trackY = isPortrait ? height - 32 : height - 35;
    this.createStreetProgressBar(scene, width / 2, trackY, isPortrait);

    // 5. Mobile Jump Button (Bottom Right)
    const jumpX = isPortrait ? width - 64 : width - 80;
    const jumpY = isPortrait ? height - 120 : height - 110;
    this.createMobileJumpButton(scene, jumpX, jumpY, isPortrait);

    // 6. Utility Controls (Menu & Fullscreen)
    this.createUtilityButtons(scene, width, isPortrait);

    scene.add.existing(this);
    this.updateValues();
  }

  private createVotesBadge(scene: Phaser.Scene, x: number, y: number, isPortrait: boolean) {
    const bg = scene.add.graphics();
    const w = isPortrait ? 134 : 158;
    const h = isPortrait ? 72 : 76;

    bg.fillStyle(0x0c1524, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2.5, 0x1f3c6e, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const title = scene.add.text(0, -20, 'WARD VOTES', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '12px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.votesText = scene.add.text(0, 0, '0/10', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '24px' : '26px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.goalSubtitleText = scene.add.text(0, 20, '10 votes needed', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '10px' : '11px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Attached Tab Below: "📣 NEW RESIDENT!"
    const tabBg = scene.add.graphics();
    const tabW = w - 10;
    const tabH = 22;
    const tabY = h / 2 + tabH / 2 + 3;

    tabBg.fillStyle(0x0c1524, 0.95);
    tabBg.fillRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 6);
    tabBg.lineStyle(2, 0x1f3c6e, 1);
    tabBg.strokeRoundedRect(-tabW / 2, -tabH / 2, tabW, tabH, 6);

    const tabTxt = scene.add.text(0, 0, '📣 NEW RESIDENT!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '9px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.newResidentTab = scene.add.container(0, tabY, [tabBg, tabTxt]);

    const badgeContainer = scene.add.container(x, y, [bg, title, this.votesText, this.goalSubtitleText, this.newResidentTab]);
    this.add(badgeContainer);
  }

  private createCenterTitleAndTimer(scene: Phaser.Scene, x: number, y: number, isPortrait: boolean) {
    const title = scene.add.text(0, -14, 'CANVASSING SA', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '18px' : '24px',
      color: '#ffffff',
      fontStyle: '900',
      stroke: '#0c1524',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    // Rounded Pill Timer (matching sample screenshot 00:20)
    const pillBg = scene.add.graphics();
    const pillW = isPortrait ? 96 : 110;
    const pillH = isPortrait ? 30 : 34;

    pillBg.fillStyle(0x0c1524, 0.96);
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 10);
    pillBg.lineStyle(2, 0x1f3c6e, 1);
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 10);

    this.timerText = scene.add.text(0, 0, '00:20', {
      fontFamily: 'Outfit, monospace',
      fontSize: isPortrait ? '19px' : '22px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const pillContainer = scene.add.container(0, 16, [pillBg, this.timerText]);
    const centerContainer = scene.add.container(x, y, [title, pillContainer]);
    this.add(centerContainer);
  }

  private createTrustBadge(scene: Phaser.Scene, x: number, y: number, isPortrait: boolean) {
    const bg = scene.add.graphics();
    const w = isPortrait ? 134 : 150;
    const h = isPortrait ? 72 : 76;

    bg.fillStyle(0x0c1524, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2.5, 0x1f3c6e, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const title = scene.add.text(0, -20, 'TRUST', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '13px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.trustText = scene.add.text(0, 0, '50%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '26px' : '30px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.trustSubText = scene.add.text(0, 20, '👥 MEET & EARN TRUST', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '8.5px' : '10px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const badgeContainer = scene.add.container(x, y, [bg, title, this.trustText, this.trustSubText]);
    this.add(badgeContainer);
  }

  private createStreetProgressBar(scene: Phaser.Scene, cx: number, cy: number, isPortrait: boolean) {
    const totalStreets = 5;
    const trackWidth = isPortrait ? 220 : 320;
    const startX = cx - trackWidth / 2;
    const step = trackWidth / (totalStreets - 1);

    this.streetProgressNodes = [];

    for (let i = 0; i < totalStreets; i++) {
      const nodeX = startX + i * step;

      if (i === totalStreets - 1) {
        // Star icon for the final goal
        const star = scene.add.text(nodeX, cy - 8, '⭐', {
          fontSize: isPortrait ? '17px' : '19px'
        }).setOrigin(0.5, 0.5);
        this.streetProgressNodes.push(star);
        this.add(star);
      } else {
        const node = scene.add.circle(nodeX, cy - 8, isPortrait ? 6 : 7, 0x5a6e85);
        node.setStrokeStyle(2, 0x111111);
        this.streetProgressNodes.push(node);
        this.add(node);
      }
    }

    this.streetLabelText = scene.add.text(cx, cy + 12, 'AREA 1 OF 5', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '13px',
      color: '#ffffff',
      fontStyle: '900',
      stroke: '#0c1524',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.add(this.streetLabelText);
  }

  private createMobileJumpButton(scene: Phaser.Scene, x: number, y: number, isPortrait: boolean) {
    const btnW = isPortrait ? 96 : 108;
    const btnH = isPortrait ? 52 : 56;
    const bg = scene.add.graphics();

    // Prominent Blue Rounded Pill Button for SPRINT / RUN FASTER
    bg.fillStyle(0x0f5ba6, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    bg.lineStyle(3, 0xffea77, 1);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);

    const txt = scene.add.text(0, -6, 'RUN', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '13px' : '14px',
      color: '#ffffff',
      fontStyle: '900',
      stroke: '#081d38',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const subTxt = scene.add.text(0, 10, 'FASTER ⚡', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '12px',
      color: '#ffea77',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.jumpTouchBtn = scene.add.container(x, y, [bg, txt, subTxt]);
    this.jumpTouchBtn.setSize(btnW, btnH);
    this.jumpTouchBtn.setInteractive({ useHandCursor: true });

    this.jumpTouchBtn.on('pointerdown', () => {
      this.scene.events.emit('sprint-start');
      this.jumpTouchBtn?.setScale(0.92);
    });

    this.jumpTouchBtn.on('pointerup', () => {
      this.scene.events.emit('sprint-end');
      this.jumpTouchBtn?.setScale(1.0);
    });

    this.jumpTouchBtn.on('pointerout', () => {
      this.scene.events.emit('sprint-end');
      this.jumpTouchBtn?.setScale(1.0);
    });

    this.add(this.jumpTouchBtn);
  }

  private createUtilityButtons(scene: Phaser.Scene, width: number, isPortrait: boolean) {
    // Menu / Exit Button
    const exitBtn = scene.add.container(isPortrait ? 42 : 55, isPortrait ? 18 : 22);
    const exitBg = scene.add.graphics();
    exitBg.fillStyle(0x0c1524, 0.92);
    exitBg.fillRoundedRect(-32, -12, 64, 24, 6);
    exitBg.lineStyle(1.5, 0x1f3c6e, 1);
    exitBg.strokeRoundedRect(-32, -12, 64, 24, 6);

    const exitTxt = scene.add.text(0, 0, '🏠 MENU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      color: '#cbd5e1',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    exitBtn.add([exitBg, exitTxt]);
    exitBtn.setSize(64, 24);
    exitBtn.setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => this.scene.events.emit('exit-to-menu'));
    this.add(exitBtn);

    // Fullscreen Toggle Button (Top Right)
    const fsBtn = scene.add.container(width - (isPortrait ? 30 : 45), isPortrait ? 18 : 22);
    const fsBg = scene.add.graphics();
    fsBg.fillStyle(0x0c1524, 0.92);
    fsBg.fillRoundedRect(-18, -12, 36, 24, 6);
    fsBg.lineStyle(1.5, 0x1f3c6e, 1);
    fsBg.strokeRoundedRect(-18, -12, 36, 24, 6);

    const fsTxt = scene.add.text(0, 0, '⛶', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#fcb813',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    fsBtn.add([fsBg, fsTxt]);
    fsBtn.setSize(36, 24);
    fsBtn.setInteractive({ useHandCursor: true });
    fsBtn.on('pointerdown', () => {
      if (scene.scale.isFullscreen) {
        scene.scale.stopFullscreen();
      } else {
        scene.scale.startFullscreen();
      }
    });
    this.add(fsBtn);
  }

  public setResidentAlertVisible(visible: boolean) {
    if (this.newResidentTab) {
      this.newResidentTab.setVisible(visible);
    }
  }

  public updateValues() {
    const votes = this.scoreManager.votes;
    this.votesText.setText(`${votes}/10`);
    if (votes >= 10) {
      this.votesText.setColor('#44dd66');
      this.goalSubtitleText.setText('Ward target won! 🏆');
      this.goalSubtitleText.setColor('#44dd66');
    } else {
      this.votesText.setColor('#fcb813');
      const needed = 10 - votes;
      this.goalSubtitleText.setText(`${needed} votes needed`);
      this.goalSubtitleText.setColor('#94a3b8');
    }

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

    if (remaining <= 8) {
      this.timerText.setColor('#ff4444');
    } else {
      this.timerText.setColor('#ffffff');
    }

    // Update area progress track
    const current = this.scoreManager.currentStreetIndex;
    this.streetLabelText.setText(`AREA ${current} OF ${this.scoreManager.totalStreets}`);

    const isPortrait = this.scene.scale.height > this.scene.scale.width;
    const trackWidth = isPortrait ? 220 : 320;
    const cx = this.scene.scale.width / 2;
    const trackY = isPortrait ? this.scene.scale.height - 32 : this.scene.scale.height - 35;
    const startX = cx - trackWidth / 2;
    const step = trackWidth / (this.scoreManager.totalStreets - 1);

    this.streetProgressLine.clear();
    // Background track
    this.streetProgressLine.lineStyle(4, 0x3d4a5c, 1);
    this.streetProgressLine.lineBetween(startX, trackY - 8, startX + trackWidth, trackY - 8);

    // Active progress line
    const activeLength = (current - 1) * step;
    if (activeLength > 0) {
      this.streetProgressLine.lineStyle(4, 0x27ae60, 1);
      this.streetProgressLine.lineBetween(startX, trackY - 8, startX + activeLength, trackY - 8);
    }

    this.streetProgressNodes.forEach((node, idx) => {
      const streetNum = idx + 1;
      if (node instanceof Phaser.GameObjects.Arc) {
        if (streetNum < current) {
          node.setFillStyle(0x27ae60, 1);
          node.setScale(1.0);
        } else if (streetNum === current) {
          node.setFillStyle(0x2ecc71, 1);
          node.setScale(1.3);
        } else {
          node.setFillStyle(0x5a6e85, 1);
          node.setScale(1.0);
        }
      } else if (node instanceof Phaser.GameObjects.Text) {
        if (streetNum <= current) {
          node.setScale(1.25);
        } else {
          node.setScale(1.0);
        }
      }
    });
  }
}
