// Primitives
export interface Vec2 {
  x: number;
  y: number;
}

export interface GridCoord {
  row: number;
  col: number;
}

export type CellType = 'PATH' | 'BUILDABLE' | 'BLOCKED' | 'SPAWN' | 'BASE' | 'TOWER';

// Game State
export interface GameState {
  simulationTime: number;
  deltaAccumulator: number;
  isPaused: boolean;
  gameSpeed: 1 | 2;
  phase: 'MENU' | 'PLAYING' | 'WON' | 'LOST';
  
  // Entities
  mobs: Map<string, Mob>;
  towers: Map<string, Tower>;
  projectiles: Map<string, Projectile>;
  
  // Resources
  money: number;
  lives: number;
  
  // Wave Management
  currentWave: number;
  waveTimer: number;
  isWaveActive: boolean;
  spawnQueue: SpawnEntry[];
  
  // Grid
  grid: Grid;
  path: Vec2[];
  
  // UI State
  selectedTowerType: TowerKind | null;
  hoveredGridCoord: GridCoord | null;
  selectedTowerId: string | null;
}

// Entity Types
export type MobType = 'normal' | 'fast' | 'tank' | 'flying';

export interface Mob {
  id: string;
  type: MobType;
  position: Vec2;
  previousPosition?: Vec2;
  pathIndex: number;
  pathProgress: number; // 0-1 between path points
  
  // Stats
  hp: number;
  maxHp: number;
  speed: number; // tiles/sec
  armor: number;
  bounty: number;
  
  // Effects
  effects: Effect[];
}

export type TowerKind = 'arrow' | 'cannon' | 'frost';

export interface Tower {
  id: string;
  kind: TowerKind;
  gridPos: GridCoord;
  tier: 1 | 2 | 3;
  
  // Combat stats
  damage: number;
  range: number; // in tiles
  attackSpeed: number; // attacks/sec
  projectileSpeed?: number;
  splashRadius?: number;
  
  // State
  lastAttackTime: number;
  targetId: string | null;
  targetingStrategy: TargetingStrategy;
}

export interface Projectile {
  id: string;
  ownerId: string;
  targetId: string;
  targetLastPos: Vec2;
  position: Vec2;
  previousPosition?: Vec2;
  velocity: Vec2;
  damage: number;
  splashRadius?: number;
  effects?: EffectType[];
}

export type EffectType = 'SLOW' | 'DOT' | 'ARMOR_BREAK';

export interface Effect {
  type: EffectType;
  duration: number;
  remainingDuration: number;
  value: number;
  stackId?: string;
}

export interface SpawnEntry {
  mobType: MobType;
  delay: number;
  count: number;
  spacing: number;
  spawned: number;
  nextSpawnTime: number;
}

export interface Wave {
  id: number;
  entries: Array<{
    mobType: MobType;
    count: number;
    spacing: number;
    delay: number;
  }>;
  reward?: number;
}

export type TargetingStrategy = 
  | 'first'    // First in path
  | 'last'     // Last in path
  | 'nearest'  // Closest distance
  | 'strongest' // Highest HP
  | 'weakest'; // Lowest HP

// Tower definitions
export interface TowerDefinition {
  kind: TowerKind;
  name: string;
  icon: string;
  baseCost: number;
  tiers: {
    [tier: number]: {
      cost: number;
      damage: number;
      range: number;
      attackSpeed: number;
      projectileSpeed?: number;
      splashRadius?: number;
      effects?: EffectType[];
    };
  };
}

// Mob definitions
export interface MobDefinition {
  type: MobType;
  name: string;
  baseHp: number;
  baseSpeed: number;
  baseArmor: number;
  baseBounty: number;
  hpScaling: number;
  bountyScaling: number;
}

// Grid type
export interface Grid {
  cells: CellType[][];
  width: number;
  height: number;
  tileSize: number;
  spawn: GridCoord;
  base: GridCoord;
}
