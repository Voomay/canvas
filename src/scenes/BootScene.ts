import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload() {
    // Preload logo first so PreloadScene can immediately display the official logo
    this.load.image('logo_canvassing_sa', 'assets/ui/logo_canvassing_sa.png');
  }

  public create() {
    // Transition immediately to preloader which loads all real PNG artwork
    this.scene.start('PreloadScene');
  }
}
