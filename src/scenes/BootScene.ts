import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public create() {
    // Transition immediately to preloader which loads all real PNG artwork first
    this.scene.start('PreloadScene');
  }
}
