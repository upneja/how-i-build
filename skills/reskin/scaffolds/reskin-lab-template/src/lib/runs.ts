import fs from "fs";
import path from "path";

export type RunStatus = "ACTIVE" | "DEPRECATED" | "PROMOTED";

export type Run = {
  id: string;
  status: RunStatus;
  archetypes: string[];
};

export function listRuns(): Run[] {
  const runsDir = path.join(process.cwd(), "src/app/runs");
  if (!fs.existsSync(runsDir)) return [];

  return fs.readdirSync(runsDir)
    .filter((name) => /^\d{4}-\d{2}-\d{2}-\d{4}$/.test(name))
    .map((id) => {
      const statusPath = path.join(runsDir, id, "status.md");
      const status: RunStatus = fs.existsSync(statusPath)
        ? (fs.readFileSync(statusPath, "utf8").trim().split("\n")[0] as RunStatus)
        : "DEPRECATED";
      const metaPath = path.join(runsDir, id, "meta.json");
      const archetypes: string[] = fs.existsSync(metaPath)
        ? JSON.parse(fs.readFileSync(metaPath, "utf8")).archetypes ?? []
        : [];
      return { id, status, archetypes };
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function getActiveRun(): Run | null {
  return listRuns().find((r) => r.status === "ACTIVE") ?? null;
}

export function getPromotedRun(): Run | null {
  return listRuns().find((r) => r.status === "PROMOTED") ?? null;
}
