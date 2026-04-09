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
