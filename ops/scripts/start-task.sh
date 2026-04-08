#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 TASK-ID short-slug"
  exit 1
fi

TASK_ID="$1"
SLUG="$2"
DIR="ops/tasks/${TASK_ID}-${SLUG}"

if [[ -e "$DIR" ]]; then
  echo "Task folder already exists: $DIR"
  exit 1
fi

mkdir -p "$DIR"
cp ops/templates/task-packet.md "$DIR/packet.md"
cp ops/templates/status-update.md "$DIR/worklog.md"
cp ops/templates/review-form.md "$DIR/review.md"
cp ops/templates/result.md "$DIR/result.md"

echo "Created task folder: $DIR"
