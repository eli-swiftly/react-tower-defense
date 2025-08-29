import { produce } from 'immer';
import type { GameState, Mob, SpawnEntry } from '../core/types';
import { TICK_DURATION, MAX_FRAME_SKIP } from '../core/constants';
import { Grid } from './grid';
import { getWave, getWaveScaling } from './waves';
import { updateMobMovement } from './movement';
import { updateTowerTargeting, processTowerAttacks } from './combat';
import { updateProjectiles, processCollisions } from './projectiles';
import { processEffects } from './effects';
import { cleanupDeadEntities } from './cleanup';
import mobData from '../../assets/data/mobs.json';

export interface SimulationOptions {
  initialState?: Partial<GameState>;
}

export function createSimulation(options: SimulationOptions = {}) {
  let state = createInitialGameState(options.initialState);
  let accumulator = 0;

  return {
    getState: () => state,
    
    update(deltaTime: number): GameState {
      if (state.isPaused || state.phase !== 'PLAYING') return state;

      // Apply game speed multiplier
      deltaTime *= state.gameSpeed;
      accumulator += deltaTime;

      // Clamp to prevent spiral of death
      accumulator = Math.min(accumulator, TICK_DURATION * MAX_FRAME_SKIP);

      // Fixed timestep update
      while (accumulator >= TICK_DURATION) {
        state = tick(state, TICK_DURATION / 1000); // Convert to seconds
        accumulator -= TICK_DURATION;
      }

      // Store remainder for interpolation - create new state object
      state = produce(state, draft => {
        draft.deltaAccumulator = accumulator / TICK_DURATION;
      });

      return state;
    },
    
    setState: (newState: GameState) => {
      state = newState;
    }
  };
}

function createInitialGameState(overrides?: Partial<GameState>): GameState {
  const grid = new Grid(20, 15);
  
  return {
    simulationTime: 0,
    deltaAccumulator: 0,
    isPaused: false,
    gameSpeed: 1,
    phase: 'MENU',
    
    mobs: new Map(),
    towers: new Map(),
    projectiles: new Map(),
    
    money: 150,
    lives: 20,
    
    currentWave: 0,
    waveTimer: 0,
    isWaveActive: false,
    spawnQueue: [],
    
    grid: grid.toJSON(),
    path: grid.getPath(),
    
    selectedTowerType: null,
    hoveredGridCoord: null,
    selectedTowerId: null,
    
    ...overrides
  };
}

function tick(state: GameState, dt: number): GameState {
  return produce(state, draft => {
    // 1. Update wave spawning
    updateWaveSpawning(draft, dt);
    
    // 2. Update mob movement
    updateMobMovement(draft, dt);
    
    // 3. Update tower targeting
    updateTowerTargeting(draft);
    
    // 4. Process tower attacks
    processTowerAttacks(draft, dt);
    
    // 5. Update projectiles
    updateProjectiles(draft, dt);
    
    // 6. Process collisions
    processCollisions(draft);
    
    // 7. Apply effects
    processEffects(draft, dt);
    
    // 8. Clean up dead entities
    cleanupDeadEntities(draft);
    
    // 9. Check win/lose conditions
    checkGameEndConditions(draft);
    
    // 10. Update simulation time
    draft.simulationTime += dt;
  });
}

function updateWaveSpawning(state: GameState, dt: number): void {
  // Handle wave timer between waves
  if (!state.isWaveActive && state.currentWave < 10) {
    state.waveTimer -= dt * 1000; // Convert to ms
    
    if (state.waveTimer <= 0) {
      startNextWave(state);
    }
    return;
  }
  
  // Process spawn queue
  const toRemove: number[] = [];
  
  state.spawnQueue.forEach((entry, index) => {
    if (state.simulationTime >= entry.nextSpawnTime && entry.spawned < entry.count) {
      spawnMob(state, entry);
      entry.spawned++;
      
      if (entry.spawned < entry.count) {
        entry.nextSpawnTime = state.simulationTime + entry.spacing;
      } else {
        toRemove.push(index);
      }
    }
  });
  
  // Remove completed entries
  toRemove.reverse().forEach(index => {
    state.spawnQueue.splice(index, 1);
  });
  
  // Check if wave is complete
  if (state.isWaveActive && state.spawnQueue.length === 0 && state.mobs.size === 0) {
    completeWave(state);
  }
}

function startNextWave(state: GameState): void {
  state.currentWave++;
  state.isWaveActive = true;
  
  const wave = getWave(state.currentWave);
  if (!wave) return;
  
  // Create spawn entries
  state.spawnQueue = wave.entries.map(entry => ({
    mobType: entry.mobType,
    delay: entry.delay,
    count: entry.count,
    spacing: entry.spacing,
    spawned: 0,
    nextSpawnTime: state.simulationTime + entry.delay
  }));
}

function spawnMob(state: GameState, entry: SpawnEntry): void {
  const def = mobData[entry.mobType as keyof typeof mobData];
  const scaling = getWaveScaling(state.currentWave);
  
  const grid = new Grid(state.grid.width, state.grid.height);
  const spawnPos = grid.gridToWorld(state.grid.spawn);
  
  const mob: Mob = {
    id: `mob_${Date.now()}_${Math.random()}`,
    type: entry.mobType,
    position: { ...spawnPos },
    pathIndex: 0,
    pathProgress: 0,
    hp: Math.floor(def.baseHp * scaling.hpMultiplier),
    maxHp: Math.floor(def.baseHp * scaling.hpMultiplier),
    speed: def.baseSpeed,
    armor: def.baseArmor,
    bounty: Math.floor(def.baseBounty * scaling.bountyMultiplier),
    effects: []
  };
  
  state.mobs.set(mob.id, mob);
}

function completeWave(state: GameState): void {
  state.isWaveActive = false;
  
  const wave = getWave(state.currentWave);
  if (wave?.reward) {
    state.money += wave.reward;
  }
  
  // Set timer for next wave
  if (state.currentWave < 10) {
    state.waveTimer = 10000; // 10 seconds between waves
  }
}

function checkGameEndConditions(state: GameState): void {
  // Check loss condition
  if (state.lives <= 0) {
    state.phase = 'LOST';
    state.isPaused = true;
  }
  
  // Check win condition
  if (state.currentWave === 10 && !state.isWaveActive && state.mobs.size === 0) {
    state.phase = 'WON';
    state.isPaused = true;
  }
}

export function startWaveEarly(state: GameState): GameState {
  if (state.isWaveActive || state.currentWave >= 10) return state;
  
  return produce(state, draft => {
    // Bonus money for starting early
    const bonusPercent = draft.waveTimer / 10000; // Percentage of time remaining
    draft.money += Math.floor(10 * bonusPercent);
    
    // Start wave immediately
    draft.waveTimer = 0;
  });
}
