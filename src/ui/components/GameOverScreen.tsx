import React from 'react';
import { useGameStore } from '../../state/store';
import { useGameStateSelector } from '../hooks/useGameState';

export const GameOverScreen: React.FC = () => {
  const phase = useGameStateSelector(state => state.phase);
  const currentWave = useGameStateSelector(state => state.currentWave);
  const money = useGameStateSelector(state => state.money);
  
  const { restartGame } = useGameStore();
  
  const isWin = phase === 'WON';
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-800 to-gray-900">
      <h1 className={`text-6xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
        {isWin ? 'Victory!' : 'Game Over'}
      </h1>
      
      <div className="text-center mb-8">
        <p className="text-xl text-gray-300 mb-2">
          {isWin 
            ? 'Congratulations! You defended your base successfully!' 
            : `You were defeated on wave ${currentWave}.`
          }
        </p>
        
        <div className="text-lg text-gray-400 mt-4">
          <p>Final Score</p>
          <p className="text-3xl font-bold text-yellow-400">${money}</p>
          <p className="text-sm mt-1">Waves Completed: {isWin ? '10' : currentWave - 1}/10</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={restartGame}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105"
          aria-label="Play Again"
        >
          Play Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white text-xl font-semibold rounded-lg transition-colors duration-200"
          aria-label="Return to Main Menu"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
