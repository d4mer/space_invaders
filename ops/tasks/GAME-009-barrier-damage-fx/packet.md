# Task Packet

## Metadata
- Task ID: GAME-009
- Title: barrier-damage-fx
- Priority: medium
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Add stronger visual feedback for barrier damage so impacts are easier to read during active play.

## Scope
- In: barrier damage hit effects, visible barrier wear states, integration with existing barrier collision system, and smoke/debug verification if needed
- Out: new enemy types, sound effects, backend features, or major gameplay rule changes

## Likely Files/Modules
- `game.js`
- `styles.css`
- `README.md`

## Acceptance Criteria (testable)
1. Enemy shots that hit a barrier create a visible impact effect at the hit point.
2. Barriers visibly degrade as health drops instead of only changing opacity subtly.
3. Barrier health and collision behavior continue to work normally for both player and alien shots.
4. Existing smoke/debug paths are updated or extended enough to verify the new barrier-damage feedback.

## Test Plan
- Commands: extend the browser/headless smoke path or debug hooks to verify barrier health reduction and damage-effect state after a simulated hit; keep the existing gameplay smoke checks passing
- Expected outcomes: barrier hits produce temporary effects, barrier appearance degrades with health, and existing gameplay smoke behavior remains valid

## Dependencies

## Constraints
- Keep implementation framework-free
- Maintain existing visual style
- No additional dependencies

## Dependencies

Existing barrier collision logic and browser smoke/debug hooks.

## Escalation Trigger

## Budget
- Time cap: 45 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
