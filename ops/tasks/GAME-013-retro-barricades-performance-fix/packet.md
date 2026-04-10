# Task Packet

## Metadata
- Task ID: GAME-013
- Title: Retro barricade erosion and performance recovery
- Priority: high
- Deadline: TBD
- Risk: high
- Owner model: openai/gpt-5.4
- Reviewer model: TBD
- QA model: openai/gpt-5.4

## Goal (1 sentence)
Rework the barricades to match a retro sprite-like erosion style from the reference and restore gameplay responsiveness without changing core mechanics.

## Scope
- In:
  - Replace the current barricade rendering with a retro silhouette closer to the provided reference image.
  - Make barricade degradation primarily visual, using progressive sprite-like erosion rather than the current heavy dynamic effects style.
  - Diagnose and fix the current gameplay slowdown so the game is playable again.
  - Preserve current controls, collision behavior, smoke hooks, and core gameplay rules.
  - Validate with the existing smoke path and practical runtime checks.
- Out:
  - New gameplay systems, scoring changes, enemy AI changes, or unrelated audio redesign.
  - Large dependency additions or moving the game off the current repo-local architecture.

## Likely Files/Modules
- `game.js`
- `styles.css`
- `index.html`
- `README.md`

## Acceptance Criteria (testable)
1. Barricades visually resemble the retro reference more closely, including chunked silhouette-style erosion as damage accumulates.
2. Barricade damage remains visually progressive for both player and alien fire, and fully destroyed barricades disappear cleanly.
3. Gameplay performance is restored to a responsive state and no longer feels slow or unplayable during normal play.
4. Core gameplay behavior, controls, and debug/smoke interfaces remain intact.
5. The existing smoke path passes after the changes.

## Test Plan
- Commands:
  - Serve locally with `./serve.sh` or equivalent static HTTP server.
  - Run the smoke path against `/?smoke=1`.
  - Perform a browser runtime spot-check focused on barricade erosion and frame responsiveness.
- Expected outcomes:
  - Barricades degrade in a retro, chunked visual style.
  - Repeated combat no longer causes obvious slowdown.
  - Smoke report returns pass.

## Dependencies
- Existing browser runtime only unless a very small repo-local addition is clearly justified.

## Constraints
- Preserve current gameplay rules and balance.
- Prefer simpler, cheaper rendering over expensive per-frame effects.
- Avoid heavy randomness or expensive draw-time work that harms frame rate.
- Keep the solution minimal and repo-local.

## Escalation Trigger
- Second implementation failure, security or data-integrity concern, or scope expansion into larger architecture/design planning.

## Budget
- Time cap: 1 focused implementation session plus validation
- Attempt cap (max 2): 2
- Token/cost cap (optional): TBD
