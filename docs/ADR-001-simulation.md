# ADR-001: Fixed Timestep Simulation Architecture

## Status
Accepted

## Context
Building a tower defense game requires consistent, predictable gameplay mechanics. The simulation needs to:
- Handle complex interactions between hundreds of entities
- Maintain 60 FPS on mid-range devices
- Support deterministic gameplay for potential replays
- Allow speed multipliers without affecting game logic
- Provide smooth visual experience despite discrete simulation steps

## Decision
We will use a **fixed timestep simulation** running at 60Hz with interpolation for rendering.

### Implementation Details

1. **Fixed Timestep (60Hz)**
   - Simulation runs at exactly 16.667ms intervals
   - All game logic updates in discrete, consistent steps
   - Physics and gameplay are frame-rate independent

2. **Accumulator Pattern**
   ```typescript
   accumulator += deltaTime;
   while (accumulator >= TICK_DURATION) {
     tick(state, TICK_DURATION);
     accumulator -= TICK_DURATION;
   }
   ```

3. **Interpolation**
   - Store previous positions for all moving entities
   - Interpolate visual positions based on accumulator remainder
   - Provides smooth movement between fixed steps

4. **Pure Functional Updates**
   - Each tick is a pure function: `(state, dt) => newState`
   - Uses Immer for immutable updates
   - No side effects in simulation code

## Consequences

### Positive
- **Deterministic**: Same inputs always produce same outputs
- **Stable**: Consistent behavior regardless of frame rate
- **Testable**: Pure functions are easy to unit test
- **Replayable**: Can recreate games from input sequences
- **Performance**: Can optimize knowing exact tick rate

### Negative
- **Complexity**: Interpolation adds implementation complexity
- **Input Delay**: Maximum 16.67ms input latency
- **Memory**: Need to store previous states for interpolation

## Alternatives Considered

1. **Variable Timestep**
   - Simpler implementation
   - Rejected due to non-deterministic behavior
   - Physics can break at low frame rates

2. **Fixed Update in React**
   - Would couple simulation to React lifecycle
   - Rejected for performance and separation of concerns

3. **Web Worker Simulation**
   - Would eliminate main thread blocking
   - Deferred as optimization for future version

## Implementation Notes

### Tick Rate Choice (60Hz)
- Matches common display refresh rates
- Provides responsive controls
- Reasonable computational overhead
- Standard in many game engines

### Collision Detection
- Projectile-mob collisions use simple distance checks
- Tower range checks use squared distance for performance
- Spatial hashing considered for future optimization

### Targeting Policy
- **Current**: "First in path" - targets enemy closest to base
- **Rationale**: Simple, predictable, performs well
- **Future**: Configurable strategies per tower

### Armor Formula
```
damage = max(1, baseDamage - armor)
```
- Flat reduction with minimum 1 damage
- Ensures all attacks have effect
- Simple to understand and balance

### Slow Stacking
- Only strongest slow effect applies
- Minimum speed: 40% of base
- Prevents complete immobilization
- Maintains game flow

## Performance Considerations

### Current Optimizations
- Canvas rendering outside React
- Minimal React re-renders
- Efficient data structures (Maps vs Arrays)
- Interpolation only for visible entities

### Future Optimizations
- Object pooling for projectiles/effects
- Spatial hashing for range queries
- Dirty rectangle rendering
- Web Worker for simulation

## References
- [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)
- [Game Programming Patterns - Game Loop](https://gameprogrammingpatterns.com/game-loop.html)
- [Interpolation in Games](https://www.kinematicsoup.com/news/2016/8/9/rrypp5tkubynjwxhxjzd42s3o034o8)
