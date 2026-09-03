import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig';
import { calculateGameWidth, GAME_HEIGHT } from './config/constants';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GAME_CONFIG);

  let resizeTimeout: number | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      const newWidth = calculateGameWidth();
      game.scale.resize(newWidth, GAME_HEIGHT);
    }, 100);
  });
});
