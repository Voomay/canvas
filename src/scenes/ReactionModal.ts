import Phaser from 'phaser';
import { DialogueOutcome } from '../systems/DialogueSystem';
import { SoundFX } from '../systems/SoundFX';

export class ReactionModal extends Phaser.GameObjects.Container {
  private soundFX: SoundFX;

  constructor(
    scene: Phaser.Scene,
    outcome: DialogueOutcome,
    onComplete: () => void
  ) {
    super(scene, 0, 0);
    this.soundFX = SoundFX.getInstance();
    this.setDepth(160);

    // Play appropriate sound
    if (outcome.outcome === 'positive') {
      this.soundFX.playVotePositive();
    } else if (outcome.outcome === 'doubtful') {
      this.soundFX.playVoteDoubtful();
    } else {
      this.soundFX.playVoteNegative();
    }

    const cx = scene.scale.width / 2;
    const isPortrait = scene.scale.height > scene.scale.width;
    const height = scene.scale.height;

    const skyCenterY = isPortrait 
      ? Math.round(100 + (height - 380 - 100) / 2) 
      : Math.round(height * 0.42);

    const bubbleX = isPortrait ? cx : cx + 70;
    const bubbleY = isPortrait ? skyCenterY + 10 : 220;
    const statsX = isPortrait ? cx : cx - 220;
    const statsY = isPortrait ? bubbleY - 95 : 300;

    // 1. Reaction speech bubble
    const reactionBubble = this.createReactionBubble(scene, bubbleX, bubbleY, outcome.reactionText, outcome.outcome);
    this.add(reactionBubble);

    // 2. Floating stats notification
    const statsPopup = this.createStatsPopup(scene, statsX, statsY, outcome);
    this.add(statsPopup);

    scene.add.existing(this);

    // Click anywhere to fast forward
    const clickZone = scene.add.zone(cx, scene.scale.height / 2, scene.scale.width, scene.scale.height).setInteractive();
    clickZone.once('pointerdown', () => {
      clickZone.destroy();
      this.destroy();
      onComplete();
    });

    // Auto complete after 2 seconds
    scene.time.delayedCall(2000, () => {
      if (clickZone.active) {
        clickZone.destroy();
        this.destroy();
        onComplete();
      }
    });
  }

  private createReactionBubble(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    outcome: 'positive' | 'doubtful' | 'negative'
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const isPortrait = scene.scale.height > scene.scale.width;
    const bubbleW = Math.min(410, scene.scale.width - 24);
    const bubbleH = 95;

    let strokeColor = 0x27ae60;
    let emoji = '👍';
    if (outcome === 'doubtful') {
      strokeColor = 0xe67e22;
      emoji = '🤔';
    } else if (outcome === 'negative') {
      strokeColor = 0xe74c3c;
      emoji = '🤦';
    }

    const bg = scene.add.graphics();
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 18);
    bg.lineStyle(4, strokeColor, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 18);

    // Tail pointing directly to resident on sidewalk
    const tailX = isPortrait ? 55 : -30;
    const tailTipX = isPortrait ? 75 : -50;
    const tailW = 20;

    bg.fillStyle(0xffffff, 1);
    bg.beginPath();
    bg.moveTo(tailX, bubbleH / 2 - 2);
    bg.lineTo(tailTipX, bubbleH / 2 + 20);
    bg.lineTo(tailX + tailW, bubbleH / 2 - 2);
    bg.closePath();
    bg.fill();

    bg.lineStyle(4, strokeColor, 1);
    bg.beginPath();
    bg.moveTo(tailX, bubbleH / 2 - 2);
    bg.lineTo(tailTipX, bubbleH / 2 + 20);
    bg.lineTo(tailX + tailW, bubbleH / 2 - 2);
    bg.stroke();

    bg.fillStyle(0xffffff, 1);
    bg.fillRect(tailX + 2, bubbleH / 2 - 4, tailW - 4, 4);

    const emojiText = scene.add.text(-bubbleW / 2 + 35, 0, emoji, {
      fontSize: '32px'
    }).setOrigin(0.5, 0.5);

    const label = scene.add.text(20, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#111111',
      fontStyle: 'bold',
      align: 'left',
      wordWrap: { width: bubbleW - 100 }
    }).setOrigin(0.5, 0.5);

    container.add([bg, emojiText, label]);

    container.setScale(0.8);
    scene.tweens.add({
      targets: container,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 200,
      ease: 'Back.easeOut'
    });

    return container;
  }

  private createStatsPopup(
    scene: Phaser.Scene,
    x: number,
    y: number,
    outcome: DialogueOutcome
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(0x0c1524, 0.95);
    bg.fillRoundedRect(-125, -35, 250, 70, 14);
    bg.lineStyle(3, 0xfcb813, 1);
    bg.strokeRoundedRect(-125, -35, 250, 70, 14);

    const voteText = outcome.voteGained > 0
      ? (outcome.voteGained > 1 ? `+${outcome.voteGained} VOTES! 🗳️🎉` : `+${outcome.voteGained} VOTE! 🗳️`)
      : (outcome.responseType === 'lie' ? 'CAUGHT LYING! 🤥 0 VOTES' : 'NO VOTE ❌');
    const voteColor = outcome.voteGained > 0 ? '#44dd66' : '#ff7777';

    const vLabel = scene.add.text(0, -12, voteText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: outcome.voteGained > 1 ? '17px' : '18px',
      color: voteColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const trustPrefix = outcome.trustChange >= 0 ? '+' : '';
    const trustColor = outcome.trustChange >= 0 ? '#55dd88' : '#ff5555';
    const timeBonusText = outcome.voteGained > 0 ? ' • +5s ⏱️' : '';
    const tLabel = scene.add.text(0, 14, `Trust: ${trustPrefix}${outcome.trustChange}%${timeBonusText}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: trustColor,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    container.add([bg, vLabel, tLabel]);

    // Floating upward tween
    scene.tweens.add({
      targets: container,
      y: y - 45,
      duration: 1200,
      ease: 'Sine.easeOut'
    });

    return container;
  }
}
