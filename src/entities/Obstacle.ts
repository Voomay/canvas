import Phaser from 'phaser';

export type ObstacleType = 
  | 'potholeSmall' 
  | 'potholeLarge' 
  | 'potholeWater' 
  | 'rubbishBag' 
  | 'brokenDrain' 
  | 'openManhole' 
  | 'leakingPipe' 
  | 'fallenPoster';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  public obstacleType: ObstacleType;
  public hasHit: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType) {
    const textureKey = `obs_${type}`;
    super(scene, x, y, textureKey);
    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(5);
    this.setOrigin(0.5, 1);
    this.setImmovable(true);

    if (this.body) {
      // Adjust hitbox for precise dodging
      this.body.setSize(this.width * 0.75, this.height * 0.6);
      this.body.setOffset(this.width * 0.12, this.height * 0.4);
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
}
