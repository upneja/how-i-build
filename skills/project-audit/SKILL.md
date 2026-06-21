---
name: project-audit
description: Use when asked to "evaluate everything rigorously", "audit this project/repo", "rethink everything here", review the whole state of a codebase or body of work, or before trusting/extending a project whose docs may have drifted from its code. Use when inheriting a project or resuming one after a long gap. NOT for reviewing a single diff/PR (use code-review) or attacking a future plan (use steelman).
---

# Project Audit

A from-scratch, adversarial re-evaluation of an **existing** project — code, docs, decisions, and claims — to find what's broken, stale, contradictory, or silently drifted from reality, before you trust or extend it.

**Core principle: check every claim against ground truth (git log, the code, primary sources), not against the project's own narrative.** A project's docs describe what it *intended*; the code and git history describe what it *is*. The gap between them is where the worst defects live (e.g. "this gate was violated 7 minutes after it was committed" only shows up in `git log` vs. the doc — never in the doc alone).

## When to use

- "Audit / rigorously evaluate / rethink everything in this project"
- Inheriting a codebase, or resuming one after weeks away
- Before a major extension, a launch, or relying on the project's claims publicly
- You suspect the docs no longer match the product

## Method

1. **Map ground truth first.** File tree (minus vendored dirs), full `git log --oneline`, run the tests/validators. This is what you check claims against.
2. **Fan out adversarial AREA auditors** (Workflow tool) — one per subsystem (strategy docs, research, decisions/specs, core library + tests, app + security, data/tasks, outputs/paper). Each auditor's mandate: *find every mistake first* (the owner doesn't want to discover more later), severity-rank (critical/major/minor/nit), and explicitly check doc claims against the code + git reality.
3. **In parallel, verify externally:** a dedicated **citation/claim-verification** agent that takes every external citation or factual claim → finds the primary source → returns confirmed / wrong / not-found, with the correction. (In practice this catches fabricated authors and misattributions that would torpedo credibility.) Add a `deep-research` sweep if the project rests on a contested external landscape.
4. **Synthesis judge** produces three things, not one: a **master defect list** (deduped, severity-ranked); the **cross-cutting contradictions** no single auditor could see (doc A's locked decision vs. doc B's pivot vs. what the code does); and the **decision-debt list** — every locked/"final" decision that was silently violated or invalidated.

**REQUIRED:** adapt and run `audit-workflow.js` (sibling file) rather than re-deriving the structure.

## The two highest-value finds (don't let them hide)

- **Decision debt.** A "LOCKED" decision that the code or a later doc silently reversed. The fix is never a quiet edit — it's a **superseding ADR + a dated supersession banner** on the stale doc, so the history stays legible. This is the single most valuable output of an audit.
- **Unverified load-bearing citations.** Any external fact the project's credibility rests on, never checked against the source. Verify before any of it ships publicly.

## Output → fix order (this matters)

Order fixes by **reversibility and blast radius, not severity.** Irreversible / outward-facing first:
1. **Stop active harm** (a leaked secret, a public answer-key, an exposed endpoint, unmetered spend) — often before anything else, and may need a one-line user confirmation if it touches a live/public surface.
2. Decision-debt ADRs + supersession banners (so readers can tell what's true).
3. Correctness/security fixes that survive any planned rebuild.
4. Stale-doc rewrites, citation corrections.

Then surface the master list to the user with the bottom line up front — don't bury the critical findings in a wall of nits.

## Common mistakes

| Mistake | Fix |
|---|---|
| Trusting the docs' self-description | Diff every claim against `git log` + the code. |
| Internal-consistency only | The worst bugs are doc-vs-reality, not doc-vs-doc. |
| Fixing in severity order | Fix in reversibility order — irreversible/outward first. |
| Silently editing stale "locked" docs | Write a superseding ADR + banner; preserve the trail. |
| Skipping citation checks | Verify every load-bearing external claim; misattributions are credibility-killers. |

## Related

`steelman` attacks what's *planned*; this audits what *exists*. `deep-research` for the external landscape. `code-review` for a single diff. Pair audit → steelman → rebuild: first learn what's true, then decide what to do.
