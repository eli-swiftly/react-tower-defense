import { useSyncExternalStore } from 'react';
import { gameManager } from '../../engine/gameManager';
import type { GameState } from '../../engine/core/types';

// Custom hook to sync with game manager state
export function useGameState(): GameState {
  return useSyncExternalStore(
    // Subscribe function
    (callback) => gameManager.subscribe(callback),
    // Get snapshot function
    () => gameManager.getState(),
    // Get server snapshot (for SSR, same as client in our case)
    () => gameManager.getState()
  );
}

// Selector hook for specific state slices
export function useGameStateSelector<T>(
  selector: (state: GameState) => T
): T {
  const state = useGameState();
  return selector(state);
}
