---
name: steelman
description: Use before committing to a plan, design, thesis, architecture, or strategy — when the user says "steelman", "poke holes", "red-team", "pre-mortem", "play devil's advocate", "what am I missing", "should we even do this", "question everything", or when you proposed something and might be stuck in a yes-loop. Also use before ExitPlanMode on a consequential plan. NOT for generating new ideas (brainstorming) or external fact-finding (deep-research).
---

# Steelman

Attack a plan as hard as an intelligent enemy would, **before** you build it — then keep what survives and follow where the strongest attack points. The goal is to find fatal flaws cheaply and surface a better shape, not to defend what's already decided.

**Core principle: the most damaging attack usually comes from the plan's own evidence, and it often points at a better plan.** The flaw that kills v1 is frequently the most interesting finding in the building (e.g. "a benchmark the pitch cites as proof actually shows the effect shrinking over time" → "then the shrinking curve is the real product").

## When to use

- About to commit to an architecture, product direction, research framing, or business bet
- The user asks you to challenge, red-team, pre-mortem, or pressure-test something
- **You proposed it** — self-review is where yes-machine drift hides. Attack your own work hardest.
- Before `ExitPlanMode` on anything consequential or hard to reverse

## The five disciplines (these are the learnings — don't skip them)

1. **Attack the originator's own ideas hardest.** If the user came up with it, that's exactly where the unexamined assumption lives. Politeness here is malpractice.
2. **Turn their own evidence against them.** The sharpest objections come from re-reading the sources/data the plan *cites as support* (a source the plan leans on quietly tested the opposite hypothesis; data that contradicts the pitch).
3. **Rate fatal vs. serious vs. fixable.** A fatal attack sinks the premise; a fixable one is a patch. Don't let ten nitpicks bury the one that ends the project.
4. **Each critic must also say what survives and what they'd do instead.** Pure demolition is useless; you need the salvage and the alternative.
5. **The synthesis must be willing to recommend KILL or PIVOT** — not a defense of the status quo. If the honest answer is "don't build this," say it.

## Method

Decompose the plan into its **load-bearing pillars** — typically: the *premise* (is this worth doing / durable?), the *core construct or assumption*, the *mechanism* (does the engine work?), the *format/economics*, and *fit to the actual goal*. Then fan out adversaries, one per pillar, plus a few who design alternatives from scratch, then synthesize.

**Scale to stakes:**
- **Light** (a feature, a section): 2–3 critic subagents via the Agent tool, inline synthesis.
- **Heavy** (a product direction, a paper, a thesis, a $-or-time-load-bearing bet): run the Workflow in `steelman-workflow.js` — 5–6 pillar critics + 3–4 ground-up alternative designs + a synthesis judge. Tokens are justified here; this is the call that's expensive to get wrong.

**REQUIRED:** adapt and run `steelman-workflow.js` (sibling file) for heavy steelmans rather than re-deriving the structure. It encodes the critic + alternative + synthesis schema. Edit the `DESIGN` string and the pillar mandates to the case at hand.

After the workflow returns: read every critic, accept the fatal attacks out loud (don't soften them for the user), and write the synthesis yourself if the judge agent fails — the recommended path is your judgment to make.

## Output shape

Lead with the **bottom line**: which attacks are fatal, what survives, and the single recommended path (which may be *modify*, *replace with an alternative*, or *a de-risking sequence* — rarely "proceed unchanged"). Then the concrete next move, ideally **the cheapest experiment that decides whether to build at all** (front-load the gate; don't build to find out).

## Common mistakes

| Mistake | Fix |
|---|---|
| Balanced "pros and cons" | Steelman ≠ balance. Be a genuine enemy first; salvage second. |
| Sparing the user's pet idea | That's the one to hit hardest. |
| Burying the fatal attack among nits | Severity-rank. One fatal > ten fixable. |
| Synthesis defends the plan | Synthesis serves the truth. KILL/PIVOT must be on the table. |
| Demolition with no alternative | Every critic proposes what they'd do instead; designers build full alternatives. |

## Related

Complements `superpowers:brainstorming` (generative, before steelman) and `deep-research` (external facts). Pairs with `project-audit` (which evaluates what *exists*; steelman evaluates what's *planned*).
