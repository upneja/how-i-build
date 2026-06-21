#!/usr/bin/env bash
set -euo pipefail

TMPDIR_LAB=$(mktemp -d)
trap "rm -rf $TMPDIR_LAB" EXIT

~/.claude/skills/reskin/scripts/scaffold-lab.sh testproj "$TMPDIR_LAB/testproj-reskin-lab"

# Assertions
test -f "$TMPDIR_LAB/testproj-reskin-lab/package.json" || { echo "FAIL: missing package.json"; exit 1; }
test -f "$TMPDIR_LAB/testproj-reskin-lab/LIVE.md" || { echo "FAIL: missing LIVE.md"; exit 1; }
test -f "$TMPDIR_LAB/testproj-reskin-lab/src/app/layout.tsx" || { echo "FAIL: missing layout.tsx"; exit 1; }
test -f "$TMPDIR_LAB/testproj-reskin-lab/src/app/gallery/page.tsx" || { echo "FAIL: missing gallery"; exit 1; }
test -f "$TMPDIR_LAB/testproj-reskin-lab/src/lib/runs.ts" || { echo "FAIL: missing runs.ts"; exit 1; }

# Substitution check
grep -q "\"name\": \"testproj-reskin-lab\"" "$TMPDIR_LAB/testproj-reskin-lab/package.json" || { echo "FAIL: package.json name not substituted"; exit 1; }
grep -q "testproj" "$TMPDIR_LAB/testproj-reskin-lab/LIVE.md" || { echo "FAIL: LIVE.md not substituted"; exit 1; }

! grep -q "PLACEHOLDER" "$TMPDIR_LAB/testproj-reskin-lab/package.json" || { echo "FAIL: PLACEHOLDER still in package.json"; exit 1; }

echo "PASS: scaffold-lab.sh produces expected structure with substitutions"
