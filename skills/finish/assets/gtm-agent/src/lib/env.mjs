// Minimal .env loader, no dotenv dependency. Reads KEY=VALUE lines from a file
// and sets them on process.env only if not already set, so this runs from a bare
// `node` with no install.
import fs from "node:fs";

export function loadEnv(file) {
  try {
    const text = fs.readFileSync(file, "utf-8");
    for (const line of text.split("\n")) {
      if (line.trim().startsWith("#") || !line.includes("=")) continue;
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const key = m[1];
      const val = m[2].replace(/^["']|["']$/g, "");
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // No secrets.env present, rely on the ambient environment.
  }
}
