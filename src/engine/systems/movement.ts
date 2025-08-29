import type { GameState, Mob, Vec2 } from '../core/types';
import { distance, lerp } from '../utils/math';
import { SLOW_MIN_SPEED_MULTIPLIER } from '../core/constants';

export function updateMobMovement(state: GameState, dt: number): void {
  const mobsToRemove: string[] = [];
  
  state.mobs.forEach((mob, id) => {
    // Store previous position for interpolation
    mob.previousPosition = { ...mob.position };
    
    // Calculate effective speed with slow effects
    const effectiveSpeed = calculateEffectiveSpeed(mob);
    
    // Move along path
    const moved = moveAlongPath(mob, state.path, effectiveSpeed * dt);
    
    // Check if mob reached the base
    if (!moved) {
      // Mob reached the end
      state.lives--;
      mobsToRemove.push(id);
    }
  });
  
  // Remove mobs that reached the base
  mobsToRemove.forEach(id => state.mobs.delete(id));
}

function calculateEffectiveSpeed(mob: Mob): number {
  let speed = mob.speed;
  
  // Apply slow effects
  const slowEffects = mob.effects.filter(e => e.type === 'SLOW');
  if (slowEffects.length > 0) {
    // Use the strongest slow effect
    const strongestSlow = slowEffects.reduce((max, effect) => 
      effect.value > max.value ? effect : max
    );
    
    const slowMultiplier = 1 - strongestSlow.value;
    speed *= Math.max(slowMultiplier, SLOW_MIN_SPEED_MULTIPLIER);
  }
  
  return speed;
}

function moveAlongPath(mob: Mob, path: Vec2[], moveDistance: number): boolean {
  if (!path || path.length === 0) return false;
  if (mob.pathIndex >= path.length - 1) return false;
  
  let remainingDistance = moveDistance;
  
  while (remainingDistance > 0 && mob.pathIndex < path.length - 1) {
    const currentPoint = path[mob.pathIndex];
    const nextPoint = path[mob.pathIndex + 1];
    
    const segmentLength = distance(currentPoint, nextPoint);
    const remainingInSegment = segmentLength * (1 - mob.pathProgress);
    
    if (remainingDistance >= remainingInSegment) {
      // Move to next segment
      remainingDistance -= remainingInSegment;
      mob.pathIndex++;
      mob.pathProgress = 0;
      
      if (mob.pathIndex >= path.length - 1) {
        // Reached the end
        mob.position = { ...path[path.length - 1] };
        return false;
      }
    } else {
      // Move within current segment
      const moveProgress = remainingDistance / segmentLength;
      mob.pathProgress += moveProgress;
      mob.pathProgress = Math.min(mob.pathProgress, 1);
      
      // Update position
      const current = path[mob.pathIndex];
      const next = path[mob.pathIndex + 1];
      mob.position.x = lerp(current.x, next.x, mob.pathProgress);
      mob.position.y = lerp(current.y, next.y, mob.pathProgress);
      
      remainingDistance = 0;
    }
  }
  
  return true;
}
