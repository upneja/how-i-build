# Composes: how /finish calls the other skills

`/finish` orchestrates skills you already have. This repo ships the ones it leans on, so the
references below point at sibling skills in `skills/`. If your setup differs, swap in your
own audit / red-team / design / ship equivalents.

**Project-local skills come first.** Before reaching for any skill below, enumerate
`<project>/.claude/skills/` and `<project>/.claude/commands/` (Phase 0). A skill written for
this codebase beats a generic one, e.g. a party-game repo may ship `debug-game`,
`new-minigame`, `growth-mechanics`, `mobile-qa`. Prefer them in Phase 4.

## project-audit  (Phase 1)
- `skills/project-audit/SKILL.md`. Adversarial per-subsystem auditors + a synthesis judge.
  Checks claims against ground truth.
- **In:** the existing project. **Out:** severity-ranked defect list; fix order by reversibility.
- Use the gap list as the raw input to Phase 3's complete/cut/defer decisions.

## steelman  (Phase 3, pre-mortem)
- `skills/steelman/SKILL.md`. Light = a few inline critics; heavy = pillar critics +
  ground-up alternatives + a synthesis judge.
- Run it on the *finalization plan* (what is planned, not what exists). Light is usually right.
- **Purpose here:** catch over-reach and "scale it'll never get" before you build.

## deep-research  (Phase 3, CONDITIONAL)
- `skills/deep-research/SKILL.md`. Parallel advocate, critic, and synthesis waves.
- Use only if the finish hinges on a contested external landscape (e.g. GTM positioning
  against real competitors). Skip for most finishes.

## frontend polish  (Phase 4, CONDITIONAL, UI surface only)
- Dispatch a frontend-polish agent (e.g. a `frontend-ux-upgrader` subagent) to improve an
  existing frontend *in place*. Give it the tier's theme + the taste-rubric constraints +
  "enforce all four UI states + contrast."
- Pair it with a `frontend-design` skill for design direction if you have one.

## reskin  (OPTIONAL, off critical path)
- `skills/reskin/SKILL.md`. Generates divergent visual concepts in a *sibling* sandbox for
  short-form video. Never writes into the target project. Marketing, not finalizing the app.

## ship  (Phase 6)
- Your ship flow (a command or skill that pushes, verifies the deploy, logs a decision, and
  tags a release). Tier gating: friends/public run it fully; a solo tool can skip the
  portfolio and decision-log steps.

## readable-brief  (Phase 6, report)
- `skills/readable-brief/SKILL.md`. One self-contained interactive HTML page that it opens;
  markdown kept alongside for git. Use it to render the finish report.

## handoff  (optional, at a clean stopping point)
- `skills/handoff/SKILL.md`. Use if `/finish` pauses mid-way or the session is near its
  context boundary, so the next agent resumes cleanly.

## GTM agent credentials (Phase 5)
The launch agent in `assets/gtm-agent/` needs your own Twilio (and optionally email)
credentials. Put them in a colocated `secrets.env` (see `assets/gtm-agent/secrets.env.example`),
never hardcode them, and never commit real values. The agent only ever texts the single
`NOTIFY_PHONE` you set.
