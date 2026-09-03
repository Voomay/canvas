import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY_Y } from './constants';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { PartySelectScene } from '../scenes/PartySelectScene';
import { GameScene } from '../scenes/GameScene';
import { StreetCompleteScene } from '../scenes/StreetCompleteScene';
import { ResultsScene } from '../scenes/ResultsScene';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0d131a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  roundPixels: true,
  render: {
    antialias: true,
    antialiasGL: true,
    roundPixels: true,
    powerPreference: 'high-performance'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY_Y },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    PartySelectScene,
    GameScene,
    StreetCompleteScene,
    ResultsScene
  ]
};
