import type { GameState, Mob, Vec2 } from '../core/types';
import { distance, distanceSquared, velocityToward } from '../utils/math';
import { calculateDamage } from './combat';
import { TILE_SIZE } from '../core/constants';



export function updateProjectiles(state: GameState, dt: number): void {
  const projectilesToRemove: string[] = [];
  
  state.projectiles.forEach((projectile, id) => {
    // Store previous position for interpolation
    projectile.previousPosition = { ...projectile.position };
    
    // Get target
    const target = state.mobs.get(projectile.targetId);
    
    if (!target) {
      // Target died, remove projectile (or explode at last known position for splash)
      if (projectile.splashRadius) {
        applySplashDamage(state, projectile.targetLastPos, projectile.damage, projectile.splashRadius, projectile.effects);
      }
      projectilesToRemove.push(id);
      return;
    }
    
    // Update target's last known position
    projectile.targetLastPos = { ...target.position };
    
    // Get projectile speed from tower data
    const tower = state.towers.get(projectile.ownerId);
    if (!tower) {
      projectilesToRemove.push(id);
      return;
    }
    
    const projectileSpeed = tower.projectileSpeed || 10; // Default speed
    
    // Calculate velocity toward target
    projectile.velocity = velocityToward(projectile.position, target.position, projectileSpeed * TILE_SIZE);
    
    // Update position
    projectile.position.x += projectile.velocity.x * dt;
    projectile.position.y += projectile.velocity.y * dt;
    
    // Check collision with target
    const hitDistance = TILE_SIZE * 0.3; // Hit when within 30% of tile size
    if (distance(projectile.position, target.position) <= hitDistance) {
      // Hit target
      if (projectile.splashRadius) {
        applySplashDamage(state, target.position, projectile.damage, projectile.splashRadius, projectile.effects);
      } else {
        applyDirectDamage(target, projectile.damage, projectile.effects);
      }
      
      projectilesToRemove.push(id);
    }
  });
  
  // Remove hit projectiles
  projectilesToRemove.forEach(id => state.projectiles.delete(id));
}

export function processCollisions(state: GameState): void {
  // Collision detection is handled in updateProjectiles for simplicity
  // In a more complex system, this would be a separate spatial hashing system
  // state parameter is kept for interface consistency
  void state;
}

function applyDirectDamage(mob: Mob, damage: number, effects?: string[]): void {
  const actualDamage = calculateDamage(damage, mob.armor);
  mob.hp -= actualDamage;
  
  // Apply any effects
  if (effects) {
    applyEffects(mob, effects);
  }
}

function applySplashDamage(
  state: GameState, 
  center: Vec2, 
  damage: number, 
  radius: number,
  effects?: string[]
): void {
  const splashRadiusSq = (radius * TILE_SIZE) * (radius * TILE_SIZE);
  
  state.mobs.forEach(mob => {
    const distSq = distanceSquared(center, mob.position);
    if (distSq <= splashRadiusSq) {
      // Apply damage with falloff
      const falloff = 1 - Math.sqrt(distSq) / (radius * TILE_SIZE);
      const splashDamage = damage * Math.max(0.3, falloff); // Minimum 30% damage
      
      applyDirectDamage(mob, splashDamage, effects);
    }
  });
}

function applyEffects(mob: Mob, effectTypes: string[]): void {
  effectTypes.forEach(effectType => {
    switch (effectType) {
      case 'SLOW':
        // Slow effect is handled by frost towers directly
        break;
      case 'DOT':
        // Add damage over time effect
        mob.effects.push({
          type: 'DOT',
          duration: 3,
          remainingDuration: 3,
          value: 5 // 5 damage per second
        });
        break;
      case 'ARMOR_BREAK':
        // Temporarily reduce armor
        mob.effects.push({
          type: 'ARMOR_BREAK',
          duration: 5,
          remainingDuration: 5,
          value: 0.5 // 50% armor reduction
        });
        break;
    }
  });
}
