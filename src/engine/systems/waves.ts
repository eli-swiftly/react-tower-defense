import type { Wave } from '../core/types';

export const WAVES: Wave[] = [
  // Wave 1 - Introduction
  {
    id: 1,
    entries: [
      { mobType: 'normal', count: 5, spacing: 1.5, delay: 0 }
    ],
    reward: 50
  },
  
  // Wave 2 - More normals
  {
    id: 2,
    entries: [
      { mobType: 'normal', count: 8, spacing: 1.2, delay: 0 }
    ],
    reward: 80
  },
  
  // Wave 3 - Introduction to fast mobs
  {
    id: 3,
    entries: [
      { mobType: 'normal', count: 5, spacing: 1.5, delay: 0 },
      { mobType: 'fast', count: 3, spacing: 1.0, delay: 5 }
    ],
    reward: 100
  },
  
  // Wave 4 - Mixed wave
  {
    id: 4,
    entries: [
      { mobType: 'fast', count: 5, spacing: 0.8, delay: 0 },
      { mobType: 'normal', count: 10, spacing: 1.0, delay: 3 }
    ],
    reward: 150
  },
  
  // Wave 5 - Introduction to tanks
  {
    id: 5,
    entries: [
      { mobType: 'tank', count: 2, spacing: 3.0, delay: 0 },
      { mobType: 'normal', count: 8, spacing: 0.8, delay: 2 },
      { mobType: 'fast', count: 4, spacing: 0.6, delay: 8 }
    ],
    reward: 200
  },
  
  // Wave 6 - Tank rush
  {
    id: 6,
    entries: [
      { mobType: 'tank', count: 5, spacing: 2.0, delay: 0 },
      { mobType: 'fast', count: 10, spacing: 0.5, delay: 5 }
    ],
    reward: 250
  },
  
  // Wave 7 - Swarm
  {
    id: 7,
    entries: [
      { mobType: 'normal', count: 20, spacing: 0.5, delay: 0 },
      { mobType: 'fast', count: 15, spacing: 0.4, delay: 5 },
      { mobType: 'tank', count: 3, spacing: 2.5, delay: 10 }
    ],
    reward: 300
  },
  
  // Wave 8 - Flying introduction
  {
    id: 8,
    entries: [
      { mobType: 'flying', count: 5, spacing: 1.5, delay: 0 },
      { mobType: 'tank', count: 4, spacing: 2.0, delay: 3 },
      { mobType: 'normal', count: 15, spacing: 0.6, delay: 8 }
    ],
    reward: 400
  },
  
  // Wave 9 - Mixed assault
  {
    id: 9,
    entries: [
      { mobType: 'flying', count: 8, spacing: 1.0, delay: 0 },
      { mobType: 'tank', count: 6, spacing: 1.5, delay: 2 },
      { mobType: 'fast', count: 20, spacing: 0.3, delay: 5 },
      { mobType: 'normal', count: 10, spacing: 0.8, delay: 10 }
    ],
    reward: 500
  },
  
  // Wave 10 - Final boss wave
  {
    id: 10,
    entries: [
      { mobType: 'tank', count: 10, spacing: 1.0, delay: 0 },
      { mobType: 'flying', count: 10, spacing: 0.8, delay: 5 },
      { mobType: 'fast', count: 25, spacing: 0.3, delay: 10 },
      { mobType: 'normal', count: 20, spacing: 0.5, delay: 15 }
    ],
    reward: 1000
  }
];

export function getWave(waveNumber: number): Wave | null {
  if (waveNumber < 1 || waveNumber > WAVES.length) return null;
  return WAVES[waveNumber - 1];
}

export function getWaveScaling(waveNumber: number): { hpMultiplier: number; bountyMultiplier: number } {
  // Progressive scaling for endless mode or custom waves
  const baseScaling = 1 + (waveNumber - 1) * 0.15;
  return {
    hpMultiplier: Math.pow(baseScaling, 1.2),
    bountyMultiplier: Math.pow(baseScaling, 0.8)
  };
}
