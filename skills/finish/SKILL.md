---
name: finish
description: Use when a project is functionally built but not actually finished, half-built features, no thought given to traffic/scale, not optimized, or it's unclear whether it's just for you, for a friend, or for the public. Use when you say "/finish", "finish this", "wrap this up", "make this launch-ready", "take this the last mile", or want a project carried from works-on-my-machine to fully finalized, and, if it's going public, given a real GTM plan plus a Twilio-textable launch agent.
---

# Finish

## Overview

`/finish` takes a half-baked project and **finalizes it**, it makes the executive
calls the project needs and carries them out, instead of handing back a checklist.
It is an **orchestrator**: it composes skills you already have (audit, red-team,
design, research, ship) rather than reinventing them. The judgment that is unique to
`/finish` is three things:

1. **Audience tier** (solo / friends / public): this sets the "done bar." A solo tool
   and a public launch are *finished* at completely different points.
2. **Taste-driven boundary-pushing**: `/finish` is allowed and expected to extend the
   original idea where your taste warrants, within a hard scope cap.
3. **Launch readiness**: for public-tier projects, a real GTM plan plus a scaffolded
   agent you can text to drive the launch.

**Core principle: decide, then do.** Every phase ends in committed changes or a logged
decision, not a recommendation. Run it fully autonomously (the default); the only things
that stop for an explicit human OK are the irreversible outward acts in the Hard Rails.

## Autonomy contract

This skill runs **end to end without checkpoints**. It infers the tier, makes the
finalization plan, executes it, and ships. It does **not** stop to ask "is this the right
tier?" or "should I build this feature?", it decides on the taste rubric and logs the
decision as a reversible ADR so you can review and roll back.

Autonomous means autonomous on the *work*: building, polishing, scaling, writing the GTM
plan, scaffolding the agent, committing, and deploying a project that has **no live users
yet** all run unattended. The skill stops only for the four irreversible, outward-facing
acts in the Hard Rails: making a private repo public, any real outbound send or public
post, **a production deploy to an app that already has a live audience**, and **a write to
your portfolio source of truth**. Reversible-in-git is not the same as reversible-for-users
or reversible-for-the-brand; those four get an explicit "go."

## Hard Rails (never negotiate these)

1. **Privacy gate is a publish-blocker.** Before any friends/public finalization, run
   `scripts/privacy-scan.sh` (and reason beyond it, **the script is a necessary floor,
   not sufficient**). If it finds a secret, an employer or internal reference, someone
   else's name or data, or anything on your lockdown list, **stop the publish path** and
   report. As a separate mandatory step, cross-reference the target repo against **your
   lockdown list** (a private file you maintain naming repos and data classes that must
   never go public). A locked repo may be finalized privately but never published. See
   `references/tier-rubric.md`.
2. **The GTM agent is draft-by-default.** It proposes outward actions and only executes
   them after an explicit text confirm. The scaffold ships with executors stubbed so it
   *cannot* post until wired. Never remove that.
3. **Boundary-pushing is capped.** Max 3 additions beyond the original scope. Each must
   (a) cite a specific rule in `references/taste-rubric.md`, (b) advance the current
   tier's done-bar, (c) add no new paid dependency, and (d) be logged as an ADR. More than
   3 ideas: list the rest as "future" and stop.
4. **Never soften a decided requirement silently.** A UX instinct is not a license to drop
   a required field or a copy claim. Implement it or surface the deviation.
5. **Taste gate on all copy.** Anything written in your voice obeys
   `references/taste-rubric.md` (no em dashes, no performative prose, no fabricated
   receipts). This is weighted heaviest alongside privacy.
6. **Live-prod deploy gate.** If the target already serves real users on a live domain, a
   production deploy requires an explicit "go", even autonomously. A green build is a
   quality gate, not a safety gate; it does not prove you won't break live users (e.g.
   realtime sync). Deploy freely only when there is no live audience yet.
7. **Portfolio source-of-truth gate.** Treat your portfolio data file and any receipts
   file as outbound, not internal. Show the exact diff and get a "go" before committing a
   change to them. Never inflate a proof line to read better.

## The Loop

Work the phases in order. Use a todo per phase. Skip phases that the tier marks "not
required" (the tier rubric says which).

### Phase 0: Intake
- Resolve the target: the passed path, else the cwd's git root. Derive a kebab `slug`.
- Read the project's own truth: `README`, `CLAUDE.md`/`AGENTS.md`, `package.json`/
  `pyproject.toml`, `git log --oneline -30`, and any portfolio entry that exists.
  **Code beats stale docs.**
- Detect stack, deploy status (custom domain? a live cert?), **whether real users are
  already hitting it**, and whether it's in your portfolio.
- **Enumerate project-local capability:** list `<project>/.claude/skills/` and
  `<project>/.claude/commands/`. These are tailor-made for this codebase (e.g. a party-game
  repo may ship `debug-game`, `new-minigame`, `growth-mechanics`, `mobile-qa`). Prefer them
  over generic builds in Phase 4, using them IS the "compose, don't reinvent" identity of
  this skill.
- Write a one-paragraph "what this is and where it actually stands" before moving on.
- If the repo has a project `AGENTS.md` with build caveats, honor it before editing.

### Phase 1: Audit
- Invoke **`project-audit`** on the project (see `references/composes.md`). Get the
  severity-ranked gap list: half-built features, missing UI states, no scale/traffic
  thinking, unoptimized paths, exposed secrets, doc-vs-code drift, missing tests.
- Fold in a fast self-check against the four required UI states and the stack floor in
  `references/taste-rubric.md`.
