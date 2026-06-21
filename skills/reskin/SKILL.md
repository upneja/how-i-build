---
name: reskin
description: Use when the user wants 10 wildly different visual reskins of a completed Next.js project, optimized for cutting into Instagram reels. Generates HTML mockups in a sibling sandbox repo with an auto-opened gallery. Ingests target project's routes, git log, README, and CLAUDE.md to extract user journeys (code wins over stale docs). Each concept commits to one of 28 baked-in design archetypes (Bloomberg Brutalist, CRT Terminal, Risograph Zine, etc.) with hard tokens (fonts + import URLs, hex palette, exact radii). A slop-critic pass forces regeneration of any concept where defaults leaked in.
---

# `/reskin` — Generate 10 Anti-Slop Visual Reskins

## Trigger

User invokes `/reskin` from inside a Next.js project directory (e.g., `~/Projects/your-app/`).

Optional flags:
- `--archetypes <slug1>,<slug2>,...` — pre-select specific archetypes by slug instead of weighted-random sampling. Slugs must exist in `archetypes.json`.

## What This Skill Produces

A sibling sandbox repo `~/Projects/<project>-reskin-lab/` containing:
- 10 concept directories under `src/app/runs/YYYY-MM-DD-HHMM/<archetype-slug>/`
- Each concept = 3 Next.js routes (`hero`, `detail`, `action`) + a `brief.md`
- A per-run gallery at `/runs/YYYY-MM-DD-HHMM/gallery`
- A cross-run gallery at `/gallery`
- `LIVE.md` at lab root tracking the currently-promoted concept (empty on first run)

The skill then runs `npm install` (cached after first run) + `npm run dev` on port 3001 + opens the gallery in the user's browser.

## Behavior Contract

Execute these steps in order. Use the `superpowers:dispatching-parallel-agents` skill for Stage 3.

### Stage 1 — Journey extraction (~30s)

Read the target project in this order:
1. `app/` or `pages/` directory — summarize each route file: path, components used, primary data shape
2. `git log --oneline -50` — recent build context
3. `README.md`, `CLAUDE.md`, any `*-spec.md` files at project root — explicit intent
4. `package.json` — current stack (Tailwind version, fonts already in use, UI lib)

Then identify the top 3 user-journey screens by following `journey-extraction.md` in this skill directory.

**Rule:** If stale design docs conflict with code, code wins. Subordinate the docs to what the routes actually do.

Output: 3 named screens with a 2-sentence purpose each. Persist to `<lab>/src/lib/journeys.ts`.

### Stage 2 — Archetype sampling (~5s)

Load `archetypes.json` from this skill directory.

If `--archetypes` flag was passed, validate each slug exists and use those archetypes directly.

Otherwise: sample 10 archetypes via weighted random by `video_cut_score`. Enforce diversity constraint: **no two sampled archetypes may share the same `family` tag**.

Announce the 10 picks to the user before proceeding to Stage 3.

### Stage 3 — Parallel generation (~10min)

Use `superpowers:dispatching-parallel-agents` to launch 10 sub-agents concurrently.

Each sub-agent receives:
- Its archetype JSON object (hard tokens: fonts + import URL, palette hex, radii, motion DNA, reference URLs, anti-rules)
- The 3 user-journey screens with purpose + data shape
- The full content of `forbidden-patterns.md` as a hard NO list
- The constitutional rule (verbatim from `prompts/concept-generator.md`)

Each sub-agent must:
1. WebFetch the archetype's 2-3 reference URLs to ground visual decisions
2. Invoke the `frontend-design` skill with hard tokens as the design spec
3. Write 3 Next.js route files at `<lab>/src/app/runs/<timestamp>/<archetype-slug>/{hero,detail,action}/page.tsx`
4. Write `<lab>/src/app/runs/<timestamp>/<archetype-slug>/brief.md` (≤200 words) explaining aesthetic stance, palette logic, motion philosophy
5. Use prompt template from `prompts/concept-generator.md`

### Stage 4 — Slop-critic pass (~2min)

Spawn one critic agent. It receives all 10 concepts' code + briefs. It must:
1. Score each concept on the 8 axes defined in `prompts/slop-critic.md` (0-10 per axis)
2. Flag any concept scoring <5 on ≥2 axes
3. For each flagged concept, generate explicit regen feedback (e.g., "used `rounded-2xl` despite Bloomberg Brutalist's anti-rule")
4. Dispatch regen sub-agents (max 1 regen cycle per concept)
5. After regen, re-score; if still <5 on ≥2 axes, accept the result and add a yellow warning banner to that concept's brief in the gallery

Output: `<lab>/src/app/runs/<timestamp>/meta.json` containing the 10 archetypes picked, the journey screens, and the slop-critic scores.

### Stage 5 — Gallery + auto-open (~30s)

1. Write the per-run gallery to `<lab>/src/app/runs/<timestamp>/gallery/page.tsx` — a grid of 10 cards (one per concept) showing archetype name, brief excerpt, hero-screen thumbnail, and links into the 3 screens
2. Update the cross-run gallery at `<lab>/src/app/gallery/page.tsx` with this run added to the timeline (newest run = ACTIVE; previous ACTIVE → DEPRECATED in its `status.md`)
3. Update each previous run's `status.md` if its state changed
4. Run `bash ~/.claude/skills/reskin/scripts/scaffold-lab.sh <project-name>` if the lab doesn't yet exist
5. Run `bash ~/.claude/skills/reskin/scripts/open-gallery.sh <project-name> <run-timestamp>` to start dev server + open browser

## Failure Modes

- **WebFetch fails on a reference URL**: agent proceeds with hard tokens only; flag in brief
- **Sub-agent times out** (>15min): mark that concept slot with "regenerate this slot" placeholder card in gallery
- **All 10 concepts fail slop check**: halt; show what failed and why; offer rerun with different archetype seeds
- **Target project isn't Next.js** (no `next.config.*` and no `next` in `package.json`): error clearly; suggest porting or wait for v2
- **Lab dev server can't start**: fall back to building a static export at `<lab>/out/`, open `out/runs/<timestamp>/gallery/index.html`
- **Lab dir exists with conflicting state** (e.g., a non-reskin Next.js app): refuse to overwrite; show diff; ask user
- **`--archetypes` flag references invalid slug**: list valid slugs from `archetypes.json`; exit

## Constraints

- Never write into the target project itself. The lab is always a **sibling directory**.
- Never run destructive commands (`rm -rf`) without explicit user confirmation.
- Never commit anything in the lab repo to git — the lab is intentionally a scratch space.
