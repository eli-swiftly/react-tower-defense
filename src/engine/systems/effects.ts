import type { GameState, Mob, Effect } from '../core/types';

export function processEffects(state: GameState, dt: number): void {
  state.mobs.forEach(mob => {
    // Process each effect
    const effectsToRemove: number[] = [];
    
    mob.effects.forEach((effect, index) => {
      // Update duration
      effect.remainingDuration -= dt;
      
      if (effect.remainingDuration <= 0) {
        effectsToRemove.push(index);
        return;
      }
      
      // Apply effect
      switch (effect.type) {
        case 'DOT':
          // Apply damage over time
          mob.hp -= effect.value * dt;
          break;
          
        case 'ARMOR_BREAK':
          // Armor reduction is handled in damage calculation
          break;
          
        case 'SLOW':
          // Slow is handled in movement calculation
          break;
      }
    });
    
    // Remove expired effects
    effectsToRemove.reverse().forEach(index => {
      mob.effects.splice(index, 1);
    });
  });
}

export function applySlowEffect(mob: Mob, duration: number, strength: number, stackId?: string): void {
  const existingIndex = mob.effects.findIndex(e => 
    e.type === 'SLOW' && (!stackId || e.stackId === stackId)
  );
  
  const slowEffect: Effect = {
    type: 'SLOW',
    duration,
    remainingDuration: duration,
    value: strength,
    stackId
  };
  
  if (existingIndex >= 0) {
    // Refresh or replace existing effect
    const existing = mob.effects[existingIndex];
    if (!stackId || existing.stackId === stackId || slowEffect.value > existing.value) {
      mob.effects[existingIndex] = slowEffect;
    }
  } else {
    mob.effects.push(slowEffect);
  }
}

export function getEffectiveArmor(mob: Mob): number {
  let armor = mob.armor;
  
  // Apply armor break effects
  const armorBreaks = mob.effects.filter(e => e.type === 'ARMOR_BREAK');
  if (armorBreaks.length > 0) {
    // Use strongest armor break
    const strongestBreak = armorBreaks.reduce((max, effect) => 
      effect.value > max.value ? effect : max
    );
    
    armor *= (1 - strongestBreak.value);
  }
  
  return Math.max(0, armor);
}
