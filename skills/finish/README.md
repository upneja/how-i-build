# /finish

> Takes a project from works-on-my-machine to actually finished, then ships it.

![Claude Code skill](https://img.shields.io/badge/Claude_Code-skill-d97706)
![GTM agent](https://img.shields.io/badge/GTM_agent-zero--dependency-0a0a0a)
![license](https://img.shields.io/badge/license-MIT-555)

`/finish` is a Claude Code skill that finalizes a half-baked project. It decides what
"finished" means for *this* project, then does the work, instead of handing you a
checklist. It runs a six-phase loop, classifies the project into one of three audience
tiers (solo, friends, public), holds it to that tier's done-bar, and for public launches
scaffolds a launch agent you can text. Four hard rails keep it from doing anything it
cannot take back.

It is an orchestrator. It composes skills you already have (audit, red-team, design,
research, ship) rather than reinventing them. The judgment that is unique to it is the
tier call, capped taste-driven scope-pushing, and launch readiness.

## What a run looks like

```text
> /finish

Finishing: party-pulse  (Next.js + Supabase, multiplayer party game)

Phase 0 · Intake
  Live custom domain, real users. Local skills found: debug-game, mobile-qa (preferred over generic builds).

Phase 1 · Audit
  HIGH   unauthenticated AI endpoint, no rate limit  (anyone can burn the key)
  HIGH   docs say 2 games, code ships 5              (drift)
  MED    no SEO/OG, dead iOS code, no error states

Phase 2 · Tier  →  PUBLIC
  Evidence: custom domain + a populated marketing/ dir + a named audience.
  Done-bar: privacy scrub, scale measures, SEO/OG, full UI states, GTM.

Phase 3 · Plan
  complete  schema fix · rate-limit · doc rewrite · SEO/OG
  cut       dead iOS code · abandoned branch
  defer     row-TTL, open RLS        (logged as ADRs)
  push (3)  shareable result card · named display font · empty/error states   (each cites the taste rubric)

Phase 4 · Execute
  built · all four UI states · scale measures · privacy-scan --since: clean · tests + typecheck + build green

Phase 5 · GTM + agent   (public only)
  gtm-plan.html written. Textable agent scaffolded, draft-by-default, executors stubbed.
  ./deploy.sh to take it live.

Phase 6 · Ship
  pushed · deployed · finish-report.html opened.
  Gated for your OK: prod deploy (live users) · making the repo public · portfolio write · any real send.
```

## Why this exists

Projects get to ninety percent and stall. Features are half-built. Nobody thought about
what happens under load, or whether it is even meant to scale. It is unclear if the thing
is for you, for a friend, or for the world, so it gets finished to no standard in
particular. `/finish` makes those calls and carries them out, so "done" stops being a
vague feeling and becomes a bar the project either clears or does not.

## When to use it, and when not to

Use it when a project works but is not finished: half-built features, no thought given to
traffic or scale, no clear audience, or you just want it taken the last mile and shipped.

Do not use it as a code generator for a greenfield idea (it finalizes what exists, it does
not invent the product), as a substitute for a real design review on a flagship, or on a
non-software repo. If the project needs a rewrite, that is a different job; `/finish` will
say so rather than smuggle one in under a three-item scope cap.

## How it works

### Tier sets the bar

The audience decides when a project is done. `/finish` classifies first, then holds the
project to that tier and nothing more. Over-finishing a personal tool is as wrong as
under-finishing a launch.

| Tier | Who it is for | Must clear | Skips |
|------|---------------|-----------|-------|
| **solo** | just you | core path works, no slop aesthetic, basic error states, commits clean | auth, scale, SEO, GTM, custom domain |
| **friends** | a known group | gated access, all four UI states, real error handling, a distinctive look, a real domain | full SEO, analytics, load planning, GTM |
| **public** | the world | everything above + privacy scrub, scale measures, SEO/OG, employer-safe copy, a GTM plan + launch agent | nothing |

Two traps it is built to avoid: "no auth" describes a product's login model, not its
audience (a no-login multiplayer app is still public), and a custom domain or a populated
`marketing/` directory outranks the auth signal toward public.

### The loop

```
intake → audit → classify tier → plan (complete/cut/defer) → execute → GTM + agent → ship + report
```

It runs fully autonomously. It decides the tier and the plan on a taste rubric, logs each
executive call as a reversible ADR, and only stops for the four acts below.

### The hard rails

These are the only things it will not do unattended:

1. **Make a private repo public.**
2. **Send anything real or post publicly.**
3. **Deploy to production when the app already has live users.** A green build is a quality
   gate, not a safety gate.
4. **Write to your portfolio source of truth.** Portfolio copy is treated as outbound.

Everything else (building, polishing, scaling, deploying a project with no users, writing
the plan, scaffolding the agent) runs without a checkpoint. Two more rails are always on: a
privacy gate that blocks the publish path on any secret, PII, or employer reference, and a
taste gate on every line of copy.

### Scope-pushing, capped

`/finish` is allowed to extend the original idea, because finishing sometimes means
adding the obvious missing thing. The cap is three additions, and each one must cite a
specific rule in the taste rubric and advance the current tier's bar. Anything past three
goes on a "future" list. That is how it pushes boundaries without quietly turning into a
rewrite.

## The launch agent

For public-tier projects, `/finish` writes a GTM plan and scaffolds an agent you can text.
You text it, it proposes the next launch move, and it only acts after you reply `go`. It is
**draft-by-default**: the scaffold ships with every outward action stubbed, so it cannot
post or send until you wire it, and even then the send is reachable only through the
confirm path. It talks to exactly one number. It is zero-dependency Node, validates the
inbound webhook signature, and ships with a safety simulation:

```bash
cd assets/gtm-agent && npm test          # 19 checks: propose, confirm, refuse-unconfirmed, ignore strangers
./deploy.sh                              # deploy on demand; runs the simulation first
```

## Install

`/finish` is a Claude Code skill. Drop it into your skills directory and it registers:

```bash
git clone https://github.com/upneja/how-i-build
cp -r how-i-build/skills/finish ~/.claude/skills/finish
chmod +x ~/.claude/skills/finish/scripts/privacy-scan.sh
```

Then, from any project, invoke it in Claude Code:

```text
/finish
```

or just say "finish this project" / "make this launch-ready."

**Requirements:** Claude Code, Node 18+ (for the privacy scanner and the launch agent),
and a git repo for the project you are finishing.

## What is in the box

The section list is the inventory:

```
finish/
  SKILL.md                       the six-phase orchestrator
  references/
    taste-rubric.md              the bar a finished artifact must clear
    tier-rubric.md               the three done-bars + tier detection
    gtm-playbook.md              the launch-plan structure
    composes.md                  how it calls every other skill, in order
  scripts/
    privacy-scan.sh              the publish-blocking secret/PII/employer scan
  assets/
    gtm-agent/                   the textable, draft-by-default launch agent
```

## Customizing it

The skill is opinionated on purpose. The rubrics in `references/` encode one person's
taste, tier bar, and privacy rules. To make it yours, edit those files: change the banned
and preferred fonts, the tier done-bars, the privacy patterns in `privacy-scan.sh`, and the
launch channels in `gtm-playbook.md`. The loop in `SKILL.md` stays the same; the taste it
applies is yours to set.

## Limitations

It finalizes; it does not architect from scratch. The tier call is a judgment, logged as an
ADR so you can override it. Scope-pushing is deliberately capped, so it will leave good
ideas on a "future" list rather than chase them. The launch agent is a scaffold: it is safe
and testable out of the box, but the real outward actions are yours to wire. And the privacy
scanner is a floor, not a guarantee, so the skill reasons past it before anything ships.

## License

MIT. Part of [how-i-build](https://github.com/upneja/how-i-build).
