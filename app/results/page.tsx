import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget, hgetall } from "@/lib/kv";
import { ResultsBoard } from "@/components/ResultsBoard";

export default async function ResultsPage() {
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;

  if (!name) redirect("/");

  // Enforce blind picks: can't see results without having voted
  const myPick = await hget("picks", name);
  if (!myPick) redirect("/pick");

  const allPicksRaw = await hgetall("picks");
  const allPicks = Object.entries(allPicksRaw ?? {}).map(([voter, horse]) => ({
    voter,
    horse,
  }));

  return (
    <div className="min-h-screen pb-24">
      <ResultsBoard
        initialPicks={allPicks}
        myName={name}
        myHorse={myPick}
      />
    </div>
  );
}
