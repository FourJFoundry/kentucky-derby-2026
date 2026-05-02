import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget, hgetall } from "@/lib/kv";
import { HORSES } from "@/lib/horses";
import { ResultsBoard } from "@/components/ResultsBoard";
import { isPicksLocked, getLockDisplay } from "@/lib/lockTime";

export default async function ResultsPage() {
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;

  if (!name) redirect("/");

  let sessionNames: string[] = [];
  try {
    sessionNames = JSON.parse(cookieStore.get("derby_session")?.value ?? "[]");
  } catch {
    sessionNames = [];
  }

  const myPick = await hget("picks", name);
  if (!myPick) redirect("/pick");

  const [allPicksRaw, scratchData] = await Promise.all([
    hgetall("picks"),
    hgetall("scratches"),
  ]);

  const scratchedSet = new Set(
    Object.entries(scratchData ?? {})
      .filter(([, v]) => v === "1")
      .map(([k]) => k)
  );

  const horses = HORSES.map((h) => ({ ...h, scratched: h.scratched || scratchedSet.has(h.name) }));

  const allPicks = Object.entries(allPicksRaw ?? {}).map(([voter, horse]) => ({
    voter,
    horse,
  }));

  return (
    <div className="min-h-screen pb-24">
      <ResultsBoard
        horses={horses}
        initialPicks={allPicks}
        myName={name}
        myHorse={myPick}
        isLocked={isPicksLocked()}
        lockDisplay={getLockDisplay()}
        sessionNames={sessionNames}
      />
    </div>
  );
}
