import React from 'react';
import { CanvasRenderer } from '../../renderers/canvas/CanvasRenderer';
import { HUD } from './HUD';
import { BuildBar } from './BuildBar';
import { TowerInfo } from './TowerInfo';
import { WavePreview } from './WavePreview';
import { useGameStore } from '../../state/store';
import { useGameState } from '../hooks/useGameState';
import type { GridCoord } from '../../engine/core/types';
import { createGridFromState } from '../../engine/utils/gridUtils';

export const GameContainer: React.FC = () => {
  const gameState = useGameState();
  const placeTower = useGameStore(state => state.placeTower);
  const setHoveredTile = useGameStore(state => state.setHoveredTile);
  const selectTower = useGameStore(state => state.selectTower);
  
  const handleTileClick = (coord: GridCoord) => {
    // Check if we're placing a tower or selecting an existing one
    const grid = createGridFromState(gameState.grid);
    
    const cellType = grid.getCell(coord);
    
    if (gameState.selectedTowerType && cellType === 'BUILDABLE') {
      placeTower(coord);
    } else if (cellType === 'TOWER') {
      // Find tower at this position
      const tower = Array.from(gameState.towers.values()).find(
        t => t.gridPos.row === coord.row && t.gridPos.col === coord.col
      );
      if (tower) {
        selectTower(tower.id);
      }
    } else {
      selectTower(null);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Top HUD */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700">
        <HUD />
      </div>
      
      {/* Main game area */}
      <div className="flex-1 flex">
        {/* Left sidebar - Build Bar */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <BuildBar />
        </div>
        
        {/* Game canvas */}
        <div className="flex-1 relative">
          <CanvasRenderer 
            gameState={gameState}
            onTileClick={handleTileClick}
            onTileHover={setHoveredTile}
          />
          
          {/* Wave preview overlay */}
          {!gameState.isWaveActive && gameState.currentWave < 10 && (
            <div className="absolute top-4 left-4">
              <WavePreview />
            </div>
          )}
        </div>
        
        {/* Right sidebar - Tower Info */}
        <div className="w-64 bg-gray-800 border-l border-gray-700">
          <TowerInfo />
        </div>
      </div>
    </div>
  );
};
