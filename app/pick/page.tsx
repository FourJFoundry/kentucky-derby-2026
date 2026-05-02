import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget, hgetall } from "@/lib/kv";
import { HORSES } from "@/lib/horses";
import { fetchLiveOdds } from "@/lib/odds";
import { PickGrid } from "@/components/PickGrid";
import { isPicksLocked, getLockDisplay } from "@/lib/lockTime";

export default async function PickPage() {
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;

  if (!name) redirect("/");

  const locked = isPicksLocked();
  if (locked) redirect("/results");

  const [existingPick, scratchData, oddsMap] = await Promise.all([
    hget("picks", name),
    hgetall("scratches"),
    fetchLiveOdds(),
  ]);

  const scratchedSet = new Set(
    Object.entries(scratchData ?? {})
      .filter(([, v]) => v === "1")
      .map(([k]) => k)
  );

  const horses = HORSES.map((h) => ({
    ...h,
    scratched: h.scratched || scratchedSet.has(h.name),
  }));

  return (
    <div className="min-h-screen">
      <PickGrid
        horses={horses}
        oddsMap={oddsMap}
        pickerName={name}
        existingPick={existingPick ?? null}
        isLocked={locked}
        lockDisplay={getLockDisplay()}
      />
    </div>
  );
}
