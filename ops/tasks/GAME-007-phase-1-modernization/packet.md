# Task Packet

## Metadata
- Task ID: GAME-007
- Title: Package existing Phase 1 UX and runtime modernization changes
- Priority: high
- Deadline: none
- Risk: medium
- Owner model: minimax-coding-plan/MiniMax-M2.7
- Reviewer model: opencode/minimax-m2.5-free
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Package and validate the existing local Phase 1 modernization diff so it can proceed through the repo workflow without additional direct implementation.

## Scope
- In:
  - Existing uncommitted changes in `game.js`, `index.html`, and `styles.css`
  - Player name and local high-score UI/persistence already added to the working tree
  - Phase 1 modernization already present in the working tree: sharper canvas sizing, focus handling, reduced-motion support, capability-based touch controls, and duplicate-render cleanup
  - Review and QA of the current diff against runtime evidence gates
- Out:
  - New gameplay mechanics beyond the current local diff
  - Phase 2 refactors such as splitting `game.js` into modules or systems
  - Visual redesign beyond the currently changed HUD/layout treatment

## Likely Files/Modules
- `game.js`
- `index.html`
- `styles.css`
- `ops/tasks/GAME-007-phase-1-modernization/*`

## Acceptance Criteria (testable)
1. The current local diff is fully represented by this task packet and remains limited to `game.js`, `index.html`, and `styles.css`, with workflow artifacts under `ops/tasks/GAME-007-phase-1-modernization/`.
2. Browser smoke verification passes using the exact command in the Test Plan, with `data-smoke="pass"` in the dumped DOM.
3. The packaged diff preserves all currently implemented Phase 1 outcomes:
   - player name input and persisted high scores are present
   - canvas is focusable and resized for sharper rendering
   - overlay/game focus transitions work through the existing start/pause/resume flow
   - reduced-motion and capability-based touch-control behavior remain present in code

## Test Plan
- Commands:
  - `python3 -m http.server 8000 >/tmp/space_invaders_http.log 2>&1 & SERVER_PID=$! && sleep 1 && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --dump-dom "http://127.0.0.1:8000/?smoke=1" && kill $SERVER_PID`
- Expected outcomes:
  - Dumped DOM contains `data-smoke="pass"`
  - Smoke report shows player name and high-score assertions passing
  - No blocker prevents the smoke run from completing

## Dependencies
- Local Chrome headless binary at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `python3`

## Constraints
- Do not expand scope beyond packaging and validating the existing local Phase 1 diff.
- Follow planner -> reviewer -> QA workflow for any next steps.
- Do not require a fresh reimplementation from a clean tree.

## Escalation Trigger
- Reviewer or QA finds a blocking regression in the existing diff.
- Runtime evidence gate cannot be satisfied with the smoke command above.

## Budget
- Time cap: 2 hours
- Attempt cap (max 2): 2
- Token/cost cap (optional):

## Runtime Evidence Gate (MUST be satisfied)
- [x] Execution commands provided in Test Plan
- [x] Output summary or screenshot proof attached
- [ ] Explicit blocker documented if execution failed

## Worker Output Contract (worker to complete)
- [ ] Investigation phase: findings and analysis
- [ ] Implementation actions taken with reasoning
- [ ] Validation steps performed

## QA Output Contract (QA to complete)
- [ ] Verification commands used
- [ ] Pass/fail per acceptance criterion
- [ ] Specific blockers or evidence gaps

## Rollback Note (if non-trivial change)
- Trigger: Review or QA finds a regression in the packaged local Phase 1 diff.
- Method: Revert the local changes in `game.js`, `index.html`, and `styles.css` together with any related task artifacts if the task is rejected.
- Owner: repository maintainer

## Security Scan
- Invoked: no
- Risk level scanned: n/a
- Findings: NONE
- Cleared: yes

## Completion Checklist (for reviewer)
- [ ] Acceptance criteria met with runtime evidence
- [ ] Tests updated where behavior changed
- [ ] Worker output contract satisfied
- [ ] QA verification completed with explicit pass/fail
- [ ] Security scan passed (if medium/high risk)
- [ ] Rollback note present (if non-trivial change)
