#!/usr/bin/env bash
set -euo pipefail

echo "HEARTBEAT REPORT - $(date -u +'%Y-%m-%d %H:%M UTC')"
echo

BLOCKED=$(grep -Ril "Status: blocked" ops/tasks 2>/dev/null || true)
READY=$(grep -Ril "Status: ready_for_review" ops/tasks 2>/dev/null || true)
HOTFIX=$(grep -RilE "^- Status: (investigating|mitigating|monitoring|resolved)$" ops/tasks/*/incident.md 2>/dev/null || true)

echo "Blocked tasks:"
if [[ -n "${BLOCKED}" ]]; then
  printf '%s
' "${BLOCKED}"
else
  echo "- none"
fi

echo
echo "Ready for review:"
if [[ -n "${READY}" ]]; then
  printf '%s
' "${READY}"
else
  echo "- none"
fi

echo
echo "Hotfix incidents:"
if [[ -n "${HOTFIX}" ]]; then
  printf '%s
' "${HOTFIX}"
else
  echo "- none"
fi
