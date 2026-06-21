import { redirect } from "next/navigation";
import { getActiveRun } from "@/lib/runs";

export default function Home() {
  const active = getActiveRun();
  if (active) {
    redirect(`/runs/${active.id}/gallery`);
  }
  redirect("/gallery");
}
