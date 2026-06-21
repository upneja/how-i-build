#!/usr/bin/env bash
# Scaffolds <project>-reskin-lab as a sibling to the target project.
# Usage: scaffold-lab.sh <project-name> [<target-dir>]
# Default target-dir: ~/Projects/<project-name>-reskin-lab

set -euo pipefail

PROJECT_NAME="${1:?missing project name}"
LAB_DIR="${2:-$HOME/Projects/${PROJECT_NAME}-reskin-lab}"
TEMPLATE_DIR="$HOME/.claude/skills/reskin/scaffolds/reskin-lab-template"

if [[ -d "$LAB_DIR" ]]; then
  echo "Lab dir already exists: $LAB_DIR (skipping scaffold)"
  exit 0
fi

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "FAIL: template dir not found: $TEMPLATE_DIR"
  exit 1
fi

mkdir -p "$LAB_DIR"
cp -R "$TEMPLATE_DIR"/. "$LAB_DIR/"

# Substitute PLACEHOLDER with project name in: package.json, LIVE.md, README.md
for f in "$LAB_DIR/package.json" "$LAB_DIR/LIVE.md" "$LAB_DIR/README.md"; do
  if [[ -f "$f" ]]; then
    sed -i.bak "s/PLACEHOLDER/${PROJECT_NAME}/g" "$f"
    rm -f "$f.bak"
  fi
done

echo "OK: scaffolded $LAB_DIR"
