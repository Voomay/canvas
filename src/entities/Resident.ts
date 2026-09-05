import Phaser from 'phaser';
import { PersonalityType, ALL_PERSONALITIES } from '../data/personalities';
import { ComplaintData, COMPLAINTS } from '../data/complaints';
import { SoundFX } from '../systems/SoundFX';

export class Resident extends Phaser.GameObjects.Container {
  public residentId: string;
  public personality: PersonalityType;
  public complaint: ComplaintData;
  public hasEncountered: boolean = false;
  public isApproaching: boolean = false;
  public hasIgnored: boolean = false;

  private sprite: Phaser.GameObjects.Sprite;
  private alertBadge: Phaser.GameObjects.Sprite;
  private alertTween: Phaser.Tweens.Tween | null = null;
  private angryBubbleContainer: Phaser.GameObjects.Container | null = null;
  private soundFX: SoundFX;
  private static recentComplaintIds: string[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    allowedCategories?: string[],
    partyId?: 'da' | 'anc' | 'pa',
    locationKey?: string
  ) {
    super(scene, x, y);

    let residentSpriteId: string;
    const isCampsBay = locationKey === 'campsbay' || (allowedCategories && allowedCategories.some(cat => cat.startsWith('campsbay')));
    if (isCampsBay) {
      // In Camps Bay & Clifton: spawn the stylish Atlantic Seaboard residents (13 to 17)
      residentSpriteId = Phaser.Math.Between(13, 17).toString();
    } else {
      // In other areas: spawn from general diverse pool (residents 1 to 12)
      residentSpriteId = Phaser.Math.Between(1, 12).toString();
    }
    this.residentId = residentSpriteId;
    this.soundFX = SoundFX.getInstance();

    // Pick random personality
    const pIdx = Phaser.Math.Between(0, ALL_PERSONALITIES.length - 1);
    this.personality = ALL_PERSONALITIES[pIdx];

    // Filter complaints:
    // When allowedCategories is specified for the location, strictly select from those categories!
    let eligiblePool: ComplaintData[] = [];
    if (allowedCategories && allowedCategories.length > 0) {
      eligiblePool = COMPLAINTS.filter(c => allowedCategories.includes(c.category));
    }

    if (eligiblePool.length === 0) {
      eligiblePool = COMPLAINTS.filter(c => !c.targetParty || c.targetParty === 'all' || (partyId && c.targetParty === partyId));
    }

    // Select complaint, preferring unused ones in the current run for variety
    const available = eligiblePool.filter(c => !Resident.recentComplaintIds.includes(c.id));
    const poolToUse = available.length > 0 ? available : eligiblePool;
    const chosenComplaint = poolToUse[Phaser.Math.Between(0, poolToUse.length - 1)];

    Resident.recentComplaintIds.push(chosenComplaint.id);
    if (Resident.recentComplaintIds.length > 8) {
      Resident.recentComplaintIds.shift();
    }

    this.complaint = chosenComplaint;

    // Resident starts in DOUBTFUL pose (skeptical of approaching politician!)
    const initialKey = scene.textures.exists(`resident_${residentSpriteId}_doubtful`) 
      ? `resident_${residentSpriteId}_doubtful` 
      : `resident_${residentSpriteId}`;
    // Scale resident slightly taller/bigger to match candidate on mobile
    const isPortrait = scene.scale.height > scene.scale.width;
    const residentScale = isPortrait ? 1.15 : 1.05;
    this.sprite = scene.add.sprite(0, 0, initialKey);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(residentScale);
    this.add(this.sprite);

    // Exclamation Alert Badge cleanly floating ABOVE head (clearing high hair buns/caps)
    const alertY = isPortrait ? -245 : -220;
    this.alertBadge = scene.add.sprite(0, alertY, 'ui_alert_badge');
    this.alertBadge.setOrigin(0.5, 0.5);
    this.alertBadge.setScale(0.85);
    this.add(this.alertBadge);

    // Floating bounce tween for alert badge
    this.alertTween = scene.tweens.add({
      targets: this.alertBadge,
      y: alertY - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.setDepth(6);
    scene.add.existing(this);
  }

  public triggerAlertSound() {
    this.soundFX.playResidentAlert();
  }

  public setReactionPose(outcome: 'positive' | 'doubtful' | 'negative') {
    let key = `resident_${this.residentId}_doubtful`;
    if (outcome === 'positive' && this.scene.textures.exists(`resident_${this.residentId}_happy`)) {
      key = `resident_${this.residentId}_happy`;
    } else if (outcome === 'doubtful' && this.scene.textures.exists(`resident_${this.residentId}_doubtful`)) {
      key = `resident_${this.residentId}_doubtful`;
    } else if (outcome === 'negative' && this.scene.textures.exists(`resident_${this.residentId}_frustrated`)) {
      key = `resident_${this.residentId}_frustrated`;
    }
    this.sprite.setTexture(key);
  }

  public hideAlert() {
    if (this.alertTween) {
      this.alertTween.stop();
      this.alertTween = null;
    }
    this.alertBadge.setVisible(false);
  }

  public showAngrySpeechBubble(customRemark?: string) {
    this.hideAlert();
    this.setReactionPose('negative');

    if (!this.scene) return;

    const ANGRY_REMARKS = [
      "Voetsek man! You only visit our ward before elections!",
      "Hey wena! Running right past us with your fancy takkies?!",
      "Typical politician! All talk, but won't even stop to listen!",
      "Look at them run! You won't get a single vote from our street!",
      "Haibo! We have real problems here and you just jog past?!",
      "Agh shame, too busy jogging to listen to the community!",
      "Can't even stop for two seconds?! No vote for your party!",
      "Running away from our problems like always!"
    ];

    const text = customRemark || Phaser.Utils.Array.GetRandom(ANGRY_REMARKS);

    const screenW = this.scene.scale.width;
    const bubbleW = Math.min(Math.max(230, text.length * 7.5 + 45), Math.min(320, screenW - 24));
    const bubbleH = 62;
    const bubbleY = -230;

    // Clamp bubble horizontally so it never bleeds off-screen
    const minBubbleX = bubbleW / 2 + 14;
    const maxBubbleX = screenW - bubbleW / 2 - 14;
    const clampedX = Phaser.Math.Clamp(this.x, minBubbleX, maxBubbleX);

    const bubble = this.scene.add.container(clampedX, this.y + bubbleY);
    bubble.setDepth(145);

    const bg = this.scene.add.graphics();
    // Drop shadow
    bg.fillStyle(0x000000, 0.45);
    bg.fillRoundedRect(-bubbleW / 2 + 3, -bubbleH / 2 + 4, bubbleW, bubbleH, 12);
    // White card with angry red border
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 12);
    bg.lineStyle(3, 0xef4444, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 12);

    // Dynamic pointer tail pointing down toward resident's actual relative location
    const tailX = Phaser.Math.Clamp(this.x - clampedX, -bubbleW / 2 + 26, bubbleW / 2 - 26);
    bg.fillStyle(0xffffff, 1);
    bg.beginPath();
    bg.moveTo(tailX - 10, bubbleH / 2 - 1);
    bg.lineTo(tailX, bubbleH / 2 + 14);
    bg.lineTo(tailX + 10, bubbleH / 2 - 1);
    bg.closePath();
    bg.fill();

    bg.lineStyle(3, 0xef4444, 1);
    bg.beginPath();
    bg.moveTo(tailX - 10, bubbleH / 2 - 1);
    bg.lineTo(tailX, bubbleH / 2 + 14);
    bg.lineTo(tailX + 10, bubbleH / 2 - 1);
    bg.stroke();

    bg.fillStyle(0xffffff, 1);
    bg.fillRect(tailX - 8, bubbleH / 2 - 3, 16, 4);

    // Angry emoji
    const emoji = this.scene.add.text(-bubbleW / 2 + 24, 0, '😤', {
      fontSize: '22px'
    }).setOrigin(0.5, 0.5);

    // Text remark
    const remarkText = this.scene.add.text(14, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12.5px',
      color: '#111827',
      fontStyle: '900',
      align: 'left',
      wordWrap: { width: bubbleW - 58 }
    }).setOrigin(0.5, 0.5);

    bubble.add([bg, emoji, remarkText]);

    // Micro shake & entrance pop
    bubble.setScale(0.85);
    this.scene.tweens.add({
      targets: bubble,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.easeOut'
    });

    // Extended reading duration (2.6s hold + 500ms smooth fade) so players can comfortably read
    this.scene.tweens.add({
      targets: bubble,
      y: bubble.y - 12,
      alpha: { from: 1, to: 0 },
      delay: 2600,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.angryBubbleContainer === bubble) {
          this.angryBubbleContainer = null;
        }
        bubble.destroy();
      }
    });

    this.angryBubbleContainer = bubble;
  }

  public hideAngrySpeechBubble() {
    if (this.angryBubbleContainer) {
      this.angryBubbleContainer.destroy();
      this.angryBubbleContainer = null;
    }
  }

  public updateMovement(speed: number, delta: number) {
    const moveX = speed * (delta / 1000);
    this.x -= moveX;

    if (this.x < -150) {
      this.destroy();
    }
  }

  public destroy(fromScene?: boolean) {
    this.hideAlert();
    // Do NOT destroy angryBubbleContainer here! Allow it to finish its 2.6s reading display
    super.destroy(fromScene);
  }
}
