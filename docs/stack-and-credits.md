# Stack and credits

The skills in this repo are mine. They run on top of tools that are not, and being clear about that line matters. Here is the full stack and who made what.

## What I built

The skills in `skills/`, `commands/`, and `agents/`. They encode how I work: the research, the adversarial checks, the shipping discipline, the design generation. They're the part of my setup that's portable and worth sharing, so they're here under MIT.

## What I run them on

**Claude Code** (Anthropic). The harness all of this lives in. It loads skills, runs subagents, and edits the codebase. Most of what I call "how I build" is really "how I use Claude Code well."

**Multi-agent workflows, "ultracode"** (Anthropic, part of Claude Code). The mechanism for fanning work out across many agents with deterministic orchestration: loops, fan-out, verify-then-synthesize. When I say I run a hundred-agent review, this is what does it. "ultracode" is my shorthand, not an official product name.

**superpowers** (third-party plugin, by Jesse Vincent). The skills framework plus a set of disciplines I lean on constantly: brainstorming a design before writing code, test-driven development, systematic debugging, code review you receive with rigor instead of performing agreement. Several skills in this repo assume these disciplines are available. It's MIT-licensed and installable through the official Claude Code plugin marketplace.
Find it at: https://github.com/obra/superpowers

**Codex** (OpenAI). I use it as a second, independent code reviewer. The model that wrote the code is the worst judge of it, so I bring in a different one with the explicit job of finding what's wrong. Using a competitor's model here is the point: independence is the value.

## The division of labor

The short rule: Claude for designing, planning, building, and writing. Codex for hostile review. deep-research and ultracode for anything that benefits from many independent passes at once.

Different models have different blind spots. Using more than one, and pointing them at each other, is cheaper and more reliable than trusting any single one to catch its own mistakes.

## A note on attribution

If you fork or extend these skills, keep the credit to Claude Code, superpowers, and the tools they depend on. The skills are mine to license. The platform underneath is not.
