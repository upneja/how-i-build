# Operating manual

How a project actually moves from idea to shipped, and which tool does what at each step. This is the long version of the table in the README.

The throughline: a single model on a single pass is the weakest possible setup. Every step here adds either an independent perspective or parallelism, because both are cheap and both catch things one pass misses.

## 1. Decide if the question is even settled

Before building, I check whether I actually know what I'm building. Most wasted work comes from confidently executing the wrong thing.

If a question is ambiguous, consequential, or has several reasonable answers, I run `deep-research`. It scores the question first, then spins up multiple agents that argue different positions, with a critic trying to break each one. I get back a conclusion that already survived disagreement, instead of the first plausible answer one model produced.

For smaller forks where I already have a leaning, I just ask for the strongest case against my leaning and see if it holds.

## 2. Brainstorm the design before touching code

I use the `superpowers` brainstorming discipline here. It forces the design to exist, and to be approved, before any implementation. Even for small things. The projects that feel "too simple to design" are exactly where an unexamined assumption costs the most.

The output is a short written spec: purpose, constraints, what success looks like, and the chosen approach out of two or three.

## 3. Steelman the plan

Once there's a plan, I attack it. The `steelman` skill plays an intelligent opponent who wants the plan to fail, and looks for the flaw that would actually kill it. I'd rather find that flaw now, when it costs a paragraph, than after it costs a week of code.

What survives the attack is what I build. Sometimes the attack reshapes the plan entirely, which is the point.

## 4. Build with Claude Code

Claude Code does the implementation. It's the best at holding a real codebase in context and writing new code that matches what's already there, instead of generic code that has to be rewritten to fit.

For anything non-trivial I lean on test-driven development from `superpowers`: write the failing test first, then the code that makes it pass. Tests are also the cheapest form of the "make the model prove it" rule.

When the work splits into independent pieces, I fan it out with multi-agent workflows ("ultracode"): one agent per file or per task, running at once, with deterministic orchestration around them.

## 5. Review as a hostile reviewer

This is the step most people skip. The model that wrote the code is the worst judge of it, the same way you can't proofread your own writing.

So I bring in a second, independent model. Usually that's Codex, asked to review the diff as a hostile reviewer whose job is to find what's wrong, not to be agreeable. A finding only counts if it survives scrutiny, so I don't act on a critique until it's been pushed on. `superpowers` has a discipline for exactly this: receive the review with rigor, verify each point, don't perform agreement.

For a whole project rather than a diff, `project-audit` does the same thing at a larger scale: it re-derives what the project actually is from the code and flags everywhere the docs, the claims, or the README have drifted from reality.

## 6. Ship, and prove it shipped

The `ship` checklist closes out a feature. Push the code with a clean commit. Verify the deploy actually went live, not just that the build passed. Update whatever registry or portfolio tracks your projects. Log the decision so future-you knows why.

"Done" means verified, not asserted. The deploy is live or it isn't, and I check.

## 7. Hand off cleanly

Context windows end. Models get swapped. When that's coming, `handoff` writes a session-bridge document: the objective, current state, the decisions and why, the next action, and the few file pointers that matter. State, not a transcript. A fresh agent should be able to act within a few minutes of reading it.

`goal` does the long-horizon version of this, holding a persistent objective across many sessions so the thread doesn't reset every time.

## The shape of it

Research, design, attack, build, review, ship, hand off. At every step there is either a second opinion or parallel work, because the cost of both is low and the cost of a missed flaw is high. That trade pays off at every step, which is why it shows up in every skill here.
