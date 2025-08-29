import { createSimulation } from './systems/simulation';
import type { GameState } from './core/types';
import { STARTING_MONEY, STARTING_LIVES } from './core/constants';
import { cloneGameState } from './utils/cloneState';

export type GameStateListener = (state: GameState) => void;

class GameManager {
  private simulation: ReturnType<typeof createSimulation>;
  private listeners: Set<GameStateListener> = new Set();
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  
  constructor() {
    this.simulation = createSimulation({
      initialState: {
        phase: 'MENU',
        money: STARTING_MONEY,
        lives: STARTING_LIVES
      }
    });
  }
  
  // Subscribe to state changes
  subscribe(listener: GameStateListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.simulation.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  // Notify all listeners
  private notifyListeners() {
    const state = this.simulation.getState();
    this.listeners.forEach(listener => listener(state));
  }
  
  // Get current state
  getState(): GameState {
    return this.simulation.getState();
  }
  
  // Update state
  setState(state: GameState) {
    // Create a deep copy of the state to ensure it's not frozen
    // This is necessary because Immer produces frozen objects
    const mutableState = cloneGameState(state);
    
    this.simulation.setState(mutableState);
    this.notifyListeners();
  }
  
  // Start game loop
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  // Stop game loop
  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  // Main game loop
  private loop = () => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    const state = this.simulation.getState();
    
    // Only update if playing and not paused
    if (state.phase === 'PLAYING' && !state.isPaused) {
      const oldState = state;
      const newState = this.simulation.update(deltaTime);
      
      // Only notify if meaningful state changes occurred
      if (this.hasSignificantChanges(oldState, newState)) {
        this.simulation.setState(newState);
        this.notifyListeners();
      } else {
        // Just update the simulation state without notifying
        this.simulation.setState(newState);
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  };
  
  // Check if state has significant changes that require UI update
  private hasSignificantChanges(oldState: GameState, newState: GameState): boolean {
    // Check for changes that actually need UI updates
    return (
      oldState.money !== newState.money ||
      oldState.lives !== newState.lives ||
      oldState.currentWave !== newState.currentWave ||
      oldState.isWaveActive !== newState.isWaveActive ||
      oldState.isPaused !== newState.isPaused ||
      oldState.phase !== newState.phase ||
      oldState.gameSpeed !== newState.gameSpeed ||
      oldState.towers.size !== newState.towers.size ||
      oldState.mobs.size !== newState.mobs.size ||
      oldState.selectedTowerType !== newState.selectedTowerType ||
      oldState.selectedTowerId !== newState.selectedTowerId ||
      oldState.hoveredGridCoord !== newState.hoveredGridCoord
    );
  }
  
  // Start a new game
  startNewGame() {
    this.simulation = createSimulation({
      initialState: {
        phase: 'PLAYING',
        money: STARTING_MONEY,
        lives: STARTING_LIVES,
        currentWave: 0,
        waveTimer: 5000 // 5 seconds before first wave
      }
    });
    
    this.notifyListeners();
    this.start();
  }
}

// Singleton instance
export const gameManager = new GameManager();
