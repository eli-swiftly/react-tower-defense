import type { GameState } from '../core/types';

export function cleanupDeadEntities(state: GameState): void {
  // Remove dead mobs and give bounty
  const deadMobs: string[] = [];
  
  state.mobs.forEach((mob, id) => {
    if (mob.hp <= 0) {
      deadMobs.push(id);
      // Award bounty
      state.money += mob.bounty;
    }
  });
  
  deadMobs.forEach(id => {
    state.mobs.delete(id);
    
    // Remove any projectiles targeting this mob
    state.projectiles.forEach((projectile) => {
      if (projectile.targetId === id) {
        // Let the projectile system handle cleanup
      }
    });
    
    // Update tower targets
    state.towers.forEach(tower => {
      if (tower.targetId === id) {
        tower.targetId = null;
      }
    });
  });
  
  // Clean up orphaned projectiles (handled in projectile system)
  
  // Clean up expired effects (handled in effects system)
}
