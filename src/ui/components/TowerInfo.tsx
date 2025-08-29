import React from 'react';
import { useGameStore } from '../../state/store';
import { useGameStateSelector } from '../hooks/useGameState';
import towerData from '../../assets/data/towers.json';

export const TowerInfo: React.FC = () => {
  const selectedTowerId = useGameStateSelector(state => state.selectedTowerId);
  const towers = useGameStateSelector(state => state.towers);
  const money = useGameStateSelector(state => state.money);
  
  const { upgradeTower, sellTower } = useGameStore();
  
  if (!selectedTowerId) {
    return (
      <div className="p-4 text-gray-400">
        <h3 className="text-lg font-semibold text-white mb-4">Tower Info</h3>
        <p className="text-sm">Select a tower to view details</p>
      </div>
    );
  }
  
  const tower = towers.get(selectedTowerId);
  if (!tower) return null;
  
  const towerDef = towerData[tower.kind];
  // const currentTierData = towerDef.tiers[tower.tier];
  const nextTierData = tower.tier < 3 ? towerDef.tiers[(tower.tier + 1).toString() as keyof typeof towerDef.tiers] : null;
  const canUpgrade = nextTierData && money >= nextTierData.cost;
  
  // Calculate sell value
  let sellValue = towerDef.baseCost * 0.7;
  for (let i = 2; i <= tower.tier; i++) {
    sellValue += towerDef.tiers[i.toString() as keyof typeof towerDef.tiers].cost * 0.7;
  }
  sellValue = Math.floor(sellValue);
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Tower Info</h3>
      
      {/* Tower Details */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{towerDef.icon}</span>
          <span className="text-lg font-semibold text-white">{towerDef.name}</span>
          <span className="text-sm text-gray-400">Tier {tower.tier}</span>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Damage:</span>
            <span className="text-white">{tower.damage}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Range:</span>
            <span className="text-white">{tower.range}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Attack Speed:</span>
            <span className="text-white">{tower.attackSpeed}/s</span>
          </div>
          {tower.splashRadius && (
            <div className="flex justify-between">
              <span className="text-gray-400">Splash Radius:</span>
              <span className="text-white">{tower.splashRadius}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">DPS:</span>
            <span className="text-yellow-400">{(tower.damage * tower.attackSpeed).toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      {/* Upgrade Section */}
      {nextTierData && (
        <div className="mb-4 p-3 bg-gray-700 rounded">
          <h4 className="text-sm font-semibold text-white mb-2">Upgrade to Tier {tower.tier + 1}</h4>
          
          <div className="space-y-1 text-xs mb-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Damage:</span>
              <span className="text-green-400">
                {tower.damage} → {nextTierData.damage} (+{nextTierData.damage - tower.damage})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DPS:</span>
              <span className="text-green-400">
                {(tower.damage * tower.attackSpeed).toFixed(1)} → {(nextTierData.damage * nextTierData.attackSpeed).toFixed(1)}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => upgradeTower(selectedTowerId)}
            disabled={!canUpgrade}
            className={`
              w-full py-2 rounded font-semibold transition-colors
              ${canUpgrade 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label={`Upgrade tower to tier ${tower.tier + 1} for $${nextTierData.cost}`}
          >
            Upgrade (${nextTierData.cost})
          </button>
        </div>
      )}
      
      {/* Sell Button */}
      <button
        onClick={() => sellTower(selectedTowerId)}
        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors"
        aria-label={`Sell tower for $${sellValue}`}
      >
        Sell (${sellValue})
      </button>
      
      {/* Targeting Strategy */}
      <div className="mt-4 text-xs text-gray-400">
        <p>Targeting: First in path</p>
      </div>
    </div>
  );
};
