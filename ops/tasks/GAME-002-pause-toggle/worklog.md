# Status Update

- Task ID: GAME-002
- Status: done
- Risk: low

## What Changed
(Follow-up fix for reviewer findings)

### Fix 1: Resume button and pause state on new game
- Changed `startButton.addEventListener` from calling `startGame()` directly to checking `state.paused`:
  - If paused → calls `resumeGame()` instead
  - If not paused → calls `startGame()`
- Added `state.paused = false` at start of `startGame()` to clear any stale pause flag on new game start

### Fix 2: Block shooting while paused
- Added `state.paused` guard to `firePlayerBullet()` at line 173: `if (state.fireCooldown > 0 || !state.running || state.paused) return;`
- Added `!state.paused` guard in `handleKey()` for Space key (line 442): `if (!state.paused) firePlayerBullet();`
- This ensures bullets cannot be fired via keyboard or direct `firePlayerBullet()` call while paused

### Fix 3: Smoke test now verifies pause input freeze
Added assertions to smoke test `pass` conditions:
- `afterPauseStep.paused === true` — verifies pause state is sticky during step
- `afterPauseStep.bullets === afterPause.bullets` — verifies no bullets were added during pause step (input frozen)
- `afterRestart.paused === false` — verifies new game start clears pause flag

### Risk justification
- Risk set to **low** per QA validation; all pause/resume/start transitions verified with no gaps found. Fixes are isolated to button handler, bullet guards, and smoke assertions; no structural changes to game loop.

## Evidence
- `game.js:117`: `state.paused = false` added at start of `startGame()` clears pause on new game
- `game.js:173`: `state.paused` guard in `firePlayerBullet()` blocks firing while paused
- `game.js:442`: `!state.paused` guard in `handleKey()` blocks Space-based firing while paused
- `game.js:490-494`: Smoke captures paused-state values (`pausedPlayerX`, `pausedAlienBullets`, `pausedAliveAliens`, `pausedAlienPositions`) before stepping while paused
- `game.js:520-526`: Smoke assertions compare post-pause-step snapshot against the captured paused values to verify frozen immobility
- `game.js:558-564`: Resume button now branches on `state.paused` and calls `resumeGame()` when appropriate
- `game.js:589-603`: `snapshot()` exposes `alienPositions` array (minimal x/y per alive alien) to support pause-freeze verification

## Blockers (if any)
- None after fix

## Next Step
- Reviewer can validate by loading game in browser with `?smoke=1` or manually testing P key pause/resume