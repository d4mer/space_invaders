# Task Packet

## Metadata
- Task ID: GAME-005
- Title: controls-readme-note
- Priority: low
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Add one short README note that the `P` key pauses or resumes the game during play.

## Scope
- In: `README.md` and `ops/tasks/GAME-005-controls-readme-note/`
- Out: game code, styles, controls logic, and any non-documentation changes

## Likely Files/Modules
- `README.md`
- `ops/tasks/GAME-005-controls-readme-note/`

## Acceptance Criteria (testable)
1. `README.md` contains a short note that `P` pauses or resumes the game during play.
2. Task artifacts record implementation and review outcome.
3. The change remains documentation-only and low risk.

## Test Plan
- Commands: `grep -n "pause or resumes the game\|P" README.md`, `./ops/scripts/heartbeat-report.sh`
- Expected outcomes: README contains the new note and heartbeat still reports task state correctly

## Dependencies

Existing README documentation.

## Constraints

Keep the change to a single concise note plus task artifacts.

## Escalation Trigger

If the documentation note requires larger README restructuring.

## Budget
- Time cap: 15 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
