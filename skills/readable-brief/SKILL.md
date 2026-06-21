---
name: readable-brief
description: Use when handing the user findings, a plan, an audit, research, or strategy to actually READ — when they say "make this readable", "give me a cohesive narrative", "I don't want links to markdown files", "the display is lacking", or whenever you'd otherwise dump raw .md files. Use after a steelman, project-audit, or deep-research to present the conclusion. Produces one self-contained interactive HTML artifact, not a folder of markdown.
---

# Readable Brief

Turn a body of work into **one self-contained HTML page that IS the argument** — a scrollable narrative the user reads top-to-bottom and understands, not a pile of markdown links they have to assemble themselves. Then `open` it.

**Core principle (artifact-as-argument): show, don't tell, and make the single hardest-to-grasp idea interactive.** The markdown is for version control; the HTML is for understanding. A link to `findings.md` is not a brief.

## When to use

- Presenting the output of a `steelman`, `project-audit`, `deep-research`, or any multi-part analysis
- The user signals the current display is hard to read / too fragmented / too raw
- Any moment you're about to say "see `docs/X.md`, `docs/Y.md`..." — build the brief instead

## What makes it land (the learnings)

1. **Bottom-line up front.** Lead with the verdict — what's fatal, what survives, the one recommended move. Don't make them scroll to find the point.
2. **One narrative, numbered sections**, each with a one-line eyebrow + a punchy `<h2>`. The page should read like an essay, not a dashboard.
3. **Make the hardest idea interactive.** The single highest-impact element is a *worked example the user can drive* — a toggle (weak vs. strong, before vs. after), a small animation, an inline chart drawn in SVG. One great interactive beats ten static cards. (In practice: a "run the match" toggle that animated a transcript and flipped a red→green test board did more than any paragraph.)
4. **Charts in inline SVG**, hand-drawn to the argument (e.g. two curves + a shaded delta), captioned with the takeaway — not a chart library.
5. **Surface the honest caveat, don't bury it.** A gold callout that states the real risk earns more trust than a clean story. (The user notices when you hide it.)
6. **Tasteful, never AI-slop.** No generic card grids, no purple-on-white gradients, no Inter/Roboto. Verify text contrast. Commit to a distinct aesthetic.

## Design tokens (copy-paste start)

```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800,900&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,400;9..144,0,600;9..144,1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```
- **Fraunces** (serif) → display headlines & pull-quotes · **Cabinet Grotesk** → section headings/labels · **Satoshi** → body · **JetBrains Mono** → code, eyebrows, data. **Never** Inter/Roboto/system.
- **Theme by audience:** light/clean/warm-paper for shareable, external, or strategic docs; dark *only* for personal dev tooling. Default light.
  - Light palette that works: `--bg:#f7f4ee; --card:#fffefb; --ink:#15202e; --ink2:#48566c; --line:#e6e2d8;` + one accent (navy `#1b3a5b` or oxblood `#7c2d12`), red `#b03b24` / green `#1f7a4d` / gold `#9a6b14` for fatal/survives/caveat.
- Constrain reading width to ~660–680px; let figures/cards go wider (~860px).

## Build steps

1. Pull the conclusions from the source docs (don't make the user open them).
2. One `.html` file: inline `<style>` + inline `<script>`, fonts via the CDN links above, **no build step, no external JS deps.** Must open by double-click.
3. Structure: hero (kicker + Fraunces headline + dek) → BLUF → numbered sections → one interactive worked example → an SVG chart if there's a quantitative claim → a visual plan/next-steps → honest-caveat callout → a small footer with the file links *as appendix*, not as the main content.
4. `open <file>.html` when done. Keep a markdown source alongside for git (HTML for reading, md for version control).

## Interactive worked-example pattern (the high-value move)

A `<div>` with a toggle of two states + a "Run" button that step-reveals turns (`setTimeout` staggering opacity) and flips an indicator panel at the end. ~40 lines of vanilla JS, no deps. Use it to make an abstract claim concrete and clickable — it's the element users remember.

## Common mistakes

| Mistake | Fix |
|---|---|
| Handing over `docs/*.md` links | Build the page; links are an appendix at most. |
| Wall of text, no visual hierarchy | Eyebrows + Fraunces h2s + cards + one chart. |
| A chart library / iframe | Hand-draw inline SVG to the exact argument. |
| Interactive everything | One great interactive (the hardest idea), not ten widgets. |
| Burying the caveat / the bottom line | BLUF at top; honest-risk callout visible. |
| Inter/Roboto, purple gradient, generic cards | Real type, distinct aesthetic, verified contrast. |

## Related

Consumes the output of `steelman` / `project-audit` / `deep-research`. For 10 divergent visual *reskins* of a shipping app (not a brief), use `reskin` instead.
