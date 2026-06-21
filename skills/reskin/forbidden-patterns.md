# Forbidden Patterns — The AI-Slop Blocklist

These are concrete design tells that mark UI as AI-generated. Any concept that includes them gets sent back to the slop-critic for regeneration. This list is appended to the concept-generator prompt verbatim.

**Constitutional rule:** Slop is the absence of decisions. At every fork — font, palette, radius, density, motion, copy voice — commit. Any output that could have come from defaults is rejected.

## Typography (8 signals)
1. Inter, Roboto, Open Sans, Lato, Arial, system-ui, Geist, Space Grotesk as defaults
2. Single font family across headings, body, labels, buttons (no typographic pairing)
3. Flat type hierarchy — only 2-3 sizes, ratios too close (e.g., 14/16/20px)
4. Gradient text on H1s as the only "personality" move
5. Monospace as shorthand for "technical" (JetBrains Mono on a non-dev product)
6. Only font-weights 400 and 700 — no 300/500/600/800 contrast play
7. Tight line-height (<1.3) on body
8. Wide letter-spacing (>0.05em) on body

## Color (8 signals)
9. Purple-to-blue gradients (`from-indigo-500 to-purple-600`, `#7C3AED`) — the canonical AI tell
10. `bg-indigo-500` / `text-indigo-600` as primary
11. `slate-50` / `neutral-900` neutrals with no tinted personality
12. Dark mode + colored box-shadow glow as "cool default"
13. Cyan-on-dark "neural network" palette
14. Pure `#000000` background (vs tinted near-black)
15. Timid evenly-distributed palette — no dominant + accent ratio
16. Gray text on colored backgrounds failing WCAG AA

## Layout (8 signals)
17. Centered hero: big text + subtext + one CTA + ghost button
18. Three feature cards directly below hero, each icon + heading + 2 lines
19. Everything center-aligned instead of left-aligned with asymmetry
20. Standard SaaS scroll order: hero → logo bar → 3 features → how-it-works → pricing → testimonial → FAQ → CTA
21. Cards-in-cards
22. Monotonous spacing — same 16/24/32 rhythm
23. Dashboard: sidebar + 4 stat cards on top + chart + table
24. Hero metric layout: huge number + small label + three supporting stats

## Component (10 signals)
25. `rounded-2xl` on every card (16px universal border-radius)
26. Subtle box-shadow at 0.1 opacity on everything
27. Side-tab thick accent border on cards
28. Icon tile above heading (small rounded-square colored container)
29. Unmodified shadcn/ui card+button defaults
30. Lucide icon set defaulting — same 1600 strokes everywhere
31. Glassmorphism / backdrop-blur as decoration not function
32. Reflexive modal usage for anything non-trivial
33. Every button styled as primary — no visual hierarchy
34. Decorative sparklines that encode no data

## Copy (6 signals)
35. "Build the future of X" / "Your all-in-one platform" / "Scale without limits" headlines
36. "Empowering Your Journey" / "Unlocking the Future" / "Transforming Tomorrow"
37. "Get Started" + "Learn More" CTA pair
38. Testimonial slot: "John D., CEO" with placeholder avatar
39. Hedging language ("may help you", "can potentially") + superlatives ("best-in-class", "cutting-edge")
40. Redundant copy — subhead restating headline

## Motion (5 signals)
41. `fade-in-up` on scroll for every block
42. Hover: `scale-105` + shadow bloom as the only interaction
43. Bounce/elastic easing (feels dated and tacky)
44. Buttons that snap (no easing) — note: this is slop only when inconsistent with the rest; archetypes like CRT Terminal *require* no easing
45. Animating layout props (width/height/padding) causing jank

## Imagery (3 signals)
46. 3D clay-morphic blobs / glossy spheres (plastic, slightly-too-symmetrical)
47. "Diverse team viewing laptop in well-lit office" stock photo
48. Abstract gradient meshes / generic "neural network" particle hero backgrounds

## Why this happens (meta-patterns)

- **Distributional convergence.** LLMs predict the median of training data; with 2018-2023 SaaS tutorials and Tailwind UI dominating, the median *is* indigo-500 + Inter + rounded cards.
- **Convergent safety.** Without forbidden lists, models regress to defaults that "offend no one."
- **Token-cost path of least resistance.** `shadcn` + `lucide` + `bg-indigo-500` is the shortest token sequence that yields a working UI.

## Nuance (don't over-correct)

- Rounded corners aren't slop — *uniform* rounded corners on every surface are
- Inter isn't always wrong — Inter Tight or Inter as a deliberate substitute is acceptable
- Purple isn't poisoned — `indigo-500 → purple-600` *as the brand decision* is the tell
- shadcn isn't bad — *unthemed* shadcn is
- Centered hero isn't always slop — reflex-defaulting to it is
- Three-card feature grids work when cards have genuine asymmetry
- Dark mode is fine — defaulting to dark mode to skip a color decision is the tell

**Heuristic:** slop is the absence of decisions, not the presence of any particular pattern. Was every decision *made*, or was it *skipped*?
