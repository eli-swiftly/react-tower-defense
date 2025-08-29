import type { GameState, Tower, Mob, Projectile, TargetingStrategy } from '../core/types';
import { distanceSquared } from '../utils/math';
import { Grid } from './grid';
import { generateProjectileId } from '../utils/id';
import { MIN_DAMAGE } from '../core/constants';
// import towerData from '../../assets/data/towers.json'; // Available if needed

export function updateTowerTargeting(state: GameState): void {
  const grid = new Grid(state.grid.width, state.grid.height);
  
  state.towers.forEach(tower => {
    // Check if current target is still valid
    if (tower.targetId) {
      const target = state.mobs.get(tower.targetId);
      if (!target || !isInRange(tower, target, grid)) {
        tower.targetId = null;
      }
    }
    
    // Find new target if needed
    if (!tower.targetId) {
      tower.targetId = findTarget(tower, state.mobs, grid, tower.targetingStrategy);
    }
  });
}

export function processTowerAttacks(state: GameState, dt: number): void {
  const grid = new Grid(state.grid.width, state.grid.height);
  // dt parameter kept for interface consistency
  void dt;
  
  state.towers.forEach(tower => {
    if (!tower.targetId) return;
    
    const target = state.mobs.get(tower.targetId);
    if (!target) {
      tower.targetId = null;
      return;
    }
    
    // Check if tower can attack
    const timeSinceLastAttack = state.simulationTime - tower.lastAttackTime;
    const attackCooldown = 1 / tower.attackSpeed;
    
    if (timeSinceLastAttack >= attackCooldown) {
      // Fire projectile or instant hit
      if (tower.kind === 'frost') {
        // Instant hit with slow effect
        applyFrostAttack(target, tower);
      } else {
        // Create projectile
        createProjectile(state, tower, target, grid);
      }
      
      tower.lastAttackTime = state.simulationTime;
    }
  });
}

function findTarget(
  tower: Tower,
  mobs: Map<string, Mob>,
  grid: Grid,
  strategy: TargetingStrategy
): string | null {
  const towerWorldPos = grid.gridToWorld(tower.gridPos);
  const rangeSq = tower.range * grid.tileSize * tower.range * grid.tileSize;
  
  // Get all mobs in range
  const mobsInRange = Array.from(mobs.values()).filter(mob => {
    const distSq = distanceSquared(towerWorldPos, mob.position);
    return distSq <= rangeSq;
  });
  
  if (mobsInRange.length === 0) return null;
  
  // Apply targeting strategy
  switch (strategy) {
    case 'first':
      return mobsInRange.reduce((best, mob) => 
        mob.pathIndex > best.pathIndex || 
        (mob.pathIndex === best.pathIndex && mob.pathProgress > best.pathProgress)
          ? mob : best
      ).id;
      
    case 'last':
      return mobsInRange.reduce((best, mob) => 
        mob.pathIndex < best.pathIndex || 
        (mob.pathIndex === best.pathIndex && mob.pathProgress < best.pathProgress)
          ? mob : best
      ).id;
      
    case 'nearest':
      return mobsInRange.reduce((best, mob) => {
        const distA = distanceSquared(towerWorldPos, best.position);
        const distB = distanceSquared(towerWorldPos, mob.position);
        return distB < distA ? mob : best;
      }).id;
      
    case 'strongest':
      return mobsInRange.reduce((best, mob) => 
        mob.hp > best.hp ? mob : best
      ).id;
      
    case 'weakest':
      return mobsInRange.reduce((best, mob) => 
        mob.hp < best.hp ? mob : best
      ).id;
      
    default:
      return mobsInRange[0].id;
  }
}

function isInRange(tower: Tower, mob: Mob, grid: Grid): boolean {
  const towerWorldPos = grid.gridToWorld(tower.gridPos);
  const rangeSq = tower.range * grid.tileSize * tower.range * grid.tileSize;
  const distSq = distanceSquared(towerWorldPos, mob.position);
  return distSq <= rangeSq;
}

function createProjectile(state: GameState, tower: Tower, target: Mob, grid: Grid): void {
  const towerWorldPos = grid.gridToWorld(tower.gridPos);
  // Note: tierData is available if needed later
  // const towerDef = towerData[tower.kind];
  // const tierData = towerDef.tiers[tower.tier.toString() as keyof typeof towerDef.tiers];
  
  const projectile: Projectile = {
    id: generateProjectileId(),
    ownerId: tower.id,
    targetId: target.id,
    targetLastPos: { ...target.position },
    position: { ...towerWorldPos },
    velocity: { x: 0, y: 0 }, // Will be calculated in projectile update
    damage: tower.damage,
    splashRadius: tower.splashRadius,
    effects: tower.kind === 'frost' ? ['SLOW'] : undefined
  };
  
  state.projectiles.set(projectile.id, projectile);
}

function applyFrostAttack(mob: Mob, tower: Tower): void {
  // Apply damage
  const damage = calculateDamage(tower.damage, mob.armor);
  mob.hp -= damage;
  
  // Apply slow effect
  const existingSlowIndex = mob.effects.findIndex(e => e.type === 'SLOW');
  const slowEffect = {
    type: 'SLOW' as const,
    duration: 2, // 2 seconds
    remainingDuration: 2,
    value: 0.5, // 50% slow
    stackId: tower.id
  };
  
  if (existingSlowIndex >= 0) {
    // Refresh duration if same tower, or take stronger effect
    const existing = mob.effects[existingSlowIndex];
    if (existing.stackId === tower.id || slowEffect.value > existing.value) {
      mob.effects[existingSlowIndex] = slowEffect;
    }
  } else {
    mob.effects.push(slowEffect);
  }
}

export function calculateDamage(baseDamage: number, armor: number): number {
  return Math.max(MIN_DAMAGE, baseDamage - armor);
}
