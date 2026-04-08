# Task Packet

## Metadata
- Task ID: GAME-003
- Title: status-chip
- Priority: medium
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Add a visible HUD status chip so players can always see the current game state at a glance.

## Scope
- In: HUD text/status display, state updates for ready/playing/paused/game over/victory, and any small README control note if needed
- Out: gameplay rebalance, new mechanics, new menus, audio, or art redesign

## Likely Files/Modules
- `index.html`
- `styles.css`
- `game.js`

## Acceptance Criteria (testable)
1. The HUD shows a clear status label for at least `READY`, `PLAYING`, `PAUSED`, `GAME OVER`, and `VICTORY`.
2. The status label updates correctly when the game starts, pauses, resumes, ends, and restarts.
3. Existing controls and smoke-test behavior continue to work after the change.

## Test Plan
- Commands: reuse the browser smoke path and extend it if needed so the status label is checked through its state transitions
- Expected outcomes: the status chip reflects the current game state and existing smoke checks still pass

## Dependencies

Existing browser game and current smoke-test harness.

## Constraints

Keep the change minimal and consistent with the current visual design.

## Escalation Trigger

If the status chip requires a broader layout redesign or introduces state inconsistencies.

## Budget
- Time cap: 30 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
