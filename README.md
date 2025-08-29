# React Tower Defense

A performant tower defense game built with React, TypeScript, and Canvas rendering. Features deterministic gameplay, smooth 60 FPS performance, and full mobile support.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## 🎮 How to Play

### Objective
Defend your base from 10 waves of increasingly difficult enemies. If 20 enemies reach your base, you lose!

### Controls
- **Mouse**: Click to place towers and interact with UI
- **Keyboard Shortcuts**:
  - `Space` or `P`: Pause/Resume
  - `F`: Toggle fast forward (2x speed)
  - `1-3`: Select tower types (Arrow, Cannon, Frost)
  - `ESC`: Cancel tower placement
  - `Enter`: Start next wave early
  - `R`: Restart (on game over screen)

### Tower Types
1. **Arrow Tower** ($50)
   - Fast single-target damage
   - Good range and DPS
   - Best for consistent damage

2. **Cannon Tower** ($100)
   - Area of effect damage
   - Slower attack speed
   - Excellent against groups

3. **Frost Tower** ($75)
   - Slows enemies by 50%
   - Low damage but great utility
   - Stacks well with other towers

### Enemy Types
- **Normal** (Red): Balanced stats
- **Fast** (Yellow): High speed, low health
- **Tank** (Purple): High health, has armor
- **Flying** (Blue): Ignores some path constraints

## 🏗️ Architecture

### Project Structure
```
/src
  /engine        # Pure TypeScript game logic (no React)
    /core        # Types and constants
    /systems     # Game systems (grid, combat, movement)
    /utils       # Math and utility functions
  /renderers     # Canvas rendering logic
  /ui           # React components
  /state        # Zustand store
  /assets       # Game data (towers, mobs, waves)
```

### Key Design Decisions

#### Fixed Timestep Simulation
The game runs at a fixed 60Hz simulation rate with interpolation for smooth rendering:
- Deterministic gameplay
- Consistent physics regardless of frame rate
- Clean separation between logic and rendering

#### Pure Functional Engine
The game engine is completely separate from React:
- All game logic is pure functions
- State updates use Immer for immutability
- Easy to test and reason about

#### Performance Optimizations
- Canvas rendering outside React reconciliation
- Spatial hashing for collision detection (planned)
- Object pooling for projectiles (planned)
- Minimal React re-renders using Zustand

### Game Rules

#### Targeting
Towers use a "first in path" targeting strategy by default, prioritizing enemies closest to the base.

#### Damage Calculation
```
effectiveDamage = max(1, baseDamage - armor)
```
Minimum 1 damage ensures all attacks have effect.

#### Slow Stacking
Multiple slow effects don't stack - only the strongest applies. Minimum speed is 40% of base speed.

## 🎯 Performance

### Targets
- 60 FPS on mid-range devices (Moto G class)
- Main thread tasks < 50ms
- Stable memory usage over 10+ minute sessions

### Optimizations
- RequestAnimationFrame with fixed timestep accumulator
- Canvas rendering with device pixel ratio support
- Efficient collision detection
- Minimal DOM updates

## ♿ Accessibility

- All UI elements have ARIA labels
- Full keyboard navigation support
- Focus indicators on interactive elements
- Respects `prefers-reduced-motion`
- High contrast colors for visibility

## 🧪 Testing

Run tests with:
```bash
npm run test
```

### Test Coverage
- Unit tests for game mechanics
- Integration tests for state management
- E2E test for core gameplay loop

## 📱 Mobile Support

- Responsive canvas sizing
- Touch controls
- Optimized for 360px minimum width
- Performance tested on mobile devices

## 🚧 Future Enhancements

- Multiple paths and advanced pathfinding
- More tower types and upgrade paths
- Boss enemies with special abilities
- Achievements and progression system
- Map editor with shareable levels
- Multiplayer support

## 📄 License

MIT