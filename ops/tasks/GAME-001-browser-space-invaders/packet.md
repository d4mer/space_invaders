# Task Packet

## Metadata
- Task ID: GAME-001
- Title: browser-space-invaders
- Priority: high
- Deadline: none
- Risk: low
- Owner model: openai/gpt-5.4
- Reviewer model: openai/gpt-5.4
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Build a playable browser-based Space Invaders game that can be served to other devices on the local network.

## Scope
- In: game HTML, CSS, JavaScript, local serve script, and usage documentation
- Out: multiplayer, persistence, accounts, backend services, and mobile app packaging

## Likely Files/Modules
- `index.html`
- `styles.css`
- `game.js`
- `serve.sh`
- `README.md`

## Acceptance Criteria (testable)
1. The repo contains a playable Space Invaders game in the browser with movement, shooting, enemies, score, lives, and restart flow.
2. The repo includes a simple script to serve the game on `0.0.0.0` so it is reachable from the local network.
3. The README explains controls and how to run the local server.

## Test Plan
- Commands: `bash -n serve.sh`, `python3 -m http.server --help`, `Google Chrome --headless --dump-dom http://127.0.0.1:8000/?smoke=1`
- Expected outcomes: serve script syntax is valid, Python HTTP server is available, and the DOM smoke test reports `data-smoke="pass"`

## Dependencies

Python 3 for LAN serving.

## Constraints

Keep the implementation framework-free and simple to run from the repo root.

## Escalation Trigger

If browser gameplay is not functional or LAN serving cannot bind cleanly.

## Budget
- Time cap: 90 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
