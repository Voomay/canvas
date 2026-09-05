import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig';
import { getGameDimensions } from './config/constants';
import { ScoreManager } from './systems/ScoreManager';
import { COMPLAINTS } from './data/complaints';

import { Resident } from './entities/Resident';

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

// Service Worker handling:
// On localhost, aggressively unregister any service worker to prevent stale cache lockups and freezes
if ('serviceWorker' in navigator) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        reg.unregister().then(() => console.log('[PWA] Cleared dev service worker:', reg.scope));
      }
    });
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    }
  } else if (window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[PWA] ServiceWorker registered with scope:', reg.scope))
        .catch(err => console.warn('[PWA] ServiceWorker registration failed:', err));
    });
  }
}

// Global High-Resolution Text Pipeline:
// Guarantees all text objects render at high-DPI internal canvas resolution (2.5x - 3.5x)
// completely eliminating blurry canvas wording on mobile, laptops, and desktop screens.
const originalAddText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function(
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle
) {
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const defaultRes = Math.min(Math.max(Math.round(dpr * 2), 2.5), 3.5);

  const enhancedStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    resolution: defaultRes,
    padding: { left: 4, right: 4, top: 2, bottom: 2 },
    ...style
  };

  if (style && style.resolution !== undefined && style.resolution > 0) {
    enhancedStyle.resolution = style.resolution;
  }
  if (style && style.padding) {
    enhancedStyle.padding = style.padding;
  }

  return originalAddText.call(this, x, y, text, enhancedStyle);
};

async function initGame() {
  // Ensure Google Web Fonts ('Outfit', 'Inter') are fully loaded and ready before rendering text
  if (document.fonts && typeof document.fonts.ready?.then === 'function') {
    try {
      await document.fonts.ready;
      console.log('[Canvassing SA] Typography fonts fully loaded and ready');
    } catch (err) {
      console.warn('[Canvassing SA] Font loading check warning:', err);
    }
  }

  const game = new Phaser.Game(GAME_CONFIG);
  (window as any).game = game;
  (window as any).__PHASER_GAME__ = game;
  (window as any).ScoreManager = ScoreManager;
  (window as any).COMPLAINTS = COMPLAINTS;
  (window as any).Resident = Resident;
  (window as any).startArea = (areaId: number, partyId: 'da' | 'anc' | 'pa' = 'da') => {
    const sm = ScoreManager.getInstance();
    sm.startNewArea(areaId);
    game.scene.stop('MainMenuScene');
    game.scene.stop('PartySelectScene');
    game.scene.start('GameScene', { partyId });
  };

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
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

