import React from 'react';
import { useGameStore } from '../../state/store';
import { useGameStateSelector } from '../hooks/useGameState';
import type { TowerKind } from '../../engine/core/types';
import towerData from '../../assets/data/towers.json';

export const BuildBar: React.FC = () => {
  const selectedTowerType = useGameStateSelector(state => state.selectedTowerType);
  const money = useGameStateSelector(state => state.money);
  
  const selectTowerType = useGameStore(state => state.selectTowerType);
  
  const towerTypes: TowerKind[] = ['arrow', 'cannon', 'frost'];
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Build Towers</h3>
      
      <div className="space-y-2">
        {towerTypes.map(towerKind => {
          const tower = towerData[towerKind];
          const canAfford = money >= tower.baseCost;
          const isSelected = selectedTowerType === towerKind;
          const tierData = tower.tiers[1];
          
          return (
            <button
              key={towerKind}
              onClick={() => selectTowerType(isSelected ? null : towerKind)}
              disabled={!canAfford}
              className={`
                w-full p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-900/30' 
                  : 'border-gray-600 hover:border-gray-500'
                }
                ${!canAfford 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:bg-gray-700/50'
                }
              `}
              aria-label={`Select ${tower.name}, costs $${tower.baseCost}`}
            >
              <div className="flex items-start justify-between">
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{tower.icon}</span>
                    <span className="font-semibold text-white">{tower.name}</span>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    <div>DMG: {tierData.damage}</div>
                    <div>RNG: {tierData.range}</div>
                    <div>SPD: {tierData.attackSpeed}/s</div>
                  </div>
                </div>
                
                <div className={`text-lg font-bold ${canAfford ? 'text-yellow-400' : 'text-gray-500'}`}>
                  ${tower.baseCost}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 text-xs text-gray-400">
        <p>Click a tower to select</p>
        <p>Click on the map to place</p>
        <p>Press ESC to cancel</p>
      </div>
    </div>
  );
};
