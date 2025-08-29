import type { GameState } from '../core/types';

/**
 * Deep clones a game state object, ensuring Maps are properly copied
 * and the result is mutable (not frozen by Immer)
 */
export function cloneGameState(state: GameState): GameState {
  return {
    simulationTime: state.simulationTime,
    deltaAccumulator: state.deltaAccumulator,
    isPaused: state.isPaused,
    gameSpeed: state.gameSpeed,
    phase: state.phase,
    
    // Clone Maps properly
    mobs: new Map(state.mobs),
    towers: new Map(state.towers),
    projectiles: new Map(state.projectiles),
    
    money: state.money,
    lives: state.lives,
    
    currentWave: state.currentWave,
    waveTimer: state.waveTimer,
    isWaveActive: state.isWaveActive,
    spawnQueue: state.spawnQueue.map(entry => ({ ...entry })),
    
    // Deep clone grid
    grid: {
      width: state.grid.width,
      height: state.grid.height,
      tileSize: state.grid.tileSize,
      cells: state.grid.cells.map(row => [...row]),
      spawn: { ...state.grid.spawn },
      base: { ...state.grid.base }
    },
    
    // Clone path
    path: state.path.map(p => ({ ...p })),
    
    selectedTowerType: state.selectedTowerType,
    hoveredGridCoord: state.hoveredGridCoord ? { ...state.hoveredGridCoord } : null,
    selectedTowerId: state.selectedTowerId
  };
}
