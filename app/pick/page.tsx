import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget } from "@/lib/kv";
import { HORSES } from "@/lib/horses";
import { fetchLiveOdds } from "@/lib/odds";
import { PickGrid } from "@/components/PickGrid";

export default async function PickPage() {
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;

  if (!name) redirect("/");

  // Already picked → go to results
  const existingPick = await hget("picks", name);
  if (existingPick) redirect("/results");

  const oddsMap = await fetchLiveOdds();

  return (
    <div className="min-h-screen">
      <PickGrid horses={HORSES} oddsMap={oddsMap} pickerName={name} />
    </div>
  );
}
