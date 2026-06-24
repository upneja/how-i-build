# how I build with AI

Two things live in this repo: a short manual on how I actually use AI to build software, and the skills I use to do it. These are the skills I run in Claude Code every day. I cleaned them up and put them here so you can read them or install them.

Most AI-workflow writeups stay vague. This one points at files you can open. Every claim below maps to something in `skills/`, `commands/`, or `agents/`.

## The short version

Three ideas do most of the work.

**Compute is cheap, your attention isn't.** On a flat-rate plan the marginal cost of one more agent is close to zero, so I spend it freely. More compute buys depth: more critics, more independent passes, more research. The waste isn't spending tokens. The waste is shipping a bad decision you could have caught.

**Verify adversarially, not optimistically.** A model that wants to please you will agree with you. So I make models argue. Before I commit to a plan, I have one attack it. After I write code, I have a second model (usually Codex) review it as a hostile reviewer. A finding only counts if it survives a skeptic.

**Parallelize anything independent.** If two pieces of work don't share state, they run at the same time. One agent per file, one critic per claim, one researcher per angle. That is what multi-agent workflows and the `deep-research` skill are for.

## How I operate

I don't use one model for everything. I use the right tool for each step.

| Step | Tool | Why |
|---|---|---|
| Think through an ambiguous, high-stakes question | `deep-research` skill | multi-agent adversarial analysis instead of one confident guess |
| Pressure-test a plan before building | `steelman` skill | find the fatal flaw cheaply, while it's still just a plan |
| Design the loop before a long autonomous run | Looper (Kevin Simback) + `/loop`, `/goal` | spec the harness, rubric, and token budget so a bad loop doesn't burn tokens on slop |
| Design, plan, and write the code | Claude Code | best at holding a codebase in context and writing to match it |
| Audit the code as a hostile reviewer | Codex (OpenAI) | a second, independent model catches what the author stopped seeing |
| Fan out independent work in parallel | multi-agent workflows ("ultracode") | many agents, deterministic orchestration |
| Inherit or resume a messy project | `project-audit` skill | re-derive ground truth from the code, not from stale docs |
| Take a half-baked project the last mile and ship it | `finish` skill | decides the done-bar by audience tier, then does the work, with a privacy gate before anything public |
| Hand off across sessions or models | `handoff` skill | carry state forward, not the whole transcript |

The longer version is in [docs/operating-manual.md](docs/operating-manual.md).

## Principles

- Spend compute on rigor, not on rework.
- Code wins over docs. When they disagree, the docs are wrong.
- Ship the MVP, then improve it. Something people use beats a perfect thing they don't.
- Make the model prove it. Evidence before "done."

The reasoning behind each is in [docs/philosophy.md](docs/philosophy.md).

## The skills

Everything here installs into Claude Code. Each skill is a folder with a `SKILL.md` you can read top to bottom (commands and agents are single files).

**Thinking and rigor**

- **deep-research**: scores how ambiguous and consequential a question is, then runs multi-agent adversarial analysis at light, standard, or heavy intensity.
- **steelman**: attacks a plan as hard as a smart opponent would, before you build it, then keeps what survives.
- **project-audit**: a from-scratch, adversarial re-evaluation of an existing project to find what's stale, broken, or quietly drifted from reality.
- **handoff**: writes a session-bridge document so a fresh agent, or a different model, can pick up the work in a few minutes.

**Building and shipping**

- **reskin**: generates 10 very different, anti-generic visual reskins of a Next.js app, each committed to a distinct design archetype, so you can pick a direction fast.
- **frontend-ux-upgrader**: a subagent that audits and upgrades the look and feel of a frontend.
- **readable-brief**: turns a pile of findings into one self-contained HTML page that is the argument, instead of a folder of markdown you have to assemble in your head.
- **finish**: takes a half-baked project and finalizes it to the right bar for its audience (solo, friends, or public), then ships it, with a privacy gate before anything goes public.
- **ship**: an end-of-feature checklist. Push, verify the deploy actually went live, update your registry, log the decision.

**Workflow**

- **goal**: a persistent, long-running objective that survives across sessions, inspired by Codex's `/goal`.
- **inventory**: lists every skill, command, subagent, and hook in your setup, so you remember what you have.

## Install

These are plain files. Claude Code reads skills from `~/.claude/skills/`, commands from `~/.claude/commands/`, and subagents from `~/.claude/agents/`.

```bash
git clone https://github.com/upneja/how-i-build.git
cd how-i-build

# copy what you want (or symlink, see below)
cp -R skills/*   ~/.claude/skills/
cp    commands/* ~/.claude/commands/
cp    agents/*   ~/.claude/agents/
```

To stay in sync with updates, symlink instead of copy:

```bash
for d in skills/*/;   do ln -s "$PWD/$d" ~/.claude/skills/;   done
for f in commands/*;  do ln -s "$PWD/$f" ~/.claude/commands/; done
for f in agents/*;    do ln -s "$PWD/$f" ~/.claude/agents/;   done
```

Take one skill, not all of them, if that's all you want. They're independent.

## What's mine and what isn't

The skills in this repo are mine. The tools they run on are not, and they deserve credit:

- **Claude Code** and its multi-agent workflows (what I call "ultracode" here) are Anthropic's.
- **superpowers** is a third-party plugin that provides the skills framework plus disciplines I rely on constantly: brainstorming, test-driven development, systematic debugging.
- **Codex** is OpenAI's CLI, which I use as an independent, adversarial code reviewer.
- **Looper** is Kevin Simback's loop-design skill ([@KSimback](https://x.com/KSimback)). I run it before a long `/goal` to design the loop, its rubric, and its budget first.
- **`/loop` and `/schedule`** are Claude Code built-ins, for recurring and self-paced runs.

More detail, and links, in [docs/stack-and-credits.md](docs/stack-and-credits.md).

## License

MIT. Take anything here and use it. See [LICENSE](LICENSE).

By Ayush Upneja. More at [upneja.ai](https://upneja.ai).
