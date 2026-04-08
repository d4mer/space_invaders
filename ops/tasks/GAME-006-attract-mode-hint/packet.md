# Task Packet

## Metadata
- Task ID: GAME-006
- Title: attract-mode-hint
- Priority: medium
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Add a clearer idle/start overlay hint so new players immediately see that Space fires the ship.

## Scope
- In: start/idle overlay copy and any minimal smoke-test updates needed to verify the hint is present
- Out: gameplay mechanics, controls logic, styling overhaul, or additional tutorial screens

## Likely Files/Modules
- `index.html`
- `game.js`
- `ops/tasks/GAME-006-attract-mode-hint/`

## Acceptance Criteria (testable)
1. The idle/start overlay explicitly mentions `Space` as the fire control.
2. Existing start/pause/restart/gameplay smoke behavior remains intact.
3. Task artifacts record implementation, review, and QA results.

## Test Plan
- Commands: use the browser smoke path or equivalent verification to confirm the overlay hint text is present, and ensure existing smoke checks still pass
- Expected outcomes: the overlay text mentions the fire control and existing gameplay smoke behavior remains valid

## Dependencies

Existing overlay markup and browser smoke path.

## Constraints

Keep the change minimal and copy-focused.

## Escalation Trigger

If the hint requires broader onboarding UI changes.

## Budget
- Time cap: 20 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
