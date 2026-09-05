import Phaser from 'phaser';

export type ObstacleType = 
  | 'potholeSmall' 
  | 'potholeWater' 
  | 'openManhole';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  public obstacleType: ObstacleType;
  public hasHit: boolean = false;
  public isResolved: boolean = false;
  public isCleared: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType) {
    const textureKey = `obs_${type}`;
    super(scene, x, y, textureKey);
    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Road surface obstacle depth (below player & residents, above road)
    this.setDepth(5);
    this.setOrigin(0.5, 1);
    this.setImmovable(true);

    if (this.body) {
      // Collision box tuned to the road surface contact zone (ground layer)
      // This allows airborne players jumping above the obstacle to cleanly pass over!
      const hitH = Math.min(32, this.height * 0.45);
      const hitW = this.width * 0.65;
      this.body.setSize(hitW, hitH);
      this.body.setOffset(this.width * 0.175, this.height - hitH);
      (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
  }

  public updateMovement(speed: number, delta: number) {
    const moveX = speed * (delta / 1000);
    this.x -= moveX;

    // Destroy when out of screen to the left
    if (this.x < -150) {
      this.destroy();
    }
  }

  /**
   * Called when player successfully jumps over the stumbling block.
   * Performs a smooth, satisfying dissolution with green sparkles and floating "+3% Trust"
   */
  public resolveCleared() {
    if (this.isResolved) return;
    this.isResolved = true;
    this.isCleared = true;

    if (this.body) {
      this.body.enable = false;
    }

    const scene = this.scene;
    if (!scene) return;

    // 1. Floating "FIXED! +3% Trust (+5s)" pop-up
    const fixText = scene.add.text(this.x, this.y - this.height - 15, '✨ FIXED! +3% Trust 🛠️ (+5s ⏱️)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#44dd66',
      fontStyle: '900',
      backgroundColor: '#0c1524',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setOrigin(0.5, 0.5).setDepth(150);

    scene.tweens.add({
      targets: fixText,
      y: fixText.y - 40,
      alpha: 0,
      duration: 1000,
      ease: 'Power2.easeOut',
      onComplete: () => fixText.destroy()
    });

    // 2. Sparkling fix particles popping outward
    for (let i = 0; i < 7; i++) {
      const p = scene.add.circle(this.x + Phaser.Math.Between(-25, 25), this.y - 20, Phaser.Math.Between(3, 5), 0x2ecc71);
      p.setDepth(140);
      scene.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-40, 40),
        y: p.y - Phaser.Math.Between(20, 60),
        alpha: 0,
        scale: 0.2,
        duration: 500 + i * 50,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }

    // 3. Smooth sprite disappearance tween
    scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0.1,
      scaleX: 1.15,
      y: this.y - 12,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });
  }

  /**
   * Called when player stumbles / ignores the stumbling block.
   */
  public resolveStumbled() {
    if (this.isResolved) return;
    this.isResolved = true;
    this.hasHit = true;
    this.isCleared = false;

    if (this.body) {
      this.body.enable = false;
    }

    const scene = this.scene;
    if (!scene) return;

    // Floating warning pop-up
    const warnText = scene.add.text(this.x, this.y - this.height - 15, '⚠️ Hazard Ignored! -3% Trust (-2s ⏱️)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#ff5555',
      fontStyle: '900',
      backgroundColor: '#0c1524',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setOrigin(0.5, 0.5).setDepth(150);

    scene.tweens.add({
      targets: warnText,
      y: warnText.y - 35,
      alpha: 0,
      duration: 1000,
      ease: 'Power2.easeOut',
      onComplete: () => warnText.destroy()
    });

    // Fade to semi-transparent to mark as traversed
    scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 400
    });
  }
}