- Output: a concrete gap list, each item tagged severity + "blocks which tier."

### Phase 2: Classify the tier
- Decide **solo / friends / public** using the detection signals in
  `references/tier-rubric.md` (auth/gate present? custom domain? OG/SEO files? ingests
  sensitive data? who asked for it?).
- This is the load-bearing call. State the tier, the evidence, and therefore the done-bar
  you're now holding the project to. Log it as an ADR.

### Phase 3: Executive finalization plan
- From the gap list + the tier's done-bar, decide for each gap: **complete / cut /
  defer**. Be decisive; cutting is a finish move, not a failure.
- Add up to 3 taste-cited boundary-push items (Hard Rail 3).
- Run **`steelman`** (light is fine) on the plan as a pre-mortem, catch over-reach,
  runaway scope, and the "this needs scale it'll never get" trap. Adjust.
- Write the plan to `docs/finish/PLAN.md` in the project. Log the executive calls as ADRs.

### Phase 4: Execute the finalization
- Close the gaps you chose to complete. Build the boundary-push items. **Prefer a
  project-local skill (from Phase 0) over a generic build whenever one fits the gap.** Use
  test-driven development where it earns its keep.
- **UI polish (if there's a UI surface):** dispatch a frontend-polish agent (e.g.
  `frontend-ux-upgrader`) for in-place polish, guided by `frontend-design`. Enforce all
  four UI states and the contrast rule. Match the tier's theme (light/clean for
  external-facing, dark only for personal tooling).
- **Scale/traffic (public tier):** add the realistic measures: rate limiting on public
  endpoints, DB indexes/connection limits, caching, graceful 503 over a crash, sane error
  boundaries. Right-size to *expected* traffic; don't gold-plate a tool ten people will use.
- **Privacy gate:** for friends/public, run `scripts/privacy-scan.sh --since <start-ref>`
  (the `--since` scopes the copy-hygiene check to files this run touched) and reason beyond
  it, then do the lockdown cross-reference (Hard Rail 1). A hit stops the publish path.
- **Verify before claiming done:** run the project's tests, lint, typecheck, build, and a
  smoke run. Evidence, not assertion.

### Phase 5: GTM + textable agent (PUBLIC tier only)
- Produce the GTM plan per `references/gtm-playbook.md`: positioning, audience, channel
  mix, launch sequence, copy hooks, metrics, honoring your own launch constraints. Render
  it as styled HTML to read, markdown alongside.
- Scaffold the **textable agent** from `assets/gtm-agent/` into the project (or a sibling
  dir): copy the template, fill `secrets.env` with your own Twilio creds, and set the GTM
  actions for this launch. Leave executors stubbed (Hard Rail 2). Run
  `assets/gtm-agent/test/simulate.mjs` to prove propose, confirm, refuse-unconfirmed works.
  Do **not** deploy it live or wire a real number unless you give the go. `deploy.sh` is
  one command for when you are ready.

### Phase 6: Ship + report
- Run your **ship** flow: push, verify deploy, log the decision, semver-tag. For public,
  ensure OG/llms.txt/sitemap/robots/footer-disclosure are in place first.
- **Respect the two ship-time gates (Hard Rails 6, 7):** if the app has a live audience,
  get a "go" before the production deploy; and show the portfolio diff for a "go" before
  committing it.
- Emit a final **finish report** as styled HTML: tier chosen + why, every executive
  decision and ADR, boundaries pushed with their taste citations, scale measures added,
  privacy-gate result, GTM status, and (if scaffolded) the agent's URL and the exact
  `deploy.sh` command to make it live. `open` it.

## Quick reference, what runs when

| Phase | Invoke | Tier gating |
|-------|--------|-------------|
| 1 Audit | `project-audit` | all |
| 3 Plan | `steelman` (pre-mortem) | all |
| 3 Research | `deep-research` | only if finish hinges on a contested external landscape |
| 4 Polish | a frontend-polish agent + `frontend-design` | only if there's a UI surface |
| 4 Reels | `reskin` | optional, off critical path (marketing only) |
| 5 GTM/agent | `assets/gtm-agent/` + `references/gtm-playbook.md` | public only |
| 6 Ship | your ship flow | friends/public (solo can skip portfolio steps) |
| 6 Report | a readable-brief HTML pass | all |

Full invocation details in `references/composes.md`.

## Common mistakes

- **Treating every project as launch-tier.** A solo tool does not need auth, scale, SEO,
  or GTM. Over-finishing is as wrong as under-finishing. The tier decides.
- **Boundary-pushing into a rewrite.** The cap is 3, each justified. If you want to rebuild
  it, that's a different project, say so, don't smuggle it in.
- **Shipping copy with an em dash or a fabricated receipt.** Automatic fail.
- **Skipping a gate because "it's basically reversible."** The four outward acts
  (repo to public, real outbound send, prod deploy to a live audience, portfolio-truth
  write) are not. Get the "go."
- **Claiming done without running the checks.** Tests/lint/typecheck/build/smoke, with
  output, before the report says "finished."

## Files in this skill

- `references/taste-rubric.md`: the bar a finished artifact must clear (a template, fork it).
- `references/tier-rubric.md`: the three done-bars + tier detection + your lockdown list.
- `references/gtm-playbook.md`: the launch-plan structure.
- `references/composes.md`: how it calls every other skill, in order.
- `scripts/privacy-scan.sh`: the publish-blocking secret/PII scan (configurable).
- `assets/gtm-agent/`: the textable, draft-by-default launch agent.
