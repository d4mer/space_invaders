# Task Packet

## Metadata
- Task ID: GAME-008
- Title: touch-controls
- Priority: high
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3.5-27b
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Add usable on-screen touch controls so the Space Invaders game is playable on phones and tablets.

## Scope
- In: on-screen touch control UI, touch input handling, responsive styling, and smoke/debug coverage if needed
- Out: desktop control changes, audio, multiplayer, major gameplay rebalance, or a full mobile redesign

## Likely Files/Modules
- `index.html`
- `game.js`
- `styles.css`
- `README.md`

## Acceptance Criteria (testable)
1. On-screen touch controls appear in a mobile-friendly layout without breaking the desktop HUD.
2. Tapping or holding left and right controls moves the ship as expected.
3. Tapping the fire control fires the weapon and works alongside existing pause/restart behavior.
4. Desktop keyboard controls still work after the change.
5. Task artifacts record implementation, review, and QA outcomes.

## Test Plan
- Commands: use the existing browser smoke path where possible and add a focused verification path for touch-control state wiring; include a responsive DOM check or equivalent evidence for the touch UI
- Expected outcomes: touch controls render in the mobile layout, drive movement/fire correctly, and existing desktop controls continue to work

## Dependencies

Existing gameplay loop, HUD, and browser smoke/debug hooks.

## Constraints

Keep the implementation framework-free and visually consistent with the existing game.

## Escalation Trigger

If touch support requires a larger input-system rewrite or significantly disrupts desktop layout.

## Budget
- Time cap: 90 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
