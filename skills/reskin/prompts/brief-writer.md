# Brief Writer Prompt (v1: folded into concept-generator)

In v1, each concept-generator sub-agent writes its own brief as Step 4 of its workflow (see `prompts/concept-generator.md`).

This file exists as a placeholder for v2 if briefs need a dedicated agent (e.g., for cross-concept consistency in voice or for richer briefs that compare against the other 9 concepts).

## Brief structure (≤200 words)

1. **Aesthetic stance** (1 sentence). What this concept commits to. Example: "Bloomberg Brutalist treats every interaction as a stock-ticker row — dense, hyperlinked, monochrome with one electric blue accent."
2. **Color logic** (1-2 sentences). The dominant/supporting/accent ratio and why. Example: "Black ink does 95% of the work; hyperlink blue (#0000EE) marks every actionable element; pure white is the substrate. Zero neutrals."
3. **Motion philosophy** (1 sentence). How motion serves the archetype. Example: "Tickers scroll continuously; state changes are hard cuts; nothing eases."
4. **2-sec reel hook** (1 sentence). What a viewer sees in a fast cut. Example: "A condensed-black headline, a marquee tickers below it, and a single underlined hyperlink-blue word."

## Anti-patterns

- No filler ("This design is elegant and modern")
- No reference to forbidden patterns
- No defensive hedging ("might work well for")
