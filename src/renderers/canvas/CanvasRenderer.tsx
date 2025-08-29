import React, { useRef, useEffect, useState } from 'react';
import type { GameState, GridCoord } from '../../engine/core/types';
import { 
  renderGrid, 
  renderPath, 
  renderTowers, 
  renderMobs, 
  renderProjectiles, 
  renderEffects,
  renderBuildPreview,
  renderRangeIndicator
} from './renderFunctions';
import { useResponsiveCanvas } from '../../ui/hooks/useResponsive';
import { Grid } from '../../engine/systems/grid';

interface CanvasRendererProps {
  gameState: GameState;
  onTileClick?: (coord: GridCoord) => void;
  onTileHover?: (coord: GridCoord | null) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  gameState, 
  onTileClick,
  onTileHover 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [hoveredCoord, setHoveredCoord] = useState<GridCoord | null>(null);
  
  // Make canvas responsive
  useResponsiveCanvas(canvasRef);
  
  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const grid = new Grid(gameState.grid.width, gameState.grid.height, gameState.grid.tileSize);
    
    const getCoordFromMouse = (e: MouseEvent): GridCoord => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      return grid.worldToGrid({ x, y });
    };
    
    const handleClick = (e: MouseEvent) => {
      const coord = getCoordFromMouse(e);
      if (grid.isValidCoord(coord) && onTileClick) {
        onTileClick(coord);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const coord = getCoordFromMouse(e);
      if (grid.isValidCoord(coord)) {
        setHoveredCoord(coord);
        if (onTileHover) onTileHover(coord);
      } else {
        setHoveredCoord(null);
        if (onTileHover) onTileHover(null);
      }
    };
    
    const handleMouseLeave = () => {
      setHoveredCoord(null);
      if (onTileHover) onTileHover(null);
    };
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gameState.grid, onTileClick, onTileHover]);
  
  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();
      
      // Get device pixel ratio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== 1) {
        ctx.scale(1/dpr, 1/dpr);
      }
      
      // Render layers in order
      renderGrid(ctx, gameState.grid);
      renderPath(ctx, gameState.path);
      
      // Render build preview if placing tower
      if (gameState.selectedTowerType && hoveredCoord) {
        renderBuildPreview(ctx, gameState.grid, hoveredCoord, gameState.selectedTowerType, gameState.money);
      }
      
      // Render towers and their ranges
      renderTowers(ctx, gameState.towers, gameState.grid);
      
      // Show range for selected tower
      if (gameState.selectedTowerId) {
        const tower = gameState.towers.get(gameState.selectedTowerId);
        if (tower) {
          renderRangeIndicator(ctx, tower, gameState.grid);
        }
      }
      
      // Render entities with interpolation
      renderMobs(ctx, gameState.mobs, gameState.deltaAccumulator);
      renderProjectiles(ctx, gameState.projectiles, gameState.deltaAccumulator);
      renderEffects(ctx, gameState);
      
      // Restore context
      ctx.restore();
      
      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, hoveredCoord]);
  
  return (
    <canvas
      ref={canvasRef}
      className="game-canvas w-full h-full cursor-pointer"
      style={{ 
        imageRendering: 'crisp-edges',
        touchAction: 'none' 
      }}
    />
  );
};
