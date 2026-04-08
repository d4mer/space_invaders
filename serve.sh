#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8000}"

echo "Serving Space Invaders on 0.0.0.0:${PORT}"
echo "Open http://localhost:${PORT} or http://<your-local-ip>:${PORT}"

exec python3 -m http.server "${PORT}" --bind 0.0.0.0
