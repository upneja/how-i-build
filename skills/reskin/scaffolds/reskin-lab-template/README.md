# PLACEHOLDER Reskin Lab

This is a sandbox for evaluating visual reskin concepts of the `PLACEHOLDER` project.

**Do not deploy this.** It runs on port 3001 to avoid collision with the target project on 3000.

## Usage

```bash
npm install
npm run dev
```

Open `http://localhost:3001`.

## Commands (from the target project, not from here)

- `/reskin` — generates 10 new concepts (this lab is the output)
- `/reskin promote <run-id>/<archetype-slug>` — marks a concept as LIVE (v1.1)
- `/reskin cleanup` — deletes deprecated runs (v1.1)

## State

See `LIVE.md` for the currently-promoted concept.
