# Journey Extraction

Identifies the top 3 user-journey-critical screens of the target project. Output: 3 screens with name + 2-sentence purpose + key data shape. Persisted to `<lab>/src/lib/journeys.ts` as a typed export.

## Inputs (read in order)

1. **Routes** — `app/` or `pages/` directory of target project. For each route file, capture: path, top-level component, primary data shape (props, fetched data, server actions).
2. **Recent commits** — `git log --oneline -50` to see what was built recently and what was deprioritized.
3. **Explicit intent** — `README.md`, `CLAUDE.md`, any `*-spec.md` file at the project root. These describe what the project was supposed to be.
4. **Stack** — `package.json` for current Tailwind version, fonts already loaded, UI library in use.

## Rule

**Code wins over stale docs.** If `OLD_SPEC.md` describes a screen that doesn't exist in routes, the screen is dead — ignore it. If routes contain a screen the docs don't mention, treat it as real.

## Extraction prompt

> Given the route summaries below and the recent commit history, identify the top 3 screens that a user spends >80% of their time on. For each, state in two sentences:
> 1. What the user is *doing* on this screen (the verb)
> 2. What the visual and emotional center of gravity should be (e.g., for a card game lobby: "ambient anticipation, players visible, chat-pulse")
>
> Output JSON:
> ```json
> [
>   { "name": "lobby", "purpose": "...", "data_shape": "..." },
>   { "name": "round-reveal", "purpose": "...", "data_shape": "..." },
>   { "name": "voting", "purpose": "...", "data_shape": "..." }
> ]
> ```

## Output format

Write to `<lab>/src/lib/journeys.ts`:

```typescript
export type Journey = {
  name: string;
  purpose: string;
  data_shape: string;
};

export const JOURNEYS: Journey[] = [
  { name: "lobby", purpose: "...", data_shape: "..." },
  { name: "round-reveal", purpose: "...", data_shape: "..." },
  { name: "voting", purpose: "...", data_shape: "..." },
];
```

Each concept's hero/detail/action screens correspond to JOURNEYS[0]/[1]/[2] in order.

## Failure handling

- If <3 routes exist in the target project, generate the available count (1-2 concepts × N screens instead of 10 × 3). Note the limitation in the gallery.
- If route summary fails (e.g., binary file, parse error), skip that route silently.
- If conflicting signals between code and docs, log the conflict to `<lab>/src/lib/journeys-conflicts.md` for user review.
