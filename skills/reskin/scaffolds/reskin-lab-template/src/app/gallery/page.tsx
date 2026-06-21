import { listRuns, getPromotedRun, getActiveRun } from "@/lib/runs";
import Link from "next/link";

export default function CrossRunGallery() {
  const runs = listRuns();
  const promoted = getPromotedRun();
  const active = getActiveRun();
  const deprecated = runs.filter((r) => r.status === "DEPRECATED");

  return (
    <main style={{ fontFamily: "system-ui", padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Reskin Lab</h1>

      <section style={{ marginBottom: 32, padding: 16, background: promoted ? "#E6F4EA" : "#F5F5F5", border: "1px solid #ccc" }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 8 }}>LIVE (Promoted)</h2>
        {promoted ? (
          <Link href={`/runs/${promoted.id}/gallery`}>{promoted.id} — {promoted.archetypes.join(", ")}</Link>
        ) : (
          <p style={{ margin: 0, color: "#666" }}>No concept promoted yet. Manually edit LIVE.md and mark a run&apos;s status.md as PROMOTED to promote.</p>
        )}
      </section>

      <section style={{ marginBottom: 32, padding: 16, background: "#E8F0FE", border: "1px solid #1A73E8" }}>
        <h2 style={{ fontSize: 18, margin: 0, marginBottom: 8 }}>ACTIVE (Latest run)</h2>
        {active ? (
          <Link href={`/runs/${active.id}/gallery`}>{active.id} — {active.archetypes.join(", ")}</Link>
        ) : (
          <p style={{ margin: 0, color: "#666" }}>No runs yet. Invoke /reskin from a target project.</p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Deprecated runs</h2>
        {deprecated.length === 0 ? (
          <p style={{ color: "#999" }}>No deprecated runs.</p>
        ) : (
          <ul style={{ paddingLeft: 16 }}>
            {deprecated.map((r) => (
              <li key={r.id} style={{ color: "#999", marginBottom: 4 }}>
                <Link href={`/runs/${r.id}/gallery`} style={{ color: "#999" }}>{r.id}</Link> — {r.archetypes.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
