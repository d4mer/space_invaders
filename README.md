# Space Invaders

Browser-based Space Invaders built to run locally and be served over your LAN.

## Controls

- `Left` / `A`: move left
- `Right` / `D`: move right
- `Space`: fire
- `Enter`: restart after game over or victory

## Run Locally

Use the included script to serve the game on all local interfaces:

```bash
./serve.sh
```

Then open one of these in a browser:

- `http://localhost:8000`
- `http://<your-local-ip>:8000`

The script uses Python's built-in HTTP server bound to `0.0.0.0` so other devices on your local network can connect.
