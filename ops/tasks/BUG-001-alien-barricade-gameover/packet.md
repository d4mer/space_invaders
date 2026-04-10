# Task Packet

## Metadata
- Task ID: BUG-001
- Title: alien-barricade-gameover
- Priority: high
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3-coder
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Fix the loss-condition bug so aliens reaching the barricade/base line reliably end the game instead of passing over the barricades.

## Scope
- In: alien advance/loss-condition logic, barricade overlap handling, and automated verification for the loss trigger
- Out: gameplay rebalancing, barrier health tuning, enemy AI changes unrelated to the loss condition, or visual redesign

## Likely Files/Modules
- `game.js`
- `ops/tasks/BUG-001-alien-barricade-gameover/`

## Acceptance Criteria (testable)
1. When any living alien reaches the barricade/base threshold, the game transitions to a loss state.
2. The loss state updates the overlay and HUD correctly and remains compatible with restart behavior.
3. Existing pause, restart, and smoke/debug paths still work after the fix.
4. Task artifacts record a clear repro, fix summary, and verification evidence.

## Test Plan
- Commands: reproduce the bug in-browser or via debug hooks, then extend the smoke/debug path so the alien-overrun/loss transition is exercised automatically
- Expected outcomes: aliens reaching the barricade/base line trigger `GAME OVER`, and restart still resets the game cleanly

## Dependencies
- Existing alien movement/update loop, loss-condition handling, and browser smoke/debug hooks.

## Constraints
- Keep implementation framework-free
- Maintain existing visual style
- No additional dependencies

## Escalation Trigger
- If the loss trigger conflicts with intended win/pause/restart flow
- If automated verification requires a broader smoke-test rewrite

## Reproduction

1. Start the game and let the aliens descend to the barricade line.
2. Observe that the game continues even when aliens overlap or pass the barricades.

Expected:
- The game ends as soon as aliens reach the barricade/base threshold.

Actual:
- Aliens pass over the barricades without ending the game.

## Budget
- Time cap: 30 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
