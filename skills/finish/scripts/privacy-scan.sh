#!/usr/bin/env bash
# privacy-scan.sh: publish-blocking scan for /finish (Hard Rail 1).
#
# Scans a project's working tree (and optionally git history) for things that must never
# reach a public artifact: secrets, and (if you configure them) employer/internal terms,
# burned passwords, and sensitive names. Surfaces findings grouped by severity. /finish
# MUST reason beyond this and cross-reference your lockdown list; the scan is a floor.
#
# NOTE: this script ships with NO personal data. Configure the optional lists via env vars
# or a colocated `.privacy-scan.local` file (gitignored) that sets them:
#   EMPLOYER_TERMS="acme|acmecorp"     # internal/employer strings that must not appear
#   BURNED_PASSWORDS="oldpw1|oldpw2"   # passwords that leaked into public history
#   SENSITIVE_NAMES="Jane Roe|J. Roe"  # people whose names/data must not appear
#
# Usage:   privacy-scan.sh [PROJECT_DIR] [--history] [--since REF]
#   PROJECT_DIR  defaults to cwd
#   --history    also scan full git history (git log -p) for BLOCK patterns
#   --since REF  scope the copy-hygiene (em dash) check to files changed since REF
#
# Exit:  0 = clean   1 = findings (BLOCK the publish path)   2 = usage error

set -uo pipefail

DIR="."
SCAN_HISTORY=0
SINCE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --history) SCAN_HISTORY=1 ;;
    --since) shift; SINCE="${1:-}" ;;
    -h|--help) sed -n '2,27p' "$0"; exit 2 ;;
    *) DIR="$1" ;;
  esac
  shift
done

[ -d "$DIR" ] || { echo "privacy-scan: not a directory: $DIR" >&2; exit 2; }
cd "$DIR" || exit 2

# Optional, user-configured lists. Pull from a local config if present, then env.
[ -f .privacy-scan.local ] && . ./.privacy-scan.local
EMPLOYER_TERMS="${EMPLOYER_TERMS:-}"
BURNED_PASSWORDS="${BURNED_PASSWORDS:-}"
SENSITIVE_NAMES="${SENSITIVE_NAMES:-}"

# The em dash, built from its UTF-8 bytes so this script holds no literal one.
EMDASH=$(printf '\xe2\x80\x94')

EXCLUDES='--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=.vercel --exclude-dir=coverage --exclude-dir=vendor --exclude-dir=.venv'
LOCKSKIP='--exclude=*.lock --exclude=*-lock.json --exclude=*.min.js --exclude=*.map --exclude=*.png --exclude=*.jpg --exclude=*.jpeg --exclude=*.gif --exclude=*.pdf --exclude=*.woff* --exclude=*.ico'

FOUND=0
hit() { FOUND=1; }
section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

scan() { # scan LABEL PATTERN [grep-flags]
  local label="$1" pat="$2"; shift 2
  local out
  out=$(grep -rnoE $EXCLUDES $LOCKSKIP "$@" "$pat" . 2>/dev/null | head -40)
  if [ -n "$out" ]; then
    printf '  - %s\n' "$label"
    printf '%s\n' "$out" | sed 's/^/      /'
    hit
  fi
}

echo "privacy-scan: $(pwd)"

# -- BLOCK: secrets (always on) ------------------------------------------------
section "BLOCK: secrets / credentials"
scan "Private key block" '-----BEGIN [A-Z ]*PRIVATE KEY-----'
scan "AWS access key id" 'AKIA[0-9A-Z]{16}'
scan "Google API key" 'AIza[0-9A-Za-z_-]{35}'
scan "OpenAI / generic sk- key" '\b(sk|sk-proj|sk-ant)-[A-Za-z0-9_-]{16,}'
scan "GitHub token" '\bgh[pousr]_[A-Za-z0-9]{20,}'
scan "Slack token" 'xox[baprs]-[A-Za-z0-9-]{10,}'
scan "Twilio account SID" '\bAC[0-9a-fA-F]{32}\b'
scan "Bearer/secret assignment with value" '(AUTH_TOKEN|SECRET|API_KEY|PASSWORD|PRIVATE_KEY|ACCESS_TOKEN)\s*[:=]\s*["'"'"']?[A-Za-z0-9/_+.-]{12,}'

