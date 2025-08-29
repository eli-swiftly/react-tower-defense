import { nanoid } from 'nanoid';

export function generateId(prefix?: string): string {
  const id = nanoid(8);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateMobId(): string {
  return generateId('mob');
}

export function generateTowerId(): string {
  return generateId('tower');
}

export function generateProjectileId(): string {
  return generateId('proj');
}
