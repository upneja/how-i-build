# Slop Critic Prompt

This prompt is sent verbatim to the single critic agent after Stage 3 generation. Variables in `{{double_braces}}` are interpolated.

---

You are reviewing 10 reskin concepts for AI-slop. You score each on 8 axes (0-10 per axis), flag any concept scoring <5 on ≥2 axes, and generate explicit regen feedback.

## The 8 axes

1. **Typography commitment** (0-10) — Does the concept use ≥3 weights? Display + text pair? Or did it default to one weight + one family?
2. **Palette commitment** (0-10) — Is there a dominant/supporting/accent ratio? Or is everything neutrals + one accent?
3. **Layout primitive** (0-10) — Is there one strong layout primitive repeated, or is it the SaaS-default scroll order?
4. **Copy specificity** (0-10) — Does copy reference the actual product noun and a specific verb? Or is it "Build the future of X" / "Get Started"?
5. **Motion personality** (0-10) — Does motion match the archetype's `motion_dna`? Or is it `fade-in-up` + `hover:scale-105` defaults?
6. **Reference fidelity** (0-10) — Could a viewer see this and clock which reference URL inspired it? Or is it generic?
7. **Video-cut recognizability** (0-10) — Would a 2-second IG reel cut of this be visually distinct? Or would it blend with any other AI-generated app?
8. **Decision density** (0-10) — At every fork (font, color, radius, density, motion, voice), was a decision *made*? Or were defaults left to fill in?

## The 10 concepts

{{concepts_summary_json}}
<!-- each entry has: archetype_slug, brief, paths to the 3 route files, archetype_json -->

## Inputs available to you

- Read each route file's source to score axes 1-5
- Compare against `forbidden-patterns.md` (in this skill directory) to detect slop
- Compare against the archetype JSON to score axes 5-7

## Output schema

```json
{
  "scores": [
    {
      "archetype_slug": "bloomberg-brutalist",
      "axes": { "typography": 9, "palette": 8, "layout": 7, "copy": 6, "motion": 8, "reference": 9, "video_cut": 9, "decision_density": 8 },
      "overall_pass": true,
      "regen_feedback": null
    }
  ],
  "regen_targets": ["concept-slug-1", "concept-slug-4"]
}
```

A concept's `overall_pass` is `false` if it scored <5 on ≥2 axes.

For each `false`, write `regen_feedback` as 2-3 sentences naming the specific failures and how to fix them. Examples:
- "Used `rounded-2xl` on cards despite `radii_scale: [0,0,0]`. Strip all border-radius. Verify hairline 1px rules instead of card surfaces."
- "Copy reads 'Build the future of voting' — generic. Bloomberg Brutalist must reference the actual data being shown; use noun-verb specifics like 'See who's lying about pizza'."

## Dispatch regens

After scoring all 10, dispatch one regen sub-agent per `regen_target` with:
- The original concept's archetype JSON
- The journey screens
- The `regen_feedback` as the primary instruction
- A constraint: regenerated concept must score ≥5 on every previously failed axis

After regens complete, re-score the affected concepts. Update `<lab>/src/app/runs/{{run_timestamp}}/meta.json` with final scores. Any concept still failing after one regen cycle: accept and add a yellow warning banner to its brief.

## Output

Write `<lab>/src/app/runs/{{run_timestamp}}/meta.json` containing the full scores object, archetype list, journey screens, and run timestamp.
