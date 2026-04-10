# Task Packet

## Metadata
- Task ID: GAME-014
- Title: Restore gameplay performance and playability
- Priority: high
- Deadline: TBD
- Risk: high
- Owner model: openai/gpt-5.4
- Reviewer model: TBD
- QA model: openai/gpt-5.4

## Goal (1 sentence)
Identify and remove the main runtime performance bottlenecks so the game feels responsive and playable again while preserving current functionality.

## Scope
- In:
  - Investigate the current frame-time/playability regression in the browser game.
  - Optimize the main hotspots in rendering or update work.
  - Preserve the current retro barricade direction and existing gameplay behavior.
  - Keep smoke coverage passing.
  - Work safely in a dirty tree that already contains uncommitted `GAME-013` changes.
- Out:
  - New gameplay features, scoring changes, or design/system rewrites.
  - Large dependency additions.

## Likely Files/Modules
- `game.js`
- `ops/tasks/GAME-013-retro-barricades-performance-fix/*`
- `ops/tasks/GAME-014-performance-playability-fix/*`

## Acceptance Criteria (testable)
1. The main performance bottleneck(s) are identified and reduced enough that gameplay no longer feels unplayably slow in normal runtime use.
2. Current gameplay behavior, controls, and debug hooks remain intact.
3. The existing smoke path passes after the performance changes.
4. The solution avoids unnecessary expensive per-frame work where practical.

## Test Plan
- Commands:
  - Serve locally with `./serve.sh` or equivalent static HTTP server.
  - Run the smoke path against `/?smoke=1`.
  - Perform a practical runtime playability check focused on movement/combat responsiveness.
- Expected outcomes:
  - Gameplay feels responsive again.
  - Smoke report returns pass.

## Dependencies
- Existing browser runtime only unless a very small repo-local addition is clearly justified.

## Constraints
- Do not revert the in-progress `GAME-013` direction unless necessary to restore playability.
- Prefer simple rendering/update paths over expensive effects.
- Preserve current controls, smoke hooks, and game rules.
- Keep changes minimal and focused on performance.

## Escalation Trigger
- Second implementation failure, inability to identify the dominant hotspot, or scope expansion into larger architecture/design planning.

## Budget
- Time cap: 1 focused investigation/fix session plus validation
- Attempt cap (max 2): 2
- Token/cost cap (optional): TBD
