import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { STREETS } from '../data/streets';
import { SoundFX } from '../systems/SoundFX';

export class HUD extends Phaser.GameObjects.Container {
  private votesText!: Phaser.GameObjects.Text;
  private goalSubtitleText!: Phaser.GameObjects.Text;
  private newResidentTab?: Phaser.GameObjects.Container;
  private timerText!: Phaser.GameObjects.Text;
  private trustText!: Phaser.GameObjects.Text;
  private trustSubText!: Phaser.GameObjects.Text;
  private mentalHealthContainer!: Phaser.GameObjects.Container;
  private mentalHealthText!: Phaser.GameObjects.Text;
  private mentalHealthBar!: Phaser.GameObjects.Graphics;
  private streetProgressNodes: (Phaser.GameObjects.Arc | Phaser.GameObjects.Text)[] = [];
  private streetProgressLine: Phaser.GameObjects.Graphics;
  private streetLabelText!: Phaser.GameObjects.Text;
  private scoreManager: ScoreManager;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.scoreManager = ScoreManager.getInstance();
    this.setDepth(100);

    const width = scene.scale.width;
    const height = scene.scale.height;
    const isPortrait = height > width;

    // 1. Top Left Badge: WARD VOTES (Positioned with generous vertical clearance below utility buttons)
    const votesX = isPortrait ? 76 : 95;
    const votesY = isPortrait ? 90 : 82;
    this.createVotesBadge(scene, votesX, votesY, isPortrait);

    // 2. Top Center: 00:20 Pill Timer & Mental Health Morale Meter
    const centerX = width / 2;
    const centerY = isPortrait ? 84 : 76;
    this.createCenterTitleAndTimer(scene, centerX, centerY, isPortrait);
    this.createMentalHealthBadge(scene, centerX, centerY + (isPortrait ? 36 : 38), isPortrait);

    // 3. Top Right Badge: TRUST
    const trustX = isPortrait ? width - 76 : width - 95;
    const trustY = isPortrait ? 90 : 82;
    this.createTrustBadge(scene, trustX, trustY, isPortrait);

    // 4. Street Progress Track (Bottom Center on sandy verge)
    this.streetProgressLine = scene.add.graphics();
    this.add(this.streetProgressLine);
    const trackY = isPortrait ? height - 32 : height - 35;
    this.createStreetProgressBar(scene, width / 2, trackY, isPortrait);

    // 5. Utility Controls (Menu only, fullscreen removed)
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
      fontSize: isPortrait ? '12px' : '13px',
      color: '#fcb813',
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    const currentStreet = STREETS[this.scoreManager.currentStreetIndex - 1] || STREETS[0];
    const targetVotes = currentStreet.targetVotes || 10;

