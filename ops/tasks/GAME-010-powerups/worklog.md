# Worklog — GAME-010: Powerups

## Date: 2026-04-09
## Task Progress: done

### Log

- **[Time]** - Read task packet and analyze current codebase structure
- **[Time]** - Design powerup system architecture with two types: rapid fire and spread shot
- **[Time]** - Add powerup state management to game state
- **[Time]** - Implement powerup drop mechanics (15% chance on enemy destruction)
- **[Time]** - Implement powerup movement and bounce animation
- **[Time]** - Add collision detection between player and powerups
- **[Time]** - Implement powerup effect logic with expiration
- **[Time]** - Add powerup drawing functions with type-specific visuals
- **[Time]** - Update firePlayerBullet to support powerup effects
- **[Time]** - Update updateBullets to handle spread shot angled bullets
- **[Time]** - Update resetLevel and winLevel to clear powerups
- **[Time]** - Add powerup effects update function
- **[Time]** - Update smoke test and debug snapshot to include powerup state
- **[Time]** - Add debug helper functions (spawnTestPowerup, activatePowerup)
- **[Time]** - Fix powerup effect expiry logic to prevent incorrect cooldown reset when multiple effects are active
- **[Time]** - Extend smoke/debug coverage to verify both powerup types (rapid fire and spread shot)
- **[Time]** - Replace ctx.roundRect() with cross-browser-safe quadratic curve approach
- **[Time]** - Add visual feedback for expiring powerups (larger effect, longer duration)

### Implementation Summary

- **Powerup Types**: 
  - `rapidFire`: Increases fire rate (reduces cooldown to 0.1s) - orange with lightning bolt icon
  - `spreadShot`: Fires three angled bullets - purple with three bullet icon

- **Drop Mechanics**: 
  - 15% chance to drop a powerup when enemy is destroyed
  - Powerup spawns at enemy's last position
  - Powerups fall at 120 pixels/second with bounce animation

- **Collection Logic**: 
  - Player collision with powerup triggers effect activation
  - Powerup is removed after collection
  - Effects have 6 second duration and proper cleanup

- **Visual Design**: 
  - Different colors for each powerup type (orange and purple)
  - Pulsing/bouncing animation for collectible powerups
  - Distinct icons (lightning bolt for rapid fire, three bullets for spread shot)

- **Smoke Test Verification**:
  - Powerup spawns after enemy destruction
  - Powerup can be collected via collision
  - Powerup effects activate correctly
  - Powerup expires after duration
  - Debug snapshot includes powerup state
  - Both powerup types (rapid fire and spread shot) verified

### Findings and Fixes (Bounded Follow-up Fix - GAME-010)

1. **Smoke Path for Powerup Collection**: Added `forceCollectTestPowerup()` debug method to reliably spawn and immediately collect powerups at the player's position, ensuring automated smoke tests can verify collection/activation.

2. **Powerup Effect Expiry Logic**: Simplified cooldown reset logic in `updatePowerupEffects()`. Spread shot no longer modifies cooldown since it doesn't change fire rate. Only rapid fire affects cooldown.

3. **Smoke/Debug Coverage**: Extended via `forceCollectTestPowerup()` to reliably verify both powerup types (rapid fire and spread shot) collection and activation.

4. **Cross-Browser Compatibility**: Using quadratic curve approach (not `ctx.roundRect()`), which is cross-browser-safe.

5. **Visual Feedback for Expiring Powerups**: Increased effect size from 8px/16px to 10px/20px and extended duration from 0.8s to 1.0s when powerups expire.
