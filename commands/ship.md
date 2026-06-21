---
description: End-to-end shipping checklist for the current project — push code (tests/lint first), verify the deploy went live, optionally update a project registry/portfolio file, log a decision, and optionally update a project dashboard. Use when you're done with a feature and want to make sure it actually shipped.
---

# Ship

Walk the user through the full "this is done" checklist for the current project. They've finished a feature or fix and want to make sure it's actually shipped — not stuck on their laptop, missing from their project registry, or undeployed.

This command is procedural. Follow the steps in order. Confirm with the user at each decision point.

## Step 0 — Identify the project

1. Find the git root from `pwd` (walk up to nearest `.git/`)
2. Take the basename as `PROJECT_ID` (kebab-case, lowercase)
3. Print: `Shipping **{PROJECT_ID}** — proceed? (y/n)`
4. If no git root: ask the user which project, use their answer as `PROJECT_ID`

## Step 1 — Push code

1. Run tests and lint first if the project has them (`package.json` scripts, `pytest`, `ruff`, a `Makefile` target). If anything fails, STOP and report it. Don't ship broken code.
2. `git status --porcelain`
   - If dirty: show `git diff --stat`, propose a conventional-commit message (`feat:`, `fix:`, `perf:`, `docs:` — match the user's style from recent `git log`), confirm with user, commit
3. Branch hygiene: capture `BRANCH = $(git branch --show-current)`. If on the default branch (`main`/`master`) and the user expected a feature branch, surface that. Don't auto-create or auto-merge branches.
4. `git log @{u}..HEAD --oneline` (or `git log origin/$(git branch --show-current)..HEAD --oneline` if upstream isn't set)
   - If any unpushed commits: `git push` (set upstream with `-u` if needed)
5. Capture `COMMIT_HASH = $(git rev-parse --short HEAD)`
6. Print: `✓ Pushed {COMMIT_HASH} to {BRANCH}`

## Step 2 — Verify deploy

Detect deploy target by checking project root:

| File present | Target |
|---|---|
| `vercel.json` or `.vercel/` | Vercel |
| `railway.json` / `railway.toml` | Railway |
| `Dockerfile` only, no FE config | Likely Railway / Docker host |
| `next.config.*` only (no vercel.json) | Likely Vercel (auto-connect) |
| `wrangler.toml` | Cloudflare Workers |
| `netlify.toml` | Netlify |
| `fly.toml` | Fly.io |
| None of the above | Ask the user where it deploys, or note `no deploy target detected` |

For **Vercel**: deploy is automatic on push if connected. Try `vercel ls --json 2>/dev/null | head` to grab the latest deployment URL. If the `vercel` CLI isn't installed or returns nothing, ask the user for the live URL or note it as `auto-deploy triggered (verify in dashboard)`.

For **Railway / Cloudflare / Netlify / Fly**: similar (auto-deploy on push if connected).

Don't just trust that the build was triggered — confirm it actually went live. If you have a `LIVE_URL`, do a quick reachability check (`curl -sI {LIVE_URL} | head -1` and confirm a 2xx/3xx). If the latest commit isn't reflected yet, note `deploy in progress (verify manually)` rather than claiming success.

Capture `LIVE_URL` if available.

## Step 3 — Update project registry / portfolio (optional)

Many people keep a single structured file listing their projects — a portfolio data file, a `projects.json`, a registry that powers a personal site, etc. If you maintain one, keep it in sync here. **This step is optional. Skip it cleanly if the user has no such file.**

1. Locate the registry. Check, in order:
   - A `SHIP_REGISTRY_PATH` env var, if the user has set one
   - A path the user gives you when asked
   - Common spots: a `projects.{ts,js,json,yaml}` data file in the user's personal-site repo
   - If none and the user doesn't have one: print `registry: none configured` and move to Step 4. Don't invent a file.

2. Read the file and infer its schema from the actual contents. A typical entry looks like:
   ```jsonc
   {
     "id": "kebab-case-slug",
     "name": "Human Readable Name",
     "tagline": "one sentence",
     "description": "2-4 sentences",
     "status": "shipped" | "wip" | "research",
     "stack": ["..."],
     "links": { "live": "...", "github": "..." }
   }
   ```
   Adapt to whatever fields the user's file actually uses. Read the real type/shape at the top of the file rather than assuming this one.

3. Search the registry for an entry matching `PROJECT_ID` (exact or fuzzy).

4. **If found** — check for staleness:
   - Is the live link missing or different from `LIVE_URL`? Update it.
   - Is the status still `wip` but this ship clearly makes it `shipped`? Confirm with user, then update.
   - Has the tagline/description drifted from what was actually built? Propose an update, confirm with user.

5. **If not found** — ask: `This project isn't in your registry. Add it? (y/n)`
   - If yes, gather (propose values, let user adjust):
     - `name`, `tagline`, `description` (draft from `README.md` if present, else from conversation context)
     - `status` (probably `shipped` if Step 2 succeeded)
     - `stack` (infer from `package.json`, `pyproject.toml`, etc.)
     - github link (from `git remote get-url origin`)
     - live link (`LIVE_URL` from Step 2)
     - any ordering/category field the file uses (match the existing convention)
   - Append the new entry, then commit the change in the registry's repo with message `chore(registry): add {PROJECT_ID}` and push.

6. **If user explicitly skips**: note `registry: skipped` in final report. Don't argue.

7. **If the file fails to parse** (JSON/TS/YAML error): STOP. Do not overwrite a corrupt file.

## Step 4 — Log the decision

Keep a lightweight changelog of what shipped and why, so future-you can grep for "why did I ship X." Write a new entry to your decision log: a repo-local `docs/decisions/YYYY-MM-DD-{PROJECT_ID}-{short-slug}.md` by default, or wherever you already keep one (a `DECISIONS.md`, a notes folder). Ask if unsure, and respect an existing convention:

```markdown
---
date: YYYY-MM-DD
project: {PROJECT_ID}
type: ship
commit: {COMMIT_HASH}
---

# {Short title — what shipped}

**What:** 1-2 sentences on what was built/fixed/changed.

**Why:** 1-2 sentences on the motivation — the underlying user/business reason. If you don't know, ask the user. Don't fabricate.

**How:** Key technical choices made (only if non-obvious — skip for routine work).

**Live at:** {LIVE_URL or "n/a"}
```

Keep it tight. This is a log, not an essay.

## Step 5 — Update task tracker

Open the user's task file if they keep one (a repo `TODO.md`, a personal `TASKS.md`, etc.). Look for any pending items mentioning `PROJECT_ID` or this shipment.

For each match: propose marking it done, confirm with user, then either strike through or move to a `## Completed` section depending on the file's existing convention.

If no task file exists or there are no matches, skip silently.

## Step 6 — Optional: update a project dashboard

If the user maintains a project dashboard (a kanban board, an ops/status page, a state file like `projects-state.json` that powers a dashboard), offer to update it for this session.

Ask: `Update your project dashboard for this session? (y/n)`

If yes and the user has a dedicated skill/script for it, invoke that. Otherwise update the dashboard's state file directly: mark the project's card/status, bump its last-shipped timestamp, and commit/push to the dashboard repo.

This step is optional because not every ship needs the full dashboard treatment. Skip cleanly if the user has no dashboard.

## Step 7 — Final report

Print a single summary block:

```
═══════════════════════════════════
  Shipped: {PROJECT_ID}
═══════════════════════════════════
  Commit:     {COMMIT_HASH} on {BRANCH}
  Live at:    {LIVE_URL or "(not detected)"}
  Registry:   {updated | already current | new entry added | skipped | none configured}
  Decision:   {decision log path}
  Tasks:      {n marked done | none matched}
  Dashboard:  {updated | skipped | n/a}
═══════════════════════════════════
```

Done.

## Edge cases

- **Tests or lint fail in Step 1**: STOP. Report the failure. Don't ship broken code.
- **No remote configured**: stop after Step 1 with a clear error. Don't push to nowhere.
- **Deploy verification fails**: note it honestly in the final report (`Live at: (verify manually)`). Don't fake a URL.
- **Multiple deploy targets** (e.g., a Vercel frontend + a Cloudflare Worker backend): list both in Step 2, capture both URLs.
- **Working in a worktree / non-default branch**: note `branch: {BRANCH}` prominently in the final report. Do NOT auto-merge to the default branch — that's a separate decision.
- **Registry schema has changed** since this command was written: read the actual file's type definitions at the top and adapt. Don't blindly use the schema in this prompt.
- **User runs /ship in a project they don't own** (e.g., a cloned dependency): detect via `git remote get-url origin` — if it doesn't point to a repo the user owns, stop and ask if they really meant to ship this.
- **JSON/TS/YAML parse error** in the registry: stop. Do not overwrite a corrupt file.
