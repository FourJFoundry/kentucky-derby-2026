import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget, hgetall } from "@/lib/kv";
import { HORSES } from "@/lib/horses";
import { RaceGame } from "@/components/RaceGame";

export default async function RacePage() {
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;

  if (!name) redirect("/");

  const [myPick, scratchData] = await Promise.all([
    hget("picks", name),
    hgetall("scratches"),
  ]);

  if (!myPick) redirect("/pick");

  const scratchedSet = new Set(
    Object.entries(scratchData ?? {})
      .filter(([, v]) => v === "1")
      .map(([k]) => k)
  );

  const horses = HORSES.filter((h) => !h.scratched && !scratchedSet.has(h.name));

  return (
    <div className="min-h-screen">
      <RaceGame horses={horses} myPick={myPick} myName={name} />
    </div>
  );
}
