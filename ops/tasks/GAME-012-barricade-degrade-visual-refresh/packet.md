# Task Packet

## Metadata
- Task ID: GAME-012
- Title: Progressive barricade degradation and visual refresh
- Priority: high
- Deadline: TBD
- Risk: medium
- Owner model: omlx/qwen3-coder
- Reviewer model: TBD
- QA model: omlx/qwen3-coder

## Goal (1 sentence)
Make barricades visually degrade all the way to destruction under both player and alien fire, and modernize the game's presentation without changing core gameplay.

## Scope
- In:
  - Improve barricade rendering so damage accumulates visibly and consistently until each barricade is completely gone.
  - Ensure both player shots and alien shots produce the same progressive barricade degradation behavior.
  - Refresh the visual style of the HUD, playfield, overlays, and effects toward a more modern presentation.
  - Preserve desktop and mobile usability.
  - Validate through the existing smoke path and any practical visual checks.
- Out:
  - New gameplay mechanics, scoring changes, enemy behavior changes, or audio feature changes unless needed to support the new visuals.
  - Large dependency additions or external asset pipelines.

## Likely Files/Modules
- `game.js`
- `styles.css`
- `index.html`
- `README.md`

## Acceptance Criteria (testable)
1. Barricades visibly and progressively degrade from repeated damage and are fully removed visually when destroyed.
2. Both player bullets and alien bullets apply the same visual degradation rules to barricades.
3. The game has a noticeably more modern visual presentation while preserving responsive behavior on desktop and mobile.
4. Core gameplay remains unchanged apart from the intended visual/damage presentation.
5. The existing smoke path passes after the changes.

## Test Plan
- Commands:
  - Serve locally with `./serve.sh` or equivalent static HTTP server.
  - Run the smoke path against `/?smoke=1`.
  - Perform a brief browser spot-check of barricade damage and overall presentation.
- Expected outcomes:
  - Barricades show multiple visible damage states and disappear cleanly at zero health.
  - Damage presentation is consistent for both player and alien shots.
  - Layout and visuals remain usable on desktop and mobile.
  - Smoke report returns pass.

## Dependencies
- Existing browser runtime only unless a very small repo-local addition is clearly justified.

## Constraints
- Preserve current gameplay rules and controls.
- Keep the implementation minimal and repo-local.
- Do not break existing smoke validation or debug hooks.
- Avoid introducing generic or mismatched UI; refresh should fit the game and feel intentionally modern.

## Escalation Trigger
- Second implementation failure, security or data-integrity concern, or scope expansion into larger architecture/design planning.

## Budget
- Time cap: 1 focused implementation session plus validation
- Attempt cap (max 2): 2
- Token/cost cap (optional): TBD
