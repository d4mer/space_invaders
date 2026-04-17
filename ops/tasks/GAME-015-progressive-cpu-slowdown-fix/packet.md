# Task Packet

## Metadata
- Task ID: GAME-015
- Title: Progressive CPU slowdown during gameplay
- Priority: high
- Deadline: TBD
- Risk: medium
- Owner model: omlx/qwen3.5-35b
- Reviewer model: opencode/minimax-m2.5-free
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Identify and fix the dominant cause(s) of progressive CPU/performance degradation that accumulates over time during an extended gameplay session.

## Scope
- In:
  - Investigate and fix runtime performance degradation that worsens as gameplay continues (not initial load cost).
  - Focus on memory leaks, unbounded accumulation of objects, and per-frame allocation churn that grows over time.
  - Preserve current controls, collision behavior, smoke hooks, and core gameplay rules.
  - Validate with the existing smoke path and practical runtime checks.
- Out:
  - New gameplay systems, scoring changes, enemy AI changes, or unrelated audio redesign.
  - Large dependency additions or moving the game off the current repo-local architecture.
  - Visual polish, art changes, or UI redesign unrelated to the performance fix.

## Likely Files/Modules
- `game.js`

## Acceptance Criteria (testable)
1. The dominant cause(s) of progressive CPU/performance slowdown over time are identified and documented in worklog/result.
2. Gameplay no longer shows the same obvious progressive slowdown during an extended play session or equivalent reproducible scenario.
3. Existing controls, gameplay rules, and smoke/debug path remain intact.
4. The existing smoke path passes after the changes (`/?smoke=1` returns pass).
5. Changes stay narrowly focused on CPU/performance degradation, not unrelated feature or art changes.

## Test Plan
- Commands:
  - Serve locally with `./serve.sh` or equivalent static HTTP server.
  - Run the smoke path against `/?smoke=1`.
  - Perform a browser runtime spot-check: play for 5+ minutes, observe CPU usage and frame responsiveness.
- Expected outcomes:
  - Smoke report returns pass.
  - CPU usage remains stable during extended play (no visible growth over time).
  - Frame responsiveness stays consistent throughout the session.

## Dependencies
- Existing browser runtime only unless a very small repo-local addition is clearly justified.

## Constraints
- Preserve current gameplay rules and balance.
- Keep changes minimal and repo-local.
- Avoid large rewrites and new dependencies.
- Focus on over-time CPU growth/regression, not general aesthetics.

## Escalation Trigger
- Cannot isolate a dominant hotspot after thorough investigation.
- Fix would require architectural rewrite of the game loop or rendering pipeline.
- Tests/verification cannot be completed with available environment.

## Budget
- Time cap: 1 focused investigation/fix session plus validation
- Attempt cap (max 2): 2
- Token/cost cap (optional): TBD

## Runtime Evidence Gate (MUST be satisfied)
- [ ] Execution commands provided in Test Plan
- [ ] Output summary or screenshot proof attached
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
- Trigger: Smoke test fails or gameplay behavior regresses after the fix.
- Method: `git checkout HEAD -- game.js` to revert to pre-fix state.
- Owner: Worker or reviewer.

## Security Scan
- Invoked: no
- Risk level scanned: N/A
- Findings: NONE
- Cleared: yes

## Completion Checklist (for reviewer)
- [ ] Acceptance criteria met with runtime evidence
- [ ] Tests updated where behavior changed
- [ ] Worker output contract satisfied
- [ ] QA verification completed with explicit pass/fail
- [ ] Security scan passed (if medium/high risk)
- [ ] Rollback note present (if non-trivial change)
