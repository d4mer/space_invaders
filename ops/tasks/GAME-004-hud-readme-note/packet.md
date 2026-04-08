# Task Packet

## Metadata
- Task ID: GAME-004
- Title: hud-readme-note
- Priority: low
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Add one short README note explaining that the HUD status chip reflects the current game state.

## Scope
- In: `README.md` and `ops/tasks/GAME-004-hud-readme-note/`
- Out: game logic, styles, controls, or any gameplay changes

## Likely Files/Modules
- `README.md`
- `ops/tasks/GAME-004-hud-readme-note/`

## Acceptance Criteria (testable)
1. `README.md` mentions that the HUD status chip reflects the live game state.
2. The task artifacts record implementation, review, and QA outcomes.
3. The change remains documentation-only and low risk.

## Test Plan
- Commands: `grep -n "status chip\|HUD" README.md`, `./ops/scripts/heartbeat-report.sh`
- Expected outcomes: README contains the new note and heartbeat continues to report task state correctly

## Dependencies

Existing README and SOP task scaffold.

## Constraints

Keep the change to a single concise documentation note plus task artifacts.

## Escalation Trigger

If the README note requires broader documentation restructuring.

## Budget
- Time cap: 15 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
