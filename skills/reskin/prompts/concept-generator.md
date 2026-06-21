# Concept Generator Prompt

This prompt is sent verbatim to each of the 10 parallel sub-agents. Variables in `{{double_braces}}` are interpolated by the orchestrator.

---

You are generating ONE visual reskin concept for a Next.js project, in a sandbox repo.

## Constitutional rule

Slop is the absence of decisions, not the presence of any particular pattern. At every fork — font, palette, radius, density, motion, copy voice — commit. Any output that could have come from defaults is rejected. The archetype's hard tokens are not suggestions; they are the spec.

## Your archetype

```json
{{archetype_json}}
```

This is non-negotiable. Use these exact tokens.

## User journey screens

{{journey_screens_json}}

You generate three Next.js route files at:
- `<lab>/src/app/runs/{{run_timestamp}}/{{archetype_slug}}/hero/page.tsx` — for JOURNEYS[0]
- `<lab>/src/app/runs/{{run_timestamp}}/{{archetype_slug}}/detail/page.tsx` — for JOURNEYS[1]
- `<lab>/src/app/runs/{{run_timestamp}}/{{archetype_slug}}/action/page.tsx` — for JOURNEYS[2]

## Forbidden patterns (hard NO)

{{forbidden_patterns_content}}

## Process

1. WebFetch each `reference_urls` to ground your visual decisions in real human design work
2. Invoke the `frontend-design` skill with: hard tokens from your archetype, the three journey screens, and the forbidden-patterns list
3. Write the three Next.js route files (full TSX, importing fonts via `next/font/google` or `<link>` from `font_import_url`)
4. Write `<lab>/src/app/runs/{{run_timestamp}}/{{archetype_slug}}/brief.md` (≤200 words) covering:
   - Aesthetic stance (1 sentence)
   - Color logic (1-2 sentences explaining the palette ratio)
   - Motion philosophy (1 sentence)
   - What this archetype is uniquely good at communicating in a 2-sec reel cut

## Output

Confirm completion with: paths of the 4 files written + a 1-line summary of the aesthetic.

## Failure modes

- WebFetch fails on a reference URL: proceed with hard tokens only; note in brief
- `frontend-design` skill unavailable: error clearly to orchestrator; don't write partial files

## Anti-checklist (self-review before finishing)

Before declaring done, verify:
- [ ] Not a single instance of Inter / Roboto / Open Sans in the code (unless explicitly named in `font_display` as a substitute)
- [ ] Not `bg-indigo-500`, `text-violet-600`, or any purple-to-blue gradient (unless palette specifies)
- [ ] Not `rounded-2xl` everywhere — radii match `radii_scale`
- [ ] Not a centered hero + three icon-cards layout — committed to a layout primitive
- [ ] Copy references the actual product noun and a specific verb the user does — no "Build the future of X"
- [ ] Motion matches `motion_dna` — no `fade-in-up` if not specified

If any unchecked box, fix before returning.
