import React from 'react';
import { useGameStore } from '../../state/store';
import { useGameStateSelector } from '../hooks/useGameState';

export const HUD: React.FC = () => {
  const money = useGameStateSelector(state => state.money);
  const lives = useGameStateSelector(state => state.lives);
  const currentWave = useGameStateSelector(state => state.currentWave);
  const isPaused = useGameStateSelector(state => state.isPaused);
  const gameSpeed = useGameStateSelector(state => state.gameSpeed);
  
  const { pauseGame, resumeGame, setGameSpeed, restartGame } = useGameStore();
  
  return (
    <div className="flex items-center justify-between px-4 py-2">
      {/* Resources */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl font-bold text-yellow-400">${money}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-2xl">❤️</span>
          <span className="text-xl font-bold text-red-400">{lives}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Wave</span>
          <span className="text-xl font-bold text-white">{currentWave}/10</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={isPaused ? resumeGame : pauseGame}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>
        
        <button
          onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : 1)}
          className={`px-4 py-2 rounded transition-colors ${
            gameSpeed === 2 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          aria-label={gameSpeed === 2 ? 'Normal speed' : 'Double speed'}
        >
          {gameSpeed === 2 ? '⏩ 2x' : '▶️ 1x'}
        </button>
        
        <button
          onClick={restartGame}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          aria-label="Restart game"
        >
          🔄 Restart
        </button>
      </div>
    </div>
  );
};