    this.votesText = scene.add.text(0, 0, `0/${targetVotes}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '26px' : '28px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.goalSubtitleText = scene.add.text(0, 20, `${targetVotes} votes needed`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '11px' : '12px',
      color: '#cbd5e1',
      fontStyle: '700'
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
      fontSize: '10.5px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.newResidentTab = scene.add.container(0, tabY, [tabBg, tabTxt]);

    const badgeContainer = scene.add.container(x, y, [bg, title, this.votesText, this.goalSubtitleText, this.newResidentTab]);
    this.add(badgeContainer);
  }

  private createCenterTitleAndTimer(scene: Phaser.Scene, x: number, y: number, isPortrait: boolean) {
    // Rounded Pill Timer
    const pillBg = scene.add.graphics();
    const pillW = isPortrait ? 108 : 120;
    const pillH = isPortrait ? 34 : 38;

    pillBg.fillStyle(0x0c1524, 0.96);
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 12);
    pillBg.lineStyle(2.5, 0x1f3c6e, 1);
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 12);

    this.timerText = scene.add.text(0, 0, '00:20', {
      fontFamily: 'Outfit, monospace',
      fontSize: isPortrait ? '19px' : '22px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const centerContainer = scene.add.container(x, y, [pillBg, this.timerText]);
    this.add(centerContainer);
  }

  private createMentalHealthBadge(scene: Phaser.Scene, x: number, y: number, isPortrait: boolean) {
    const pillW = isPortrait ? 122 : 138;
    const pillH = isPortrait ? 24 : 26;

    const bg = scene.add.graphics();
    bg.fillStyle(0x0c1524, 0.95);
    bg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 8);
    bg.lineStyle(1.8, 0x1f3c6e, 1);
    bg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 8);

    this.mentalHealthText = scene.add.text(0, -2, '🧠 100% Energized', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '10px' : '11px',
      color: '#44dd66',
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    this.mentalHealthBar = scene.add.graphics();

    this.mentalHealthContainer = scene.add.container(x, y, [bg, this.mentalHealthText, this.mentalHealthBar]);
    this.add(this.mentalHealthContainer);
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
      fontSize: isPortrait ? '12px' : '13px',
      color: '#fcb813',
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    this.trustText = scene.add.text(0, 0, '50%', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '26px' : '30px',
      color: '#fcb813',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    this.trustSubText = scene.add.text(0, 20, '👥 MEET & EARN TRUST', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '9.5px' : '11px',
      color: '#cbd5e1',
      fontStyle: '700'
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

  private createUtilityButtons(scene: Phaser.Scene, _width: number, isPortrait: boolean) {
    const btnY = 20;
    const btnW = isPortrait ? 58 : 62;
    const btnH = 24;
    const startX = isPortrait ? 38 : 44;
    const stepX = isPortrait ? 64 : 68;

    // Helper to style utility button
    const createPill = (x: number, label: string, color: string = '#cbd5e1') => {
      const container = scene.add.container(x, btnY);
      const bg = scene.add.graphics();
      bg.fillStyle(0x0c1524, 0.94);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(1.5, 0x1f3c6e, 1);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

      const txt = scene.add.text(0, 0, label, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: isPortrait ? '9.5px' : '10px',
        color: color,
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      container.add([bg, txt]);
      const hitPad = 8;
      container.setSize(btnW, btnH);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-hitPad, -hitPad, btnW + hitPad * 2, btnH + hitPad * 2),
        Phaser.Geom.Rectangle.Contains
      );

      // Subtle hover micro-animation
      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x1a2e4c, 0.96);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1.5, 0x3b82f6, 1);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      });
      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x0c1524, 0.94);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1.5, 0x1f3c6e, 1);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      });

      return { container, bg, txt };
    };

    // 1. Menu / Exit Button
    const menuPill = createPill(startX, '🏠 MENU', '#cbd5e1');
    menuPill.container.on('pointerdown', () => {
      this.scene.events.emit('exit-to-menu');
      scene.tweens.add({
        targets: menuPill.container,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });
    this.add(menuPill.container);

    // 2. Pause Button
    const pausePill = createPill(startX + stepX, '⏸️ PAUSE', '#fcb813');
    pausePill.container.on('pointerdown', () => {
      this.scene.events.emit('pause-game');
      scene.tweens.add({
        targets: pausePill.container,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });
    this.add(pausePill.container);

    // 3. Music Toggle Button
    const soundFX = SoundFX.getInstance();
    const isMusicMuted = soundFX.isMusicMutedState();
    const musicPill = createPill(
      startX + stepX * 2,
      isMusicMuted ? '🔇 MUTE' : '🎵 MUSIC',
      isMusicMuted ? '#94a3b8' : '#38bdf8'
    );
    musicPill.container.on('pointerdown', () => {
      const muted = soundFX.toggleMusicMute();
      musicPill.txt.setText(muted ? '🔇 MUTE' : '🎵 MUSIC');
      musicPill.txt.setColor(muted ? '#94a3b8' : '#38bdf8');
      scene.tweens.add({
        targets: musicPill.container,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });
    this.add(musicPill.container);
  }

  public setResidentAlertVisible(visible: boolean) {
    if (this.newResidentTab) {
      this.newResidentTab.setVisible(visible);
    }
  }

  public updateValues() {
    const currentStreet = STREETS[this.scoreManager.currentStreetIndex - 1] || STREETS[0];
    const targetVotes = currentStreet.targetVotes || 10;
    const votes = this.scoreManager.votes;
    this.votesText.setText(`${votes}/${targetVotes}`);
    if (votes >= targetVotes) {
      this.votesText.setColor('#44dd66');
      this.goalSubtitleText.setText('Area target won! 🏆');
      this.goalSubtitleText.setColor('#44dd66');
    } else {
      this.votesText.setColor('#fcb813');
      const needed = targetVotes - votes;
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

    // Mental Health status & mini-bar update
    if (this.mentalHealthText && this.mentalHealthBar) {
      const status = this.scoreManager.getMentalHealthStatus();
      const mh = Math.round(this.scoreManager.mentalHealth);
      this.mentalHealthText.setText(`${status.emoji} ${mh}% ${status.label}`);
      this.mentalHealthText.setColor(status.color);

      const isPortrait = this.scene.scale.height > this.scene.scale.width;
      const barTotalW = isPortrait ? 104 : 118;
      const barFillW = Math.max(0, Math.min(barTotalW, (barTotalW * mh) / 100));
      const barY = isPortrait ? 7 : 8;

      this.mentalHealthBar.clear();
      // Track background
      this.mentalHealthBar.fillStyle(0x1a2e4c, 1);
      this.mentalHealthBar.fillRoundedRect(-barTotalW / 2, barY, barTotalW, 3, 1.5);
      // Active fill
      const fillColor = mh >= 80 ? 0x44dd66 : (mh >= 50 ? 0xfcb813 : (mh >= 25 ? 0xf97316 : 0xef4444));
      this.mentalHealthBar.fillStyle(fillColor, 1);
      this.mentalHealthBar.fillRoundedRect(-barTotalW / 2, barY, barFillW, 3, 1.5);
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

  public triggerMentalHealthFlash(change: number, reason?: string) {
    if (!this.mentalHealthContainer || !this.mentalHealthContainer.scene) return;

    // Pulse animation on the badge
    this.scene.tweens.add({
      targets: this.mentalHealthContainer,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 140,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // Floating text feedback
    const isGain = change > 0;
    const color = isGain ? '#44dd66' : '#ff5555';
    const sign = isGain ? '+' : '';
    const labelText = reason || `${sign}${change}% Morale`;

    const popup = this.scene.add.text(
      this.mentalHealthContainer.x,
      this.mentalHealthContainer.y + 24,
      labelText,
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: color,
        fontStyle: '900',
        stroke: '#080d14',
        strokeThickness: 3
      }
    ).setOrigin(0.5, 0.5).setDepth(160);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 30,
      alpha: 0,
      duration: 1100,
      ease: 'Sine.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  public triggerTimeFlash(type: 'gain' | 'loss') {
    if (!this.timerText || !this.timerText.scene) return;

    const flashColor = type === 'gain' ? '#44dd66' : '#ff4444';
    this.timerText.setColor(flashColor);

    this.scene.tweens.add({
      targets: this.timerText,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 180,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.timerText && this.timerText.scene) {
          this.timerText.setScale(1);
          this.updateValues();
        }
      }
    });
  }

  /**
   * 10-Second Low-Time Urgency Warning Alert
   * Urges the player to sprint and jump/fix potholes for +5s bonus time to reach voters!
   */
  public showLowTimeUrgencyWarning() {
    if (!this.scene) return;

    SoundFX.getInstance().playTimerWarning();

    const { width, height } = this.scene.scale;
    const isPortrait = height > width;
    const bannerW = Math.min(width - 24, 440);
    const bannerH = isPortrait ? 66 : 60;
    const bannerY = isPortrait ? 154 : 126;

    const container = this.scene.add.container(width / 2, bannerY);
    container.setDepth(155);

    // Glowing drop shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.6);
    shadow.fillRoundedRect(-bannerW / 2 + 3, -bannerH / 2 + 4, bannerW, bannerH, 14);
    container.add(shadow);

    // Alert Card Background
    const cardBg = this.scene.add.graphics();
    cardBg.fillStyle(0x0c1524, 0.96);
    cardBg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
    cardBg.lineStyle(2.5, 0xef4444, 1);
    cardBg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
    container.add(cardBg);

    // Header with warning icons
    const titleText = this.scene.add.text(0, isPortrait ? -15 : -14, '⚠️ 10 SECONDS LEFT! SPRINT! ⚠️', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '14px' : '15px',
      color: '#fcb813',
      fontStyle: '900',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);
    container.add(titleText);

    // Subtitle explaining the pothole bonus time mechanic
    const hintText = this.scene.add.text(0, isPortrait ? 13 : 12, 'Fix road potholes (+5s time) to reach more voters!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isPortrait ? '12px' : '13px',
      color: '#ffffff',
      fontStyle: '800',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);
    container.add(hintText);

    // Entrance pop tween
    container.setScale(0.85);
    container.setAlpha(0);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });

    // Urgent pulsing border
    let pulseCount = 0;
    const borderPulseTimer = this.scene.time.addEvent({
      delay: 260,
      repeat: 14,
      callback: () => {
        pulseCount++;
        const isRed = pulseCount % 2 === 1;
        cardBg.clear();
        cardBg.fillStyle(0x0c1524, 0.96);
        cardBg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
        cardBg.lineStyle(2.5, isRed ? 0xef4444 : 0xfcb813, 1);
        cardBg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 14);
        titleText.setColor(isRed ? '#ff5555' : '#fcb813');
      }
    });

    // Auto-dismiss after 4.2 seconds
    this.scene.time.delayedCall(4200, () => {
      if (borderPulseTimer) borderPulseTimer.remove();
      if (container && container.scene) {
        this.scene.tweens.add({
          targets: container,
          alpha: 0,
          y: bannerY - 20,
          duration: 350,
          ease: 'Quad.easeIn',
          onComplete: () => container.destroy()
        });
      }
    });

    // Flash timer badge in red
    this.triggerTimeFlash('loss');
  }
}
