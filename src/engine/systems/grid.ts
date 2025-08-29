import type { CellType, GridCoord, Vec2, Grid as GridType } from '../core/types';
import { TILE_SIZE } from '../core/constants';

export class Grid {
  cells: CellType[][];
  width: number;
  height: number;
  tileSize: number;
  spawn: GridCoord;
  base: GridCoord;
  private cachedPath: Vec2[] | null = null;

  constructor(width: number, height: number, tileSize: number = TILE_SIZE) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.cells = this.initializeGrid();
    
    // Default spawn and base positions
    this.spawn = { row: Math.floor(height / 2), col: 0 };
    this.base = { row: Math.floor(height / 2), col: width - 1 };
    
    this.setupDefaultMap();
  }

  private initializeGrid(): CellType[][] {
    const grid: CellType[][] = [];
    for (let row = 0; row < this.height; row++) {
      grid[row] = [];
      for (let col = 0; col < this.width; col++) {
        grid[row][col] = 'BUILDABLE';
      }
    }
    return grid;
  }

  private setupDefaultMap(): void {
    // Create a simple S-shaped path
    const midRow = Math.floor(this.height / 2);
    
    // Horizontal path at middle
    for (let col = 0; col < this.width; col++) {
      this.cells[midRow][col] = 'PATH';
    }
    
    // Add some vertical segments for variety
    const quarter = Math.floor(this.width / 4);
    for (let row = 3; row <= midRow; row++) {
      this.cells[row][quarter] = 'PATH';
      this.cells[row][quarter * 3] = 'PATH';
    }
    
    // Connect vertical segments
    for (let col = quarter; col <= quarter * 3; col++) {
      this.cells[3][col] = 'PATH';
    }
    
    // Set spawn and base
    this.cells[this.spawn.row][this.spawn.col] = 'SPAWN';
    this.cells[this.base.row][this.base.col] = 'BASE';
    
    // Add some blocked cells for variety
    this.cells[1][5] = 'BLOCKED';
    this.cells[1][15] = 'BLOCKED';
    this.cells[this.height - 2][5] = 'BLOCKED';
    this.cells[this.height - 2][15] = 'BLOCKED';
    
    // Cache the initial path
    this.cachedPath = this.findPath(this.spawn, this.base);
  }

  isValidCoord(coord: GridCoord): boolean {
    return coord.row >= 0 && coord.row < this.height &&
           coord.col >= 0 && coord.col < this.width;
  }

  getCell(coord: GridCoord): CellType | null {
    if (!this.isValidCoord(coord)) return null;
    return this.cells[coord.row][coord.col];
  }

  setCell(coord: GridCoord, type: CellType): void {
    if (!this.isValidCoord(coord)) return;
    this.cells[coord.row][coord.col] = type;
    // Invalidate cached path when grid changes
    this.cachedPath = null;
  }

  canPlaceTower(coord: GridCoord): boolean {
    if (!this.isValidCoord(coord)) return false;
    
    const cellType = this.getCell(coord);
    if (cellType !== 'BUILDABLE') return false;
    
    // Temporarily place tower to check if path still exists
    this.cells[coord.row][coord.col] = 'TOWER';
    const pathExists = this.findPath(this.spawn, this.base) !== null;
    this.cells[coord.row][coord.col] = 'BUILDABLE';
    
    return pathExists;
  }

  worldToGrid(pos: Vec2): GridCoord {
    return {
      row: Math.floor(pos.y / this.tileSize),
      col: Math.floor(pos.x / this.tileSize)
    };
  }

  gridToWorld(coord: GridCoord): Vec2 {
    return {
      x: coord.col * this.tileSize + this.tileSize / 2,
      y: coord.row * this.tileSize + this.tileSize / 2
    };
  }

  getNeighbors(coord: GridCoord): GridCoord[] {
    const neighbors: GridCoord[] = [];
    const directions = [
      { row: -1, col: 0 },  // Up
      { row: 1, col: 0 },   // Down
      { row: 0, col: -1 },  // Left
      { row: 0, col: 1 }    // Right
    ];

    for (const dir of directions) {
      const neighbor = {
        row: coord.row + dir.row,
        col: coord.col + dir.col
      };
      
      if (this.isValidCoord(neighbor)) {
        const cellType = this.getCell(neighbor);
        if (cellType === 'PATH' || cellType === 'BASE' || cellType === 'SPAWN') {
          neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  // A* pathfinding implementation
  findPath(start: GridCoord, end: GridCoord): Vec2[] | null {
    // Return cached path if available and grid hasn't changed
    if (this.cachedPath && 
        start.row === this.spawn.row && start.col === this.spawn.col &&
        end.row === this.base.row && end.col === this.base.col) {
      return [...this.cachedPath];
    }

    interface Node {
      coord: GridCoord;
      g: number; // Cost from start
      h: number; // Heuristic cost to end
      f: number; // Total cost (g + h)
      parent: Node | null;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    
    const coordToKey = (c: GridCoord) => `${c.row},${c.col}`;
    const heuristic = (a: GridCoord, b: GridCoord) => 
      Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

    // Start node
    const startNode: Node = {
      coord: start,
      g: 0,
      h: heuristic(start, end),
      f: heuristic(start, end),
      parent: null
    };
    
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      
      // Check if we reached the goal
      if (current.coord.row === end.row && current.coord.col === end.col) {
        // Reconstruct path
        const path: Vec2[] = [];
        let node: Node | null = current;
        
        while (node) {
          path.unshift(this.gridToWorld(node.coord));
          node = node.parent;
        }
        
        return path;
      }

      closedSet.add(coordToKey(current.coord));

      // Check neighbors
      const neighbors = this.getNeighbors(current.coord);
      
      for (const neighborCoord of neighbors) {
        const key = coordToKey(neighborCoord);
        if (closedSet.has(key)) continue;

        const g = current.g + 1; // Cost to move to neighbor
        const h = heuristic(neighborCoord, end);
        const f = g + h;

        // Check if neighbor is already in open set
        const existingIndex = openSet.findIndex(
          n => n.coord.row === neighborCoord.row && n.coord.col === neighborCoord.col
        );

        if (existingIndex === -1) {
          // Add new node
          openSet.push({
            coord: neighborCoord,
            g,
            h,
            f,
            parent: current
          });
        } else if (g < openSet[existingIndex].g) {
          // Update existing node with better path
          openSet[existingIndex].g = g;
          openSet[existingIndex].f = f;
          openSet[existingIndex].parent = current;
        }
      }
    }

    // No path found
    return null;
  }

  getPath(): Vec2[] {
    if (!this.cachedPath) {
      this.cachedPath = this.findPath(this.spawn, this.base);
    }
    return this.cachedPath ? [...this.cachedPath] : [];
  }

  toJSON(): GridType {
    return {
      cells: this.cells,
      width: this.width,
      height: this.height,
      tileSize: this.tileSize,
      spawn: this.spawn,
      base: this.base
    };
  }
}
