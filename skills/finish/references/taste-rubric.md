# Taste Rubric: the bar a finished artifact must clear

This is a **template**. It is opinionated on purpose, and the specific calls are the
author's. Fork it to your own taste. The point is to HAVE a checkable bar so `/finish` can
finalize against something concrete, not to adopt these exact rules. Replace the examples
with yours, and keep each rule one line and checkable.

The two starred sections are the failure modes that hurt most in public, so weight them
heaviest.

## ★ Voice (any copy written in your voice): automatic fail if violated
- [ ] **NO em dashes anywhere.** Use commas, periods, parentheses. Em dashes read as an AI tell.
- [ ] No dramatic fragment one-liners, performative punch lines, or manufactured profundity. Cut anything that sounds like it is performing.
- [ ] Plain sentences, concrete nouns, understatement. Write like you talk.
- [ ] Verify every autobiographical or factual claim before writing it. Never inflate timelines or numbers for narrative weight.
- [ ] No filler. No "great question," no repeating the prompt back, no filler intros or conclusions.

## ★ Brand / receipts: automatic fail if violated
- [ ] State your positioning in one locked sentence, and keep every public artifact consistent with it.
- [ ] **Employer-safe:** zero references that identify your employer, internal teams, codenames, or coworkers on anything public. Frame it as an independent product.
- [ ] **Receipts are true and sourced.** Any numeric proof needs dated, sourced backing. A fabricated metric is the canonical credibility failure.
- [ ] Voice-of-the-bar: short, concrete, honest about what is unbuilt. "Phase 1 complete with 177 passing tests; the execution layer is designed but deliberately unbuilt" reads right. Hype does not.

## Typography
- [ ] Use named display/text fonts, and vary them per project. (Set your own list, e.g. Clash Display, Satoshi, Fraunces, Cabinet Grotesk.)
- [ ] **BANNED (automatic fail): Inter, Roboto, Open Sans, any system font.**

## Visual aesthetic
- [ ] No generic AI aesthetics. No purple gradients on white. No cookie-cutter card layouts.
- [ ] Commit to one bold, distinctive direction per project, don't hedge into safe defaults.

## Contrast: automatic fail if violated
- [ ] Verify text contrast against backgrounds. White-on-white or light-on-light is an automatic failure.

## Required UI states
- [ ] Handle all four: loading, error, empty, success. No happy-path-only. (Relaxable only at solo tier, see tier-rubric.)

## Deliverables to read
- [ ] Deliver reports as styled HTML to read, not raw markdown. Generate HTML alongside the markdown and open it. Markdown is for version control; HTML is for reading.
- [ ] Theme for the reader: light/clean for shareable/external; dark only for personal/dev tooling.

## Domain / deploy convention
- [ ] Pick a canonical production URL convention and use it for every shipped project (set your own).
- [ ] OAuth apps: hardcode the canonical URL via an env var and allowlist ONLY that URL with your auth provider, never rotating deploy-hash URLs.

## How to do the finishing
- [ ] Default to more compute for more depth, not token efficiency. Spawn parallel agents plus critics that stress-test the key assumptions.
- [ ] Use a second-pass reviewer or judge when quality matters: check plan, diff, tests, and final answer against this rubric before delivery.

## Stack / hygiene floor (the minimum for "shippable" at any tier)
- [ ] Set your stack defaults (e.g. Next.js App Router + TypeScript strict + Tailwind; or Python 3.11+ + pytest + ruff + type hints) and hold to them.
- [ ] Run tests/lint/typecheck before calling anything done.
- [ ] Conventional commits, logical self-contained units, semver-tag shippable states. No `--no-verify`. No amending prior commits.
- [ ] Edit existing files over creating new ones.

## How boundary-pushing cites this rubric
Each of the (max 3) boundary-push additions in Phase 3 must name the specific rule above
that it serves, e.g. "added an empty and error state to the results list" cites "Handle all
four UI states," or "swapped the system font for a named display font" cites "BANNED:
system fonts." An addition that cannot cite a rule is scope creep; drop it.
