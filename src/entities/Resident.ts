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
  private soundFX: SoundFX;

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
    // Strictly party-eligible: targetParty matches partyId OR targetParty === 'all' (never a rival party's complaint)
    let partyEligible = COMPLAINTS.filter(c => !c.targetParty || c.targetParty === 'all' || (partyId && c.targetParty === partyId));

    // If allowedCategories specified, strictly filter by allowedCategories for the location
    if (allowedCategories && allowedCategories.length > 0) {
      const categoryMatches = partyEligible.filter(c => allowedCategories.includes(c.category));
      if (categoryMatches.length > 0) {
        partyEligible = categoryMatches;
      }
    }

    // Give 75% priority to party-specific complaints for deep party personalization
    const specificToParty = partyId ? partyEligible.filter(c => c.targetParty === partyId) : [];
    let chosenComplaint: ComplaintData;
    if (specificToParty.length > 0 && Math.random() < 0.75) {
      const idx = Phaser.Math.Between(0, specificToParty.length - 1);
      chosenComplaint = specificToParty[idx];
    } else {
      const idx = Phaser.Math.Between(0, partyEligible.length - 1);
      chosenComplaint = partyEligible[idx] || COMPLAINTS[0];
    }
    this.complaint = chosenComplaint;

    // Resident starts in DOUBTFUL pose (skeptical of approaching politician!)
    const initialKey = scene.textures.exists(`resident_${residentSpriteId}_doubtful`) 
      ? `resident_${residentSpriteId}_doubtful` 
      : `resident_${residentSpriteId}`;
    this.sprite = scene.add.sprite(0, 0, initialKey);
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);

    // Exclamation Alert Badge above head
    this.alertBadge = scene.add.sprite(0, -120, 'ui_alert_badge');
    this.alertBadge.setOrigin(0.5, 0.5);
    this.alertBadge.setScale(0.85);
    this.add(this.alertBadge);

    // Floating bounce tween for alert badge
    this.alertTween = scene.tweens.add({
      targets: this.alertBadge,
      y: -130,
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

  public updateMovement(speed: number, delta: number) {
    const moveX = speed * (delta / 1000);
    this.x -= moveX;

    if (this.x < -150) {
      this.destroy();
    }
  }
}
