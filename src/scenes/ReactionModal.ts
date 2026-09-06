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

    const isPortrait = scene.scale.height > scene.scale.width;

    if (isPortrait) {
      // ═══════ MOBILE: Bottom slide-up result card ═══════
      this.createMobileResultCard(scene, outcome, onComplete);
    } else {
      // ═══════ DESKTOP: Existing layout (unchanged) ═══════
      this.createDesktopLayout(scene, outcome, onComplete);
    }

    scene.add.existing(this);
  }

  // ═══════ MOBILE RESULT CARD ═══════
  private createMobileResultCard(
    scene: Phaser.Scene,
    outcome: DialogueOutcome,
    onComplete: () => void
  ) {
    const { width, height } = scene.scale;

    // Determine outcome visuals
    let headerText = '';
    let headerEmoji = '';
    let headerBgColor = 0x16a34a;
    let borderColor = 0x4ade80;

    if (outcome.outcome === 'positive') {
      headerText = 'GOOD CHOICE!';
      headerEmoji = '✓';
      headerBgColor = 0x16a34a;
      borderColor = 0x4ade80;
    } else if (outcome.outcome === 'doubtful') {
      headerText = 'DOUBTFUL...';
      headerEmoji = '🤔';
      headerBgColor = 0x92400e;
      borderColor = 0xf59e0b;
    } else {
      headerText = 'BAD MOVE!';
      headerEmoji = '✗';
      headerBgColor = 0x7f1d1d;
      borderColor = 0xef4444;
    }

    // Bottom-anchored result card: slides up from bottom where answers were, thumb-friendly
    const cardW = Math.min(width - 16, 480);
    const cardH = 308;
    const cardFinalY = height - cardH / 2 - 12;
    const cardStartY = height + cardH;

    const card = scene.add.container(width / 2, cardStartY);
    card.setDepth(165);

    // Card background with shadow
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.45);
    bg.fillRoundedRect(-cardW / 2 + 3, -cardH / 2 + 5, cardW, cardH, 20);
    bg.fillStyle(0x0c1524, 0.98);
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    bg.lineStyle(2.5, borderColor, 1);
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
    card.add(bg);

    // Outcome header badge
    const badgeW = 236;
    const badgeH = 42;
    const badgeY = -cardH / 2 + 34;
    const badgeBg = scene.add.graphics();
    badgeBg.fillStyle(headerBgColor, 1);
    badgeBg.fillRoundedRect(-badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 14);
    card.add(badgeBg);

    const badgeTxt = scene.add.text(0, badgeY, `${headerEmoji}  ${headerText}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    card.add(badgeTxt);

    // Reaction text from resident (enlarged for crisp mobile readability)
    const reactionY = badgeY + 56;
    const reactionTxt = scene.add.text(0, reactionY, outcome.reactionText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: outcome.reactionText.length > 60 ? '16.5px' : '18.5px',
      color: '#ffffff',
      fontStyle: '700',
      align: 'center',
      wordWrap: { width: cardW - 36 },
      lineSpacing: 4
    }).setOrigin(0.5, 0.5);
    card.add(reactionTxt);

    // Stats section
    const statsY = reactionY + 62;

    // Vote result
    const voteText = outcome.voteGained > 0
      ? (outcome.voteGained > 1 ? `+${outcome.voteGained} VOTES 🗳️` : `+${outcome.voteGained} VOTE 🗳️`)
      : (outcome.responseType === 'lie' ? 'CAUGHT LYING! 🤥' : 'NO VOTE ❌');
    const voteColor = outcome.voteGained > 0 ? '#44dd66' : '#ff7777';

    const voteLbl = scene.add.text(-68, statsY, voteText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: voteColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);
    card.add(voteLbl);

    // Trust change
    const trustPrefix = outcome.trustChange >= 0 ? '+' : '';
    const trustColor = outcome.trustChange >= 0 ? '#55dd88' : '#ff5555';

    const trustLbl = scene.add.text(72, statsY, `${trustPrefix}${outcome.trustChange}% TRUST`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: trustColor,
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);
    card.add(trustLbl);

    // Mental health change
    if (outcome.mentalHealthChange !== 0) {
      const mhY = statsY + 26;
      const mhText = outcome.mentalHealthReason || `Morale: ${outcome.mentalHealthChange > 0 ? '+' : ''}${outcome.mentalHealthChange}%`;
      const mhColor = outcome.mentalHealthChange > 0 ? '#44dd66' : '#ff5555';

      const mhLbl = scene.add.text(0, mhY, mhText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13.5px',
        color: mhColor,
        fontStyle: '800'
      }).setOrigin(0.5, 0.5);
      card.add(mhLbl);
    }

    // CONTINUE button (Thumb-friendly bottom position)
    const continueBtnW = cardW - 32;
    const continueBtnH = 58;
    const continueBtnY = cardH / 2 - continueBtnH / 2 - 16;

    const continueBg = scene.add.graphics();
    continueBg.fillStyle(headerBgColor, 1);
    continueBg.fillRoundedRect(-continueBtnW / 2, continueBtnY - continueBtnH / 2, continueBtnW, continueBtnH, 16);
    continueBg.lineStyle(2.5, borderColor, 1);
    continueBg.strokeRoundedRect(-continueBtnW / 2, continueBtnY - continueBtnH / 2, continueBtnW, continueBtnH, 16);
    card.add(continueBg);

    const continueTxt = scene.add.text(0, continueBtnY, 'CONTINUE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '21px',
      color: '#ffffff',
      fontStyle: '900',
      letterSpacing: 0.5
    }).setOrigin(0.5, 0.5);
    card.add(continueTxt);

    const continueZone = scene.add.zone(0, continueBtnY, continueBtnW, continueBtnH).setInteractive({ useHandCursor: true });
    card.add(continueZone);

    // Background tap zone for easy dismissing anywhere on card
    const cardHitZone = scene.add.zone(0, 0, cardW, cardH).setInteractive({ useHandCursor: true });
    card.add(cardHitZone);
    card.sendToBack(cardHitZone);
    card.sendToBack(bg);

    let hasCompleted = false;
    const doComplete = () => {
      if (hasCompleted) return;
      hasCompleted = true;

      // Slide card down off-screen to dismiss
      scene.tweens.add({
        targets: card,
        y: height + cardH,
        duration: 200,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          card.destroy();
          this.destroy();
          onComplete();
        }
      });
    };

    continueZone.on('pointerdown', doComplete);
    cardHitZone.on('pointerdown', doComplete);

    // Auto complete after 4.5 seconds
    scene.time.delayedCall(4500, () => {
      doComplete();
    });

    // Slide-up entrance animation from bottom
    scene.tweens.add({
      targets: card,
      y: cardFinalY,
      duration: 280,
      ease: 'Cubic.easeOut'
    });

    this.add(card);
  }

  // ═══════ DESKTOP LAYOUT (unchanged) ═══════
  private createDesktopLayout(
    scene: Phaser.Scene,
    outcome: DialogueOutcome,
    onComplete: () => void
  ) {
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
    let emoji = '\ud83d\udc4d';
    if (outcome === 'doubtful') {
      strokeColor = 0xe67e22;
      emoji = '\ud83e\udd14';
    } else if (outcome === 'negative') {
      strokeColor = 0xe74c3c;
      emoji = '\ud83e\udd26';
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
    bg.fillStyle(0x0c1524, 0.96);
    bg.fillRoundedRect(-135, -46, 270, 92, 14);
    bg.lineStyle(3, 0xfcb813, 1);
    bg.strokeRoundedRect(-135, -46, 270, 92, 14);

    const voteText = outcome.voteGained > 0
      ? (outcome.voteGained > 1 ? `+${outcome.voteGained} VOTES! \ud83d\uddf3\ufe0f\ud83c\udf89` : `+${outcome.voteGained} VOTE! \ud83d\uddf3\ufe0f`)
      : (outcome.responseType === 'lie' ? 'CAUGHT LYING! \ud83e\udd25 0 VOTES' : 'NO VOTE \u274c');
    const voteColor = outcome.voteGained > 0 ? '#44dd66' : '#ff7777';

    const vLabel = scene.add.text(0, -23, voteText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: outcome.voteGained > 1 ? '16px' : '17px',
      color: voteColor,
      fontStyle: '900'
    }).setOrigin(0.5, 0.5);

    const trustPrefix = outcome.trustChange >= 0 ? '+' : '';
    const trustColor = outcome.trustChange >= 0 ? '#55dd88' : '#ff5555';
    const timeBonusText = outcome.voteGained > 0 ? ' \u2022 +5s \u23f1\ufe0f' : '';
    const tLabel = scene.add.text(0, 0, `Trust: ${trustPrefix}${outcome.trustChange}%${timeBonusText}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: trustColor,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const mhChange = outcome.mentalHealthChange;
    const mhPrefix = mhChange > 0 ? '+' : '';
    const mhColor = mhChange > 0 ? '#44dd66' : (mhChange < 0 ? '#ff5555' : '#cbd5e1');
    const mhEmoji = mhChange > 0 ? '\u2764\ufe0f' : (mhChange < 0 ? '\ud83d\udc94' : '\ud83e\udde0');
    const mhText = outcome.mentalHealthReason 
      ? outcome.mentalHealthReason 
      : `${mhEmoji} Morale: ${mhPrefix}${mhChange}%`;

    const mhLabel = scene.add.text(0, 24, mhText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12.5px',
      color: mhColor,
      fontStyle: '800'
    }).setOrigin(0.5, 0.5);

    container.add([bg, vLabel, tLabel, mhLabel]);

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
