#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 short-slug"
  exit 1
fi

SLUG="$1"
DATE="$(date +%Y%m%d)"
DIR="ops/tasks/HOTFIX-${DATE}-${SLUG}"

if [[ -e "$DIR" ]]; then
  echo "Hotfix folder already exists: $DIR"
  exit 1
fi

mkdir -p "$DIR"
cp ops/templates/incident.md "$DIR/incident.md"
cp ops/templates/task-packet.md "$DIR/packet.md"
cp ops/templates/review-form.md "$DIR/review.md"
cp ops/templates/result.md "$DIR/result.md"

echo "Created hotfix folder: $DIR"
