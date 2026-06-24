# GTM Playbook: the launch plan /finish produces (public tier only)

A good GTM plan is a concrete, executable launch plan with owners, sequence, and metrics,
not a generic template. Render it as styled HTML to read (markdown alongside), anchored to
your positioning. Then the textable agent (`assets/gtm-agent/`) makes it actionable: it
proposes the next move and you text "go."

## Your launch constraints, set these first
Every launch has constraints (a day job, a brand line you keep, channels you will or will
not use). Write yours down at the top of the plan and have the agent honor them. Examples of
the kind of thing that belongs here:
- Channels you will not use (e.g. no newsletter, no public "build in N days" challenges).
- Things you will not publish (e.g. revenue numbers).
- Positioning stated in one consistent form, employer-safe, with no fabricated metrics.

## The plan's required sections
1. **Positioning line**: one sentence, in your brand voice, employer-safe.
2. **Who it's for**: the specific audience and the one job it does for them. Name the wedge
   segment, not "everyone."
3. **Proof / receipts**: the true, sourced facts that make it credible (passing tests,
   what's live, real usage). No reach.
4. **Channel mix**: pick from what is actually available and on-brand (a thread or data-viz
   post, a short-form video, a friend network, in-person distribution). Map each channel to
   the audience above.
5. **Launch sequence**: an ordered, dated list of moves (soft-launch to a small group, then
   public post, then follow-ups). Each move is a discrete action the agent can hold and fire.
6. **Copy hooks**: 2-3 drafted opening lines per channel, in voice (taste-rubric: no em
   dashes, no performative punch lines). These are drafts the agent texts for approval.
7. **Metrics**: what success looks like and how it's measured (signups, core-action
   completions, shares). Define the one number that matters.
8. **Research angle (optional)**: if the work is research-shaped, note any publishable
   measurement, benchmark, or negative-result angle and its venue.

## Wiring the plan into the agent
Each launch-sequence move becomes a GTM **action** in the agent's action registry
(`assets/gtm-agent/src/lib/actions.mjs`). For each: an `id`, a human label, the proposed
message/post text (drafted in voice), and an `execute()` that is left **stubbed** in the
scaffold. The agent texts you the proposal; on "go <id>" it runs `execute()`. Until you wire
a real executor (post to a platform, send via your email cred, etc.), `execute()` only
records that it was confirmed, so the agent is safe by construction and cannot post on its
own.

## What the agent is for (the day-to-day)
You text the agent and it answers from the plan:
- "what's next": the next un-fired move + its drafted copy, as a proposal.
- "go <id>": confirm + run that move's executor.
- "status": which moves fired, the current metric.
- "draft a post about <x>": a proposed draft in voice, never auto-sent.
Outward actions are draft-by-default. The only number it talks to is yours.
