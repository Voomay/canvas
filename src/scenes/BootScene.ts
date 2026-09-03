import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload() {
    // Preload logo and app icon first so scenes can immediately display them
    this.load.image('logo_canvassing_sa', 'assets/ui/logo_canvassing_sa.png?v=2');
    this.load.image('app_icon', 'assets/icons/icon-192.png?v=2');
  }

  public create() {
    // Transition immediately to preloader which loads all real PNG artwork
    this.scene.start('PreloadScene');
  }
}
