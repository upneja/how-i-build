---
name: git-push
description: Use to wrap up a work session by capturing structured project state (what happened, next steps, decisions, blockers, status, urgency) into a project registry and a per-project dossier, then commit and push. For people who track many projects in one dashboard and want each session to update it.
---

# git-push

A session-wrap that keeps a multi-project registry current. At the end of working on a
project, it summarizes the session into structured fields, updates a registry file (one
entry per project, with status and urgency so a dashboard can rank them), appends to a
per-project dossier, and commits and pushes so the dashboard rebuilds.

**When to use this vs `handoff`:** `handoff` writes a single rich session-bridge document so
the next agent can resume one project. `git-push` updates a registry across all your
projects, so a dashboard can show what is active, blocked, or on fire. Use `handoff` to
resume one thing; use `git-push` to keep the whole board honest. They compose.

This skill assumes you have a registry and dashboard. Set the two paths below to yours; if
you do not run a dashboard, `handoff` alone is probably enough.

## Configure
- `REGISTRY` = your project-state file (e.g. a `projects-state.json` your dashboard reads).
- `DOSSIERS` = your per-project deep-knowledge file (optional).
- `DASHBOARD_REPO` = the repo to commit and push (often the dashboard app itself).

## Step 1: Identify the project
From the current directory, walk up to the nearest git root and take its basename as the
project id (kebab-case). Confirm it with the user before writing.

## Step 2: Summarize the session
Produce structured fields, specific and concrete (no filler):
- `lastConversation`: 2-3 sentences on what was discussed and built (name files, features).
- `actionItems`: next steps, ordered, actionable ("Build X", not "think about X").
- `decisions`: key calls with the rationale baked in.
- `blockers`: anything preventing progress (empty if none).
- `status`: one of active / paused / idea / shipped / abandoned.
- `urgency`: one of low / medium / high / on-fire.
Show it to the user to adjust before writing.

## Step 3: Update the registry
Read `REGISTRY`, find the entry whose id matches, and update only the fields above plus a
`lastTouched` date. Preserve all other fields (name, one-liner, stack, repo, URL, notes). If
the project is new, ask for those fields once, then append a new entry. Do not reorder
existing entries. Keep the JSON valid (2-space indent). On a parse error, stop, do not
overwrite a corrupt file.

## Step 4: Update the dossier (optional)
If `DOSSIERS` is set, append a dated session-log entry to that project's dossier (a 3-5
sentence summary), update any facts that changed, and never delete existing content.
Dossiers are cumulative knowledge: dense enough to reload a project after weeks away.

## Step 5: Commit and push
In `DASHBOARD_REPO`: if there are unrelated dirty changes, stash them first and pop after.
Stage only the registry (and dossier) files, commit `"ops: update {project} state"`, and
push. On merge conflicts, stop and tell the user, never force-push or auto-resolve.

## Report
The short commit hash, that the dashboard will rebuild, and the dashboard URL if known.
