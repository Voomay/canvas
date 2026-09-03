import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig';
import { getGameDimensions } from './config/constants';

// PWA Install Prompt Handler
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredPrompt = e;
  (window as any).deferredPwaPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  console.log('[PWA] beforeinstallprompt captured and ready');
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  (window as any).deferredPwaPrompt = null;
  console.log('[PWA] Application was installed successfully!');
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Expose helper to prompt PWA installation
(window as any).promptPwaInstall = async function(): Promise<boolean> {
  const promptEvent = deferredPrompt || (window as any).deferredPwaPrompt;
  if (!promptEvent) {
    console.log('[PWA] No install prompt available');
    return false;
  }
  promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  deferredPrompt = null;
  (window as any).deferredPwaPrompt = null;
  return choice.outcome === 'accepted';
};

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] ServiceWorker registered with scope:', reg.scope))
      .catch(err => console.warn('[PWA] ServiceWorker registration failed:', err));
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GAME_CONFIG);

  let resizeTimeout: number | undefined;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      const dims = getGameDimensions();
      game.scale.resize(dims.width, dims.height);
    }, 120);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
});
