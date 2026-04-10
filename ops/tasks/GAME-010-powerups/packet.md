# Task Packet

## Metadata
- Task ID: GAME-010
- Title: powerups
- Priority: medium
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Add powerup items that drop from destroyed enemies and provide temporary gameplay bonuses when collected by the player.

## Scope
- In: powerup drop mechanics, powerup collection logic, two temporary gameplay bonuses, visible collection/active-state feedback, and smoke/debug verification hooks
- Out: new enemy types, persistent inventory system, multiplayer features, more than two power-up types, or major gameplay rule changes

## Likely Files/Modules
- `game.js`
- `styles.css`
- `README.md`

## Acceptance Criteria (testable)
1. Enemies have a chance to drop powerups when destroyed
2. Powerups fall from destruction points and are collectible
3. Two distinct powerup types provide temporary bonuses with visible feedback
4. Powerup effects properly expire or deactivate
5. Smoke test and debug snapshot include powerup-related state

## Test Plan
- Commands: extend the browser/headless smoke path or debug hooks so powerup drop, collection, activation, and expiry can be validated without manual play
- Expected outcomes: powerups can be spawned and collected in the automated path, active effect state is visible, and expiry/deactivation is verified

## Dependencies
- Existing enemy destruction system
- Existing collision detection framework
- Existing player state management

## Constraints
- Keep implementation framework-free
- Maintain existing visual style
- No additional dependencies
- Limit the feature to two powerup types so the task stays bounded

## Escalation Trigger

## Budget
- Time cap: 60 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
