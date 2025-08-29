import { Grid } from '../systems/grid';
import type { Grid as GridType } from '../core/types';

/**
 * Creates a Grid instance from frozen state data
 * Ensures cells are mutable by deep copying the arrays
 */
export function createGridFromState(gridState: GridType): Grid {
  const grid = new Grid(gridState.width, gridState.height, gridState.tileSize);
  
  // Deep copy cells to ensure they're mutable
  grid.cells = gridState.cells.map(row => [...row]);
  
  // Copy spawn and base coordinates
  grid.spawn = { ...gridState.spawn };
  grid.base = { ...gridState.base };
  
  return grid;
}
