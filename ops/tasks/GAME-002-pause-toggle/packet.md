# Task Packet

## Metadata
- Task ID: GAME-002
- Title: pause-toggle
- Priority: medium
- Deadline: none
- Risk: low
- Owner model: minimax-coding-plan/MiniMax-M2.7
- Reviewer model: openai/gpt-5.4
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Add a player-triggered pause toggle so gameplay can be suspended and resumed cleanly without losing game state.

## Scope
- In: pause and resume input handling, gameplay state freezing, minimal on-screen pause messaging, and control documentation updates
- Out: settings menus, remappable controls, audio controls, and save/resume across page reloads

## Likely Files/Modules
- `game.js`
- `index.html`
- `styles.css`
- `README.md`

## Acceptance Criteria (testable)
1. Pressing the chosen pause control during active play pauses game updates and pressing it again resumes play from the same state.
2. While paused, player movement, firing, alien movement, alien firing, and win/loss progression do not advance until the game is resumed.
3. The game UI and documentation communicate how to pause and resume without breaking existing start and restart flows.

## Test Plan
- Commands: `Google Chrome --headless --dump-dom http://127.0.0.1:8000/?smoke=1`
- Expected outcomes: smoke test passes and verifies pause toggle, paused freeze (post-step snapshot compared against pre-step paused snapshot: player position, alien bullet count, alive alien count, and alienPositions array content via JSON.stringify all unchanged during pause step), resume state preservation, restart, and serve path

## Dependencies

Existing browser game loop and overlay UI in `game.js` and `index.html`.

## Constraints

Keep the change minimal and preserve current keyboard controls and restart behavior.

## Escalation Trigger

Escalate if the pause flow requires a broader game state refactor or conflicts with the current overlay/start-button behavior.

## Budget
- Time cap: 45 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
