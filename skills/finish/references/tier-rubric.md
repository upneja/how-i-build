# Tier Rubric: who is this for, and therefore when is it done

The audience tier sets the done-bar. Over-finishing a solo tool is as wrong as
under-finishing a launch. Classify first, then hold the project to that bar.

## Tier detection (Phase 2)

Read the signals, weight the strongest, decide. When genuinely ambiguous on a one-off,
ask; on a clear-goal project, decide and log the ADR.

| Signal | Points toward |
|--------|---------------|
| Runs on `localhost`/throwaway preview URL AND single-user data AND no audience | **solo** |
| Password gate or auth-gated admin; shared with a named group; data about specific people | **friends** |
| A real custom domain, OG/SEO files, a populated `marketing/` dir, public README, a named audience, "launch/publish/ship it" language | **public** |
| Ingests anyone else's personal, medical, financial, or employer-internal data | private repo regardless of tier; **never public without a scrub** |
| Your own words: "just for me" / "send it to <person>" / "I want to launch this" | the stated tier wins |

**Two traps that cause real misclassification, do not fall for them:**
- **No-auth is not solo.** "No login wall" describes a *product's auth model*, not its
  audience. A no-auth tool with **single-user data** leans solo; a no-auth
  **multiplayer/shared** product (a party game, a public utility) is NOT a solo signal,
  weight the domain/marketing/audience signals instead.
- **A custom domain or a populated `marketing/` dir outranks the auth signal toward
  public.** A bespoke domain is still a public signal.

## Tier 1, SOLO (just you), minimum bar
Utility to one user. Ship fast, skip ceremony.
- [ ] Core happy path works end to end.
- [ ] No generic-AI-slop aesthetic even here (banned fonts + contrast failures are automatic fails at EVERY tier). Theme may be dark / dev-tooling.
- [ ] At least loading + error states on the main flow; full empty/success polish optional.
- [ ] Lint/typecheck/tests pass if they exist, a full new suite is NOT required.
- [ ] Committed with conventional-commit messages.
- [ ] **Not required:** auth, scale/traffic thinking, SEO/OG, analytics, GTM, custom domain.
- [ ] Privacy still applies if it touches anyone else's personal data: stays a private repo.

## Tier 2, FRIENDS / SMALL-GROUP, middle bar
Shared with a known, trusted group. Needs polish + a sharing/gating story, not launch scale.
- [ ] Access is gated, not open (password gate or auth-gated admin is the standard pattern).
- [ ] All four UI states handled.
- [ ] Real error handling on the flows people will hit, graceful 503 over a crash.
- [ ] Distinctive committed aesthetic + correct theme (light/clean if shareable to the group).
- [ ] On a real custom domain; OAuth allowlists only that URL.
- [ ] Tests/lint/typecheck pass; tagged a semver state.
- [ ] Light privacy pass: no one's data exposed beyond what they consented to share; repo stays private if it holds others' personal data.
- [ ] **Not required:** full SEO/OG, analytics, scale/load thinking, GTM funnel.

## Tier 3, PUBLIC / LAUNCH, full bar
External-facing, brand-load-bearing. Everything in Tier 2, plus:
- [ ] **PRIVACY SCRUB, hard gate (Hard Rail 1).** Run `scripts/privacy-scan.sh` and reason beyond it. Cross-reference your lockdown list (below). No public ship, and no public repo link, until clean.
- [ ] Employer-safe content: zero employer, internal-team, codename, or coworker references.
- [ ] Receipts true and sourced; numeric proof gets a dated source.
- [ ] Full polish + all four UI states + contrast verified + distinctive non-slop aesthetic.
- [ ] SEO/OG/discoverability: OG image, llms.txt, sitemap, robots, nav, footer disclosure, a11y.
- [ ] Canonical custom domain; OAuth allowlists only that URL.
- [ ] Scale/traffic + analytics right-sized to expected load; tests/lint/typecheck green; semver-tagged; clean `git log` narrative.
- [ ] A GTM plan per `gtm-playbook.md`, honoring your own launch constraints.
- [ ] A truthful portfolio entry.

## Your lockdown list, MAINTAIN THIS
Keep a private file (not in any public repo) that names:
- **Repos that must never go public** until scrubbed and approved (and any that need a git
  history rewrite, e.g. via `git filter-repo` or BFG, before they ever can).
- **Data classes that block a public ship:** anyone else's contact info, medical, or
  financial data; client documents; employer-internal references; any secret or password
  that ever touched a public commit.
- **Burned passwords** that appeared in public git history and must never be reused.

`/finish` cross-references the target repo against this list before any publish, and treats
the privacy scan as a floor, not a guarantee. If the target is on the list, `/finish` may
finalize it **privately** but must stop before any publish step and report what needs
scrubbing.
