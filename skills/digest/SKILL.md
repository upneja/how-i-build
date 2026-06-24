---
name: digest
description: Use to see what a Claude Code session actually did, with the outward and irreversible actions (publish, deploy, spend, send, destructive commands) surfaced first. Also runs as hooks that log those actions automatically and text/email you when something critical happens during a long autonomous run.
---

# digest

A long autonomous run does hundreds of things. Almost none of them matter. The few that
do are the ones you cannot take back: a repo made public, a prod deploy, money spent, an
email or SMS sent, a force-push, an `rm -rf`. `digest` surfaces exactly those, so an
unattended run never surprises you.

It is three pieces:
1. **A PostToolUse hook** (`digest.py capture`) that classifies every command as it runs
   and records the outward/irreversible ones. Silent, never blocks the tool flow.
2. **A Stop hook** (`digest.py stop-hook`) that writes the session digest and, for any new
   critical action, sends an SMS + email. Coexists with other Stop hooks (Ralph, goal).
3. **A `/digest` command** (`digest.py emit` / `push`) to read the digest on demand.

The engine is stdlib-only Python so it runs from a bare hook subprocess with no venv, and
it never stores credentials: it reads them in place from the files you point it at.

## What counts as critical vs noted

- **critical** (always push-worthy): repo made public, new repo created, release/package
  published, prod deploy, DNS change, spend/market order, SMS/email sent, force-push,
  `rm -rf`, destructive SQL.
- **noted** (shown, never pushed): routine `git push`, PR open/merge, preview deploys.

Quoted text (commit messages, echo args) and read-only commands (`cat`, `grep`, ...) are
treated as data, not actions, so a message that mentions "npm publish" will not trip it.

## Install

```bash
# 1. engine
mkdir -p ~/.claude/digest && cp digest.py ~/.claude/digest/digest.py

# 2. config: copy the example and point it at your own creds + recipients
cp config.env.example ~/.claude/digest/config.env && $EDITOR ~/.claude/digest/config.env

# 3. command (optional): so you can run /digest
mkdir -p ~/.claude/commands && cp ../../commands/digest.md ~/.claude/commands/ 2>/dev/null || true
```

Then register the hooks in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "python3 ~/.claude/digest/digest.py capture" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "python3 ~/.claude/digest/digest.py stop-hook" }] }
    ]
  }
}
```

## Use

- `python3 ~/.claude/digest/digest.py emit`: print the current session's digest.
- `python3 ~/.claude/digest/digest.py push`: force-send it via SMS + email.
- `python3 ~/.claude/digest/digest.py test`: confirm your SMS + email channels work.

## Configure

`config.env` (see `config.env.example`) sets where the digest goes and how aggressively:

- `SMS_TO`, `EMAIL_TO`: your recipients.
- `DIGEST_PUSH`: `critical` (send only on a new critical action), `all`, or `off`.
- `TWILIO_ENV`, `GMAIL_ENV`: paths to files holding your Twilio and Gmail credentials. The
  engine reads them in place, so secrets never live in this skill.

## Make it yours

The classifier in `digest.py` (`CRITICAL` / `NOTED` regex lists) encodes one person's idea
of "what matters." Edit those lists to match the platforms and risks you actually use.
