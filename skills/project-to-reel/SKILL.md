---
name: project-to-reel
description: Use when you just shipped a project and want it turned into a talking-head short-form video brief, "make a reel/script for X", "brief me for filming X". Converts a completed project into a full brief (script at three lengths, hook variants, shot plan, edit instructions, per-platform captions, a filming-day card, and an editor handoff) ready to film and ship.
---

# project-to-reel

Turns a completed project into a publishable talking-head reel brief for TikTok / Instagram
Reels / YouTube Shorts. It produces the whole package: a script at three lengths, hook
variants, a shot plan, edit instructions, per-platform captions, a filming-day card, and an
optional editor handoff. It is a pipeline, not a one-shot prompt: each stage produces
structured output that feeds the next.

This is the framework. The judgment that makes the output good lives in **your own strategy
reference files** (your niche, your claim rules, your hook patterns). Those are yours to
write, the skill reads them. See `references/README.md` for what to create. Do not ship
generic slop: without a real strategy file, this produces a competent skeleton, not a hit.

## When it fires
Any of: "I just shipped X" + a content request, "make a reel/script for X", "brief me for
filming X". If the trigger is ambiguous, ask only: confirm the project name, the register
(talking-head energy), whether any specific person's pain it solves, and the editor-handoff
toggle.

## Your strategy reference (read first)
Before anything else, read your strategy reference (`references/strategy.md`, which you
supply). It is the source of truth for your niche, your content franchises, your claim
discipline, and your production grammar. Read the other references on demand, per the table
in `references/README.md`.

## Hard rules
1. **No stat, comparative claim, or algorithm "rule" without a source.** If your strategy or
   evidence file does not back it, soften it or block it.
2. **No invented outcomes.** "Saved 30 hours", "made $X" only if confirmed. Otherwise mark
   `outcome_needed`.
3. **No real name without explicit consent.** Ask first; otherwise use "a friend" /
   "someone I know."
4. **No "AI replaces profession X"** framing.
5. **No exact algorithm thresholds** ("3-second hold rate", "first hour is load-bearing").
6. **One franchise per video**, from your taxonomy.
7. **Always produce all three script lengths** (15s, 30s, 45s), default highlighted 30s.
8. **Always produce platform-native captions** (they differ across IG / TikTok / Shorts).
9. **Always produce the filming-day card** (a phone-readable single page).

## The pipeline
Run the stages in order. Keep your per-stage prompt detail in `prompts/` if you want it
separated; otherwise follow these directly.

1. **Ingest**: read the project. Output: name, slug, one-liner, who it is for, the pain it
   solves, available proof (live URL, screenshots, demo footage), visual demoability
   (strong/medium/weak), and privacy risks (real people, sensitive data on screen).
2. **Strategic gate**: pick the franchise; audit every risky claim against your claim
   rules; note required consents/redactions; verdict go / no-go / needs-proof. If
   needs-proof, stop and say what to gather.
3. **Hooks**: 5-6 hook variants across your patterns. For each: hook text, pattern,
   first-frame text-overlay note, and which words to stress.
4. **Script**: pick the strongest hook (mark recommended, keep the rest). Write 15s / 30s /
   45s versions, each with stress-marked spoken text, beat timestamps, word count, and
   estimated duration.
5. **Shot plan**: frame by frame: timestamp, frame type (talking-head / screen-record /
   b-roll / text-overlay), the visual instruction, the cut style, and a one-line reason.
6. **Edit grammar**: jump-cut policy, caption style spec, text-overlay placements, sound
   levels, and where to slow down or speed up.
7. **Captions + CTAs**: three platform-native variants (IG Reels, TikTok, YT Shorts), each
   ending in a specific question, not "drop a comment."
8. **Filming-day card**: one phone-readable page: outfit/location/lighting, the
   stress-marked script, beat timestamps, energy note, takes-per-beat target.
9. **Editor handoff (if outsourcing)**: a folder with what-to-deliver README, the chosen
   script, the shot plan, the chosen caption, 2-3 style-reference video URLs, a footage
   manifest, an outreach DM template, and a scoring rubric.
10. **Assemble**: render an HTML brief and a markdown brief to `briefs/{slug}-{date}.*`,
    then `open` the HTML.
11. **CMS push (optional)**: if you run a content database, POST the structured payload to
    it. If it is unreachable, write the payload JSON next to the brief and print the manual
    import command. Skip this stage entirely if you have no CMS.

## What you return
A one-paragraph summary, the path to the HTML brief, the CMS push status (if used), the top
3 risks to verify before filming (consent, unconfirmed outcomes), and the 3 highest-leverage
edits to make before shooting. Do not dump the full script in chat; point to the HTML brief.

## Edge cases
- No proof yet -> a `proof-needed` brief, listing what to gather.
- A real person without consent -> a `consent-needed` brief, listing the questions to ask.
- Sensitive (legal/medical/financial) -> flag every claim as directional or do-not-use, and
  recommend writing the script by hand through your claim checker.
- Off-niche -> say so; do not generate a generic script that breaks franchise discipline.
