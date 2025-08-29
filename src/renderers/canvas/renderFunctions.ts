import type { Grid as GridType, Tower, Mob, Projectile, GameState, GridCoord, Vec2, TowerKind } from '../../engine/core/types';
import { COLORS } from '../../engine/core/constants';
import { lerpVec2 } from '../../engine/utils/math';
import { Grid } from '../../engine/systems/grid';
import towerData from '../../assets/data/towers.json';

export function renderGrid(ctx: CanvasRenderingContext2D, grid: GridType): void {
  const { cells, width, height, tileSize } = grid;
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const cellType = cells[row][col];
      let color: string = COLORS.BUILDABLE;
      
      switch (cellType) {
        case 'PATH':
          color = COLORS.PATH;
          break;
        case 'BLOCKED':
          color = COLORS.BLOCKED;
          break;
        case 'SPAWN':
          color = COLORS.SPAWN;
          break;
        case 'BASE':
          color = COLORS.BASE;
          break;
        case 'TOWER':
          continue; // Towers are rendered separately
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

export function renderPath(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
  if (path.length < 2) return;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  
  ctx.stroke();
  ctx.setLineDash([]);
}

export function renderTowers(ctx: CanvasRenderingContext2D, towers: Map<string, Tower>, grid: GridType): void {
  const gridObj = new Grid(grid.width, grid.height, grid.tileSize);
  
  towers.forEach(tower => {
    const worldPos = gridObj.gridToWorld(tower.gridPos);
    const halfTile = grid.tileSize / 2;
    
    // Tower base
    let towerColor: string = COLORS.ARROW_TOWER;
    switch (tower.kind) {
      case 'cannon':
        towerColor = COLORS.CANNON_TOWER;
        break;
      case 'frost':
        towerColor = COLORS.FROST_TOWER;
        break;
    }
    
    ctx.fillStyle = towerColor;
    ctx.fillRect(
      worldPos.x - halfTile + 5,
      worldPos.y - halfTile + 5,
      grid.tileSize - 10,
      grid.tileSize - 10
    );
    
    // Tower tier indicator
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tower.tier.toString(), worldPos.x, worldPos.y);
    
    // Show targeting line to current target
    if (tower.targetId) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(worldPos.x, worldPos.y);
      // Target position will be drawn when we have access to mobs
      ctx.setLineDash([]);
    }
  });
}

export function renderMobs(ctx: CanvasRenderingContext2D, mobs: Map<string, Mob>, interpolation: number): void {
  mobs.forEach(mob => {
    // Interpolate position for smooth movement
    const interpolatedPos = mob.previousPosition 
      ? lerpVec2(mob.previousPosition, mob.position, interpolation)
      : mob.position;
    
    // Mob body
    let mobColor: string = COLORS.NORMAL_MOB;
    let mobSize = 15;
    
    switch (mob.type) {
      case 'fast':
        mobColor = COLORS.FAST_MOB;
        mobSize = 12;
        break;
      case 'tank':
        mobColor = COLORS.TANK_MOB;
        mobSize = 20;
        break;
      case 'flying':
        mobColor = COLORS.FLYING_MOB;
        mobSize = 14;
        break;
    }
    
    // Draw mob
    ctx.fillStyle = mobColor;
    ctx.beginPath();
    ctx.arc(interpolatedPos.x, interpolatedPos.y, mobSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw slow effect
    const slowEffect = mob.effects.find(e => e.type === 'SLOW');
    if (slowEffect) {
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Health bar
    const barWidth = 30;
    const barHeight = 4;
    const barY = interpolatedPos.y - mobSize - 10;
    
    // Background
    ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    ctx.fillRect(interpolatedPos.x - barWidth/2, barY, barWidth, barHeight);
    
    // Health fill
    const healthPercent = mob.hp / mob.maxHp;
    ctx.fillStyle = healthPercent > 0.5 ? COLORS.HEALTH_BAR_FG : 
                    healthPercent > 0.25 ? 'orange' : 'red';
    ctx.fillRect(interpolatedPos.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(interpolatedPos.x - barWidth/2, barY, barWidth, barHeight);
  });
}

export function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Map<string, Projectile>, interpolation: number): void {
  projectiles.forEach(projectile => {
    const interpolatedPos = projectile.previousPosition 
      ? lerpVec2(projectile.previousPosition, projectile.position, interpolation)
      : projectile.position;
    
    // Different projectile styles based on damage/type
    if (projectile.splashRadius) {
      // Cannon ball
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(interpolatedPos.x, interpolatedPos.y, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Arrow
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      // Draw line in direction of velocity
      const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
      const length = 10;
      ctx.moveTo(
        interpolatedPos.x - Math.cos(angle) * length/2,
        interpolatedPos.y - Math.sin(angle) * length/2
      );
      ctx.lineTo(
        interpolatedPos.x + Math.cos(angle) * length/2,
        interpolatedPos.y + Math.sin(angle) * length/2
      );
      ctx.stroke();
    }
  });
}

export function renderEffects(ctx: CanvasRenderingContext2D, gameState: GameState): void {
  // Render any visual effects like explosions, slow areas, etc.
  // For now, we'll keep this simple
  // Parameters kept for future implementation
  void ctx;
  void gameState;
}

export function renderBuildPreview(
  ctx: CanvasRenderingContext2D, 
  grid: GridType, 
  coord: GridCoord, 
  towerType: TowerKind,
  money: number
): void {
  const gridObj = new Grid(grid.width, grid.height, grid.tileSize);
  const worldPos = gridObj.gridToWorld(coord);
  const canPlace = gridObj.canPlaceTower(coord);
  const towerDef = towerData[towerType];
  const canAfford = money >= towerDef.baseCost;
  
  // Preview overlay
  ctx.fillStyle = canPlace && canAfford ? COLORS.VALID_PLACEMENT : COLORS.INVALID_PLACEMENT;
  ctx.fillRect(
    coord.col * grid.tileSize,
    coord.row * grid.tileSize,
    grid.tileSize,
    grid.tileSize
  );
  
  // Range preview
  if (canPlace && canAfford) {
    const range = towerDef.tiers[1].range * grid.tileSize;
    ctx.strokeStyle = COLORS.RANGE_INDICATOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(worldPos.x, worldPos.y, range, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function renderRangeIndicator(ctx: CanvasRenderingContext2D, tower: Tower, grid: GridType): void {
  const gridObj = new Grid(grid.width, grid.height, grid.tileSize);
  const worldPos = gridObj.gridToWorld(tower.gridPos);
  const range = tower.range * grid.tileSize;
  
  ctx.strokeStyle = COLORS.RANGE_INDICATOR;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(worldPos.x, worldPos.y, range, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
