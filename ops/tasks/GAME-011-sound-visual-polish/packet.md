# Task Packet

## Metadata
- Task ID: GAME-011
- Title: Add sound effects and visual polish
- Priority: medium
- Deadline: TBD
- Risk: medium
- Owner model: opencode/minimax-m2.5-free
- Reviewer model: TBD
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Improve the game feel by adding browser-safe sound effects and stronger visual polish without changing core gameplay.

## Scope
- In:
  - Add synthesized or otherwise browser-safe sound effects for core gameplay events.
  - Add a visible sound toggle and ensure audio only starts after user interaction.
  - Improve the visual presentation of the playfield, HUD, and moment-to-moment feedback while preserving responsiveness on desktop and mobile.
  - Validate changes through the existing smoke path and fix regressions.
- Out:
  - New gameplay mechanics, scoring changes, or balance changes.
  - External audio asset pipeline or large dependency additions.
  - Reworking the existing SOP workflow or repository automation.

## Likely Files/Modules
- `game.js`
- `index.html`
- `styles.css`
- `README.md`

## Acceptance Criteria (testable)
1. The game includes audible feedback for major events such as player fire, alien fire or hits, powerup collection, and win/loss states, with a user-facing sound toggle.
2. The game looks noticeably more polished through in-game visual improvements that do not break desktop or mobile layout.
3. The existing smoke test path passes after the changes.

## Test Plan
- Commands:
  - Serve locally with `./serve.sh` or equivalent static HTTP server.
  - Run the existing smoke path against `/?smoke=1`.
- Expected outcomes:
  - Audio remains browser-safe and does not block gameplay when unavailable.
  - Visual changes render correctly on desktop and mobile layouts.
  - Smoke report returns pass.

## Dependencies
- Existing browser runtime only; prefer no new packages.

## Constraints
- Preserve core gameplay behavior.
- Keep implementation minimal and repo-local.
- Do not rely on autoplay audio; unlock sound from user interaction.
- Avoid changes that would break the current smoke validation flow.

## Escalation Trigger
- Second implementation failure, security or data-integrity concern, or scope expansion into larger architecture/design planning.

## Budget
- Time cap: 1 focused implementation session plus validation
- Attempt cap (max 2): 2
- Token/cost cap (optional): TBD
