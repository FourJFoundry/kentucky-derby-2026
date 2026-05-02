import { HORSES } from "@/lib/horses";
import { hgetall } from "@/lib/kv";
import { setScratch } from "./actions";
import { PostBadge } from "@/components/PostBadge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const scratchData = await hgetall("scratches");
  const scratchedSet = new Set(
    Object.entries(scratchData ?? {})
      .filter(([, v]) => v === "1")
      .map(([k]) => k)
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <h1 className="font-pixel text-derby-yellow text-sm leading-8 mb-2 text-center">
        🔧 ADMIN · SCRATCH MANAGER
      </h1>
      <p className="font-arcade text-derby-tan text-xl text-center mb-8">
        Toggle scratched horses — changes appear immediately for all users.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HORSES.map((horse) => {
          const isScratched = scratchedSet.has(horse.name);
          return (
            <form
              key={horse.post}
              action={async () => {
                "use server";
                await setScratch(horse.name, !isScratched);
              }}
              className={[
                "flex items-center justify-between border-4 px-4 py-3 gap-3",
                isScratched
                  ? "border-derby-red bg-[#1a0505] opacity-70"
                  : "border-gray-600 bg-[#0f0f2a]",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <PostBadge horse={horse} />
                <div>
                  <p className={`font-pixel text-[10px] leading-5 ${isScratched ? "text-gray-500 line-through" : "text-white"}`}>
                    {horse.name}
                  </p>
                  <p className="font-arcade text-gray-500 text-lg leading-4">
                    {horse.trainer}
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className={[
                  "font-pixel text-[9px] px-3 py-2 border-2 pixel-btn flex-shrink-0",
                  isScratched
                    ? "border-derby-green text-derby-green bg-[#0a1a0a]"
                    : "border-derby-red text-derby-red bg-[#1a0505]",
                ].join(" ")}
              >
                {isScratched ? "REINSTATE" : "SCRATCH"}
              </button>
            </form>
          );
        })}
      </div>

      <p className="font-arcade text-gray-500 text-lg text-center mt-8">
        /admin — honor system, no password. Don&apos;t share this URL publicly.
      </p>
    </div>
  );
}
