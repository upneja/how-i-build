#!/usr/bin/env bash
# Starts the reskin lab dev server and opens the gallery in the browser.
# Usage: open-gallery.sh <project-name> [<run-timestamp>]
# If run-timestamp is omitted, opens /gallery (cross-run); otherwise /runs/<ts>/gallery

set -euo pipefail

PROJECT_NAME="${1:?missing project name}"
RUN_TIMESTAMP="${2:-}"

LAB_DIR="$HOME/Projects/${PROJECT_NAME}-reskin-lab"
PID_FILE="$LAB_DIR/.dev-server.pid"
PORT=3001

if [[ ! -d "$LAB_DIR" ]]; then
  echo "FAIL: lab dir not found: $LAB_DIR"
  exit 1
fi

cd "$LAB_DIR"

# Install if needed
if [[ ! -d node_modules ]]; then
  echo "Installing dependencies (first run)..."
  npm install --silent
fi

# Start dev server if not already running
if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Dev server already running (PID $(cat "$PID_FILE"))"
else
  echo "Starting dev server on port $PORT..."
  nohup npm run dev > "$LAB_DIR/.dev-server.log" 2>&1 &
  echo $! > "$PID_FILE"
  # Wait up to 30s for server to be ready
  for i in {1..30}; do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

# Open browser
URL="http://localhost:$PORT"
if [[ -n "$RUN_TIMESTAMP" ]]; then
  URL="$URL/runs/$RUN_TIMESTAMP/gallery"
else
  URL="$URL/gallery"
fi

case "$(uname)" in
  Darwin) open "$URL" ;;
  Linux) xdg-open "$URL" ;;
  *) echo "Open manually: $URL" ;;
esac

echo "OK: opened $URL"
