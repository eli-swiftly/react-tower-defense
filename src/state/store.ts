import { create } from 'zustand';
import { produce, enableMapSet } from 'immer';
import type { TowerKind, GridCoord, Tower } from '../engine/core/types';
import { startWaveEarly } from '../engine/systems/simulation';
import { generateTowerId } from '../engine/utils/id';
import { gameManager } from '../engine/gameManager';
import { createGridFromState } from '../engine/utils/gridUtils';
import towerData from '../assets/data/towers.json';

// Enable MapSet plugin for Immer to handle Map/Set in state
enableMapSet();

interface GameStore {
  // Core Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setGameSpeed: (speed: 1 | 2) => void;
  restartGame: () => void;
  
  // Tower Actions
  selectTowerType: (type: TowerKind | null) => void;
  placeTower: (coord: GridCoord) => void;
  upgradeTower: (towerId: string) => void;
  sellTower: (towerId: string) => void;
  selectTower: (towerId: string | null) => void;
  
  // Wave Actions
  startNextWave: () => void;
  
  // UI Actions
  setHoveredTile: (coord: GridCoord | null) => void;
}

export const useGameStore = create<GameStore>(() => {
  return {
    
    startGame: () => {
      gameManager.startNewGame();
    },
    
    pauseGame: () => {
      const state = gameManager.getState();
      gameManager.setState(produce(state, draft => {
        draft.isPaused = true;
      }));
    },
    
    resumeGame: () => {
      const state = gameManager.getState();
      gameManager.setState(produce(state, draft => {
        draft.isPaused = false;
      }));
    },
    
    setGameSpeed: (speed: 1 | 2) => {
      const state = gameManager.getState();
      gameManager.setState(produce(state, draft => {
        draft.gameSpeed = speed;
      }));
    },
    
    restartGame: () => {
      gameManager.startNewGame();
    },
    
    selectTowerType: (type: TowerKind | null) => {
      const state = gameManager.getState();
      gameManager.setState(produce(state, draft => {
        draft.selectedTowerType = type;
        draft.selectedTowerId = null;
      }));
    },
    
    placeTower: (coord: GridCoord) => {
      const gameState = gameManager.getState();
      const { selectedTowerType } = gameState;
      
      if (!selectedTowerType) return;
      
      const towerDef = towerData[selectedTowerType];
      const cost = towerDef.baseCost;
      
      if (gameState.money < cost) return;
      
      const grid = createGridFromState(gameState.grid);
      
      if (!grid.canPlaceTower(coord)) return;
      
      gameManager.setState(produce(gameState, draft => {
        const tierData = towerDef.tiers[1];
        
        const tower: Tower = {
          id: generateTowerId(),
          kind: selectedTowerType,
          gridPos: coord,
          tier: 1,
          damage: tierData.damage,
          range: tierData.range,
          attackSpeed: tierData.attackSpeed,
          projectileSpeed: 'projectileSpeed' in tierData ? tierData.projectileSpeed : undefined,
          splashRadius: 'splashRadius' in tierData ? tierData.splashRadius : undefined,
          lastAttackTime: 0,
          targetId: null,
          targetingStrategy: 'first'
        };
        
        draft.towers.set(tower.id, tower);
        draft.money -= cost;
        draft.grid.cells[coord.row][coord.col] = 'TOWER';
        
        // Deselect tower type after placing
        draft.selectedTowerType = null;
      }));
    },
    
    upgradeTower: (towerId: string) => {
      const gameState = gameManager.getState();
      const tower = gameState.towers.get(towerId);
      
      if (!tower || tower.tier >= 3) return;
      
      const towerDef = towerData[tower.kind];
      const nextTier = tower.tier + 1;
      const upgradeCost = towerDef.tiers[nextTier.toString() as keyof typeof towerDef.tiers].cost;
      
      if (gameState.money < upgradeCost) return;
      
      gameManager.setState(produce(gameState, draft => {
        const tower = draft.towers.get(towerId);
        if (!tower) return;
        
        const tierData = towerDef.tiers[nextTier.toString() as keyof typeof towerDef.tiers];
        
        tower.tier = nextTier as 1 | 2 | 3;
        tower.damage = tierData.damage;
        tower.range = tierData.range;
        tower.attackSpeed = tierData.attackSpeed;
        tower.projectileSpeed = 'projectileSpeed' in tierData ? tierData.projectileSpeed : undefined;
        tower.splashRadius = 'splashRadius' in tierData ? tierData.splashRadius : undefined;
        
        draft.money -= upgradeCost;
      }));
    },
    
    sellTower: (towerId: string) => {
      const gameState = gameManager.getState();
      const tower = gameState.towers.get(towerId);
      
      if (!tower) return;
      
      const towerDef = towerData[tower.kind];
      let sellValue = towerDef.baseCost * 0.7; // 70% base value
      
      // Add upgrade costs
      for (let i = 2; i <= tower.tier; i++) {
        sellValue += towerDef.tiers[i.toString() as keyof typeof towerDef.tiers].cost * 0.7;
      }
      
      gameManager.setState(produce(gameState, draft => {
        const tower = draft.towers.get(towerId);
        if (!tower) return;
        
        draft.towers.delete(towerId);
        draft.money += Math.floor(sellValue);
        draft.grid.cells[tower.gridPos.row][tower.gridPos.col] = 'BUILDABLE';
        
        if (draft.selectedTowerId === towerId) {
          draft.selectedTowerId = null;
        }
      }));
    },
    
    selectTower: (towerId: string | null) => {
      const state = gameManager.getState();
      gameManager.setState(produce(state, draft => {
        draft.selectedTowerId = towerId;
        draft.selectedTowerType = null;
      }));
    },
    
    startNextWave: () => {
      const gameState = gameManager.getState();
      if (gameState.isWaveActive) return;
      
      gameManager.setState(startWaveEarly(gameState));
    },
    
    setHoveredTile: (coord: GridCoord | null) => {
      const state = gameManager.getState();
      gameManager.setState(produce(state, draft => {
        draft.hoveredGridCoord = coord;
      }));
    }
  };
});
