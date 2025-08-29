import React from 'react';
import { useGameStore } from '../../state/store';

export const MainMenu: React.FC = () => {
  const startGame = useGameStore(state => state.startGame);
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-800 to-gray-900">
      <h1 className="text-6xl font-bold text-white mb-4">Tower Defense</h1>
      <p className="text-xl text-gray-300 mb-8">Defend your base from waves of enemies!</p>
      
      <button
        onClick={startGame}
        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105"
        aria-label="Start Game"
      >
        Start Game
      </button>
      
      <div className="mt-12 text-gray-400 text-center max-w-md">
        <h2 className="text-lg font-semibold mb-2">How to Play:</h2>
        <ul className="text-sm space-y-1">
          <li>• Build towers to defend your base</li>
          <li>• Defeat all 10 waves to win</li>
          <li>• Use keyboard shortcuts: Space to pause, F for fast forward</li>
          <li>• Upgrade towers for more power</li>
        </ul>
      </div>
    </div>
  );
};
