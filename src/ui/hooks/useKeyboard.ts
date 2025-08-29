import { useEffect } from 'react';
import { useGameStore } from '../../state/store';
import { useGameStateSelector } from './useGameState';

export function useKeyboardControls() {
  const { 
    pauseGame, 
    resumeGame, 
    setGameSpeed,
    selectTowerType,
    startNextWave,
    restartGame
  } = useGameStore();
  
  const isPaused = useGameStateSelector(state => state.isPaused);
  const gameSpeed = useGameStateSelector(state => state.gameSpeed);
  const phase = useGameStateSelector(state => state.phase);
  const isWaveActive = useGameStateSelector(state => state.isWaveActive);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'p':
          e.preventDefault();
          if (phase === 'PLAYING') {
            if (isPaused) {
              resumeGame();
            } else {
              pauseGame();
            }
          }
          break;
          
        case 'f':
          if (phase === 'PLAYING') {
            setGameSpeed(gameSpeed === 1 ? 2 : 1);
          }
          break;
          
        case '1':
          if (phase === 'PLAYING') {
            selectTowerType('arrow');
          }
          break;
          
        case '2':
          if (phase === 'PLAYING') {
            selectTowerType('cannon');
          }
          break;
          
        case '3':
          if (phase === 'PLAYING') {
            selectTowerType('frost');
          }
          break;
          
        case 'escape':
          if (phase === 'PLAYING') {
            selectTowerType(null);
          }
          break;
          
        case 'enter':
          if (phase === 'PLAYING' && !isWaveActive) {
            startNextWave();
          }
          break;
          
        case 'r':
          if (phase === 'WON' || phase === 'LOST') {
            restartGame();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    isPaused, 
    gameSpeed, 
    phase, 
    isWaveActive,
    pauseGame, 
    resumeGame, 
    setGameSpeed, 
    selectTowerType,
    startNextWave,
    restartGame
  ]);
}
