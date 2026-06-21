---
name: handoff
description: Generate a structured session-bridge document so a fresh agent (or new model) can resume work without re-deriving context. Use when the user types /handoff, says "write a handoff", asks to switch models mid-project, or signals they're approaching a context/session boundary. Captures objective, current state, decisions + rationale, next action, blockers, and critical file pointers — by reference, not by transcript dump.
---

# Handoff

A handoff is a conversation between your past self and your future self. The goal is **state, not history** — evacuate working memory to disk before a model swap, `/clear`, or session end, so the next agent can act within five minutes of reading it.

The hard rule: **reference artifacts by path/URL, never duplicate them.** If a decision is captured in an ADR or a commit message, link to it. The handoff is the index, not the library.

## When to invoke

- User types `/handoff` or asks to "write a handoff", "package this for X", "let me switch to Y and continue"
- User signals model/session transition ("I'm switching to Mythos Fable", "let me restart")
- Approaching context-window saturation on a long-running project
- Pausing a project for >24 hours

## Process

1. **Locate the project root.** Use `pwd` / cwd. Confirm it has a `.git` or recognizable project marker.

2. **Pick the file path.** Default: `docs/handoff/YYYY-MM-DD-<topic-slug>.md`. If `docs/` doesn't exist, fall back to `HANDOFF.md` at project root. If a handoff for today already exists, append a `-2`, `-3` suffix — never overwrite.

3. **Gather mechanical context in parallel:**
   - `git log --oneline -20`
   - `git status -s` (or `git status` for narrative)
   - `git branch --show-current`
   - `git diff --stat HEAD~5..HEAD 2>/dev/null || true`
   - TaskList (active TaskCreate state)
   - Read root-level `CLAUDE.md`, `AGENTS.md`, `README.md` if present (for repo conventions)

4. **Gather conversation context.** From THIS session, identify the load-bearing answers:
   - **What was the user trying to do?** (the session's actual objective, not the first message)
   - **What got built/decided/learned?** (with WHY for each)
   - **What changed your mind?** (pivots — these are gold for the next agent)
   - **What's the single next concrete action?** (file path + first command)
   - **What's blocked on user input?** (decisions only the user can make)
   - **What did you almost do but didn't?** (paths considered and rejected, with reasoning)

5. **Write the file** using the template below.

6. **Tell the user:**
   - The file path
   - The boot ritual: "When you start the new session, paste this into the new agent's first message: `read <path> and resume from Next Action #1`"
   - Confirm the file is git-trackable (so the handoff survives across machines)

## File template

```markdown
# Handoff — <topic> — <YYYY-MM-DD>

## tl;dr
<2-3 sentence summary: where the project is, what's next>

## Objective
<the durable goal — what we're trying to ship over the next few sessions>

## Current state
- **Repo:** `<absolute path>`
- **Branch:** `<branch>` at `<short sha>` `<subject>`
- **Working tree:** clean | <N modified, M untracked> (see git status below)
- **Last meaningful work:** <one sentence>

## Next action
**This is the single most important field. The reader should start here.**

1. <first concrete action with file path>
2. <second>
3. <third>

## Decisions locked this session
- **<decision>** — <one-line rationale>. Considered <alternative>; rejected because <why>.
- ...

## What was built / changed
- `<file path>` — <one sentence, what + why>
- ...

## Open questions / blocked on user
- <thing only the user can decide>
- <thing waiting on user action>

## Critical files (read these first if resuming)
- `<path>` — <why it matters>
- `<path:line>` — <specific function or block>

## Recent commits
```
<paste git log --oneline -10>
```

## Working-tree status
```
<paste git status -s>
```

## Research surfaced this session
- <key finding> — `<source url>`
- ...

## Continues-from
- Previous handoff: `<path>` (if any)
- Originating session goal: `<link or summary>`
```

## Quality bar

- **A fresh agent who has never seen the conversation should be able to resume after reading this alone.** Mentally test it.
- **Reasoning, not just outcomes.** "Picked X because Y, rejected Z because W" beats "decided X."
- **No padding.** Dense and short > waffling and long.
- **File paths with line numbers** where applicable.
- **The Next Action section is load-bearing.** If it's vague, the handoff failed.

## Anti-patterns

- ❌ Dumping a transcript of the conversation
- ❌ Re-stating things already in CLAUDE.md / README.md / commit messages — link instead
- ❌ Listing every file touched — only the ones that matter for resume
- ❌ "We discussed many options" — name them and say which won and why
- ❌ Writing the handoff *during* execution — write it at a clean stopping point
