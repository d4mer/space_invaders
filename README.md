# Space Invaders

Browser-based Space Invaders built to run locally and be served over your LAN.

## Controls

### Desktop / Keyboard
- `Left` / `A`: move left
- `Right` / `D`: move right
- `Space`: fire
- `P`: pause / resume
- `Enter`: restart after game over or victory (also resumes when paused)

### Mobile / Touch
- On-screen left/right buttons: move ship
- On-screen fire button: fire weapon
- Long-press fire button to fire continuously
- Desktop keyboard controls remain enabled when playing on desktop

## Run Locally

Use the included script to serve the game on all local interfaces:

```bash
./serve.sh
```

Then open one of these in a browser:

- `http://localhost:8000`
- `http://<your-local-ip>:8000`

The script uses Python's built-in HTTP server bound to `0.0.0.0` so other devices on your local network can connect.

## HUD Status

The HUD status chip reflects the current live game state.

## Visual Feedback

### Barrier Damage Effects

When enemy shots or player bullets hit barriers:

- **Impact Effects**: Visible temporary impact effects appear at the hit point
- **Barrier Degradation**: Barriers visibly change color and structure as health drops:
  - **Healthy (70-100%)**: Green barrier with full internal structure
  - **Moderate (40-70%)**: Yellow-green, with some sections removed
  - **Damaged (20-40%)**: Orange, with multiple sections removed
  - **Critical (0-20%)**: Pinkish-red, with only small sections remaining
- **Barrier Destruction**: When a barrier is destroyed, debris particles explode outward

These effects make it easier to see when barriers are taking damage during active gameplay.

### Powerup Effects

When powerups drop from destroyed enemies and are collected:

- **Rapid Fire (Orange)**: Reduces fire cooldown to 0.1s for 6 seconds - displayed as lightning bolt icon
- **Spread Shot (Purple)**: Fires three angled bullets for 6 seconds - displayed as three bullet icons

Powerups:
- Fall from destruction points with bounce animation
- Provide immediate visual feedback when collected
- Automatically expire after 6 seconds

The HUD displays current active effects through visual feedback in-game.
