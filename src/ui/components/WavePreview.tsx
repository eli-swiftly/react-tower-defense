import React from 'react';
import { useGameStore } from '../../state/store';
import { useGameStateSelector } from '../hooks/useGameState';
import { getWave } from '../../engine/systems/waves';
import mobData from '../../assets/data/mobs.json';

export const WavePreview: React.FC = () => {
  const currentWave = useGameStateSelector(state => state.currentWave);
  const waveTimer = useGameStateSelector(state => state.waveTimer);
  
  const startNextWave = useGameStore(state => state.startNextWave);
  
  const nextWaveNumber = currentWave + 1;
  const wave = getWave(nextWaveNumber);
  
  if (!wave) return null;
  
  // Count mobs by type
  const mobCounts = wave.entries.reduce((acc, entry) => {
    acc[entry.mobType] = (acc[entry.mobType] || 0) + entry.count;
    return acc;
  }, {} as Record<string, number>);
  
  const timeRemaining = Math.ceil(waveTimer / 1000);
  
  return (
    <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-2">
        Wave {nextWaveNumber} Preview
      </h3>
      
      {/* Mob counts */}
      <div className="space-y-1 mb-3">
        {Object.entries(mobCounts).map(([mobType, count]) => {
          const mob = mobData[mobType as keyof typeof mobData];
          const icon = mobType === 'normal' ? '👾' : 
                      mobType === 'fast' ? '⚡' :
                      mobType === 'tank' ? '🛡️' : '🦅';
          
          return (
            <div key={mobType} className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1">
                <span>{icon}</span>
                <span className="text-gray-300">{mob.name}</span>
              </span>
              <span className="text-white font-semibold">x{count}</span>
            </div>
          );
        })}
      </div>
      
      {/* Reward */}
      {wave.reward && (
        <div className="text-sm text-yellow-400 mb-3">
          Reward: ${wave.reward}
        </div>
      )}
      
      {/* Timer and start button */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Starts in: {timeRemaining}s
        </span>
        
        <button
          onClick={startNextWave}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-semibold transition-colors"
          aria-label="Start wave early"
        >
          Start Now
        </button>
      </div>
    </div>
  );
};