ENVFILES=$(find . -name '.env' -o -name '.env.*' 2>/dev/null | grep -vE '\.example$|\.sample$' | head -20)
if [ -n "$ENVFILES" ]; then
  while IFS= read -r f; do
    if grep -qE '^[A-Za-z_]+=.+' "$f" 2>/dev/null; then
      printf '  - committed env file with values: %s\n' "$f"; hit
    fi
  done <<< "$ENVFILES"
fi

# -- BLOCK: burned passwords (only if configured) ------------------------------
if [ -n "$BURNED_PASSWORDS" ]; then
  section "BLOCK: burned passwords (must never appear)"
  scan "Burned password" "$BURNED_PASSWORDS" -i
fi

# -- REVIEW: employer / internal references (only if configured) ---------------
if [ -n "$EMPLOYER_TERMS" ]; then
  section "REVIEW: employer / internal references (must be zero on a public artifact)"
  scan "Employer terms" "\\b($EMPLOYER_TERMS)\\b" -i
fi

# -- REVIEW: likely PII (always on) --------------------------------------------
section "REVIEW: likely PII"
scan "US phone number" '(\+1[ -]?)?\(?[0-9]{3}\)?[ -][0-9]{3}[ -][0-9]{4}'
scan "Email address" '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
[ -n "$SENSITIVE_NAMES" ] && scan "Sensitive names" "\\b($SENSITIVE_NAMES)\\b"

# -- REVIEW: copy hygiene (em dashes) ------------------------------------------
if [ -n "$SINCE" ] && [ -d .git ]; then
  section "REVIEW: copy hygiene (em dashes in prose written this run, since $SINCE)"
  CHANGED=$(git diff --name-only "$SINCE" -- '*.md' '*.mdx' '*.html' '*.tsx' '*.jsx' 2>/dev/null)
  if [ -n "$CHANGED" ]; then
    EM=$(printf '%s\n' "$CHANGED" | while IFS= read -r f; do [ -f "$f" ] && grep -no "$EMDASH" "$f" 2>/dev/null | sed "s|^|$f:|"; done | head -40)
    if [ -n "$EM" ]; then printf '  - Em dash in changed copy\n'; printf '%s\n' "$EM" | sed 's/^/      /'; hit; fi
  fi
else
  section "REVIEW: copy hygiene (em dashes in user-facing prose; pre-existing copy included, pass --since to scope)"
  scan "Em dash in markdown/copy" "$EMDASH" --include=*.md --include=*.mdx --include=*.html --include=*.tsx --include=*.jsx
fi

# -- BLOCK: git history (optional) ---------------------------------------------
if [ "$SCAN_HISTORY" -eq 1 ] && [ -d .git ] && [ -n "$BURNED_PASSWORDS" ]; then
  section "BLOCK: git history (burned passwords in past commits)"
  HIST=$(git log -p --all 2>/dev/null | grep -nEi "$BURNED_PASSWORDS" | head -20)
  if [ -n "$HIST" ]; then printf '%s\n' "$HIST" | sed 's/^/      /'; hit; fi
  echo "  (history scan is shallow; a repo on your lockdown list may need a full filter-repo/BFG rewrite before any public life)"
fi

echo
if [ "$FOUND" -eq 1 ]; then
  printf '\033[31mX privacy-scan: findings above. Publish path BLOCKED. Resolve or confirm explicitly.\033[0m\n'
  exit 1
else
  printf '\033[32mOK privacy-scan: no findings. Still reason beyond the scan and check your lockdown list before publishing.\033[0m\n'
  exit 0
fi
