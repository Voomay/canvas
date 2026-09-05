export const GAME_LANDSCAPE_HEIGHT = 720;
export const GAME_LANDSCAPE_WIDTH = 1280;

export function isDevicePortrait(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight > window.innerWidth;
}

export function getGameDimensions(): { width: number; height: number; isPortrait: boolean } {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720, isPortrait: false };
  }
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait) {
    const ratio = window.innerHeight / Math.max(1, window.innerWidth);
    // Base width 520 (zoomed out for expanded reaction distance and wide street visibility)
    const targetHeight = Math.round(520 * ratio);
    return { width: 520, height: targetHeight, isPortrait: true };
  } else {
    const ratio = window.innerWidth / Math.max(1, window.innerHeight);
    const targetWidth = Math.max(1280, Math.round(720 * ratio));
    return { width: targetWidth, height: 720, isPortrait: false };
  }
}

export const GAME_HEIGHT = getGameDimensions().height;
export const GAME_WIDTH = getGameDimensions().width;

export function calculateGameWidth(): number {
  return getGameDimensions().width;
}

export function getDynamicRoadY(height: number, width: number): number {
  const isPortrait = height > width;
  return isPortrait ? Math.round(height * 0.46) : 368;
}

export function getDynamicGroundY(height: number, width: number): number {
  const isPortrait = height > width;
  const roadY = getDynamicRoadY(height, width);
  // Characters (politician & residents) and potholes positioned in the lower driving lane, centered away from bottom curb
  return isPortrait ? Math.round(roadY + (height - roadY) * 0.59) : 628;
}

export function getCurbsideTaxiY(height: number, width: number): number {
  const isPortrait = height > width;
  const roadY = getDynamicRoadY(height, width);
  // Taxi / vehicles positioned right near the upper curb side
  return isPortrait ? Math.round(roadY + (height - roadY) * 0.20) : roadY + 120;
}

export const RUN_SPEED_BASE = 420;
export const RUN_SPEED_SPRINT = 640;
export const RUN_SPEED_SLOW = 240;
export const JUMP_VELOCITY = -560;
export const GRAVITY_Y = 1300;

export const PLAYER_X_RATIO = 0.30; // 30% from left
export const GROUND_Y = 560; // Landscape default contact line
export const RUN_FRAME_COUNT = 31; // Default fallback frame count
export const PARTY_RUN_FRAME_COUNTS: Record<'da' | 'anc' | 'pa', number> = {
  da: 31,
  anc: 31,
  pa: 28 // Exact 28-frame seamless loop from GIF
};
export const RUN_FRAME_DURATION = 32; // ~31 FPS smooth animation cycle

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
  purpleBtn: 0x8e24aa,
  purpleBtnHover: 0xab47bc,
  blueBtn: 0x176bc4,
  blueBtnHover: 0x2480e6,
  textWhite: '#ffffff',
  textDark: '#1a1a1a',
  textGold: '#fcb813'
};

export const INITIAL_VALUES = {
  votes: 0,
  trust: 45, // Starts at 45% per user request
  timeSeconds: 30, // 30 seconds sprint per ward
  streetCount: 5,
  areaCount: 5,
  streetDurationSeconds: 30, // 30s ward sprint
  wardTargetVotes: 10 // Need 10 votes in 30s to win ward
};

