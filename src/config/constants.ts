export const GAME_HEIGHT = 720;

export function calculateGameWidth(): number {
  if (typeof window === 'undefined') return 1280;
  const ratio = window.innerWidth / Math.max(1, window.innerHeight);
  return Math.max(1280, Math.round(GAME_HEIGHT * ratio));
}

export const GAME_WIDTH = calculateGameWidth();

export const RUN_SPEED_BASE = 320;
export const RUN_SPEED_SLOW = 180;
export const JUMP_VELOCITY = -560;
export const GRAVITY_Y = 1300;

export const PLAYER_X_RATIO = 0.30; // 30% from left
export const GROUND_Y = 560; // Road asphalt surface contact line
export const RUN_FRAME_COUNT = 31; // 31 seamless run frames from GIF
export const RUN_FRAME_DURATION = 32; // ~31 FPS animation cycle

export const COLORS = {
  sky: 0x5da8f0,
  pavement: 0xb5b0a3,
  road: 0x3d434d,
  roadStripe: 0xffffff,
  grass: 0x4e8536,
  
  // UI Colors
  hudBg: 0x0c1524,
  hudBorder: 0x1f3c6e,
  gold: 0xfcb813,
  greenBtn: 0x1f9137,
  greenBtnHover: 0x27ab42,
  orangeBtn: 0xdb580a,
  orangeBtnHover: 0xf06a1a,
  blueBtn: 0x176bc4,
  blueBtnHover: 0x2480e6,
  textWhite: '#ffffff',
  textDark: '#1a1a1a',
  textGold: '#fcb813'
};

export const INITIAL_VALUES = {
  votes: 0,
  trust: 50,
  timeSeconds: 120, // 2 minutes total
  streetCount: 5,
  streetDurationSeconds: 24 // ~24s per street
};
