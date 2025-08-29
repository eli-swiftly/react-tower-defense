// Game Configuration
export const TICK_RATE = 60; // 60 Hz
export const TICK_DURATION = 1000 / TICK_RATE; // ~16.67ms
export const MAX_FRAME_SKIP = 5; // Prevent spiral of death

// Grid Configuration
export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 15;
export const TILE_SIZE = 40; // pixels

// Game Balance
export const STARTING_MONEY = 150;
export const STARTING_LIVES = 20;
export const WAVE_COUNT = 10;
export const WAVE_PREPARATION_TIME = 10000; // 10 seconds

// Combat
export const MIN_DAMAGE = 1; // Minimum damage after armor reduction
export const SLOW_MIN_SPEED_MULTIPLIER = 0.4; // 40% minimum speed when slowed

// UI
export const TOOLTIP_DELAY = 500; // ms
export const BUILD_PREVIEW_ALPHA = 0.5;

// Colors
export const COLORS = {
  // Grid
  PATH: '#8B7355',
  BUILDABLE: '#228B22',
  BLOCKED: '#696969',
  SPAWN: '#4169E1',
  BASE: '#DC143C',
  
  // Towers
  ARROW_TOWER: '#8B4513',
  CANNON_TOWER: '#2F4F4F',
  FROST_TOWER: '#4682B4',
  
  // Mobs
  NORMAL_MOB: '#FF6347',
  FAST_MOB: '#FFD700',
  TANK_MOB: '#8B008B',
  FLYING_MOB: '#87CEEB',
  
  // UI
  HEALTH_BAR_BG: '#333333',
  HEALTH_BAR_FG: '#00FF00',
  RANGE_INDICATOR: 'rgba(255, 255, 255, 0.3)',
  VALID_PLACEMENT: 'rgba(0, 255, 0, 0.3)',
  INVALID_PLACEMENT: 'rgba(255, 0, 0, 0.3)',
} as const;

// Performance
export const SPATIAL_HASH_CELL_SIZE = TILE_SIZE * 2;
export const PROJECTILE_POOL_SIZE = 200;
export const EFFECT_POOL_SIZE = 100;
