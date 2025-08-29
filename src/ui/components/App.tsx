import React from 'react';
import { GameContainer } from './GameContainer';
import { MainMenu } from './MainMenu';
import { GameOverScreen } from './GameOverScreen';
import { useGameStateSelector } from '../hooks/useGameState';
import { useKeyboardControls } from '../hooks/useKeyboard';

export const App: React.FC = () => {
  const phase = useGameStateSelector(state => state.phase);
  
  // Initialize keyboard controls only
  useKeyboardControls();
  
  return (
    <div className="w-screen h-screen bg-gray-900 overflow-hidden">
      {phase === 'MENU' && <MainMenu />}
      {phase === 'PLAYING' && <GameContainer />}
      {(phase === 'WON' || phase === 'LOST') && <GameOverScreen />}
    </div>
  );
};
