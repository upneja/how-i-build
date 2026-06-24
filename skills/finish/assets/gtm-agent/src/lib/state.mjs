// File-backed state. Tracks the pending proposal, which moves have fired, and a log.
// Good enough for a single-user GTM agent; swap for KV/SQLite if you need durability
// across redeploys on an ephemeral host.
import fs from "node:fs";

const DEFAULT = { pending: null, fired: [], log: [] };

export function loadState(path) {
  try {
    return { ...DEFAULT, ...JSON.parse(fs.readFileSync(path, "utf-8")) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveState(path, state) {
  fs.writeFileSync(path, JSON.stringify(state, null, 2));
}
