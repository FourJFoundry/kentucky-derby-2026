"use client";

import { useEffect, useState, useTransition } from "react";
import { switchPicker } from "@/app/actions";
import { Horse } from "@/lib/horses";
import { PostBadge } from "./PostBadge";
import { useCountdown } from "@/lib/useCountdown";

type PickEntry = { voter: string; horse: string };

type Props = {
  horses: Horse[];
  initialPicks: PickEntry[];
  myName: string;
  myHorse: string;
  isLocked: boolean;
  lockDisplay: string;
  sessionNames: string[];
};

export function ResultsBoard({ horses, initialPicks, myName, myHorse, isLocked, lockDisplay, sessionNames }: Props) {
  const [picks, setPicks] = useState<PickEntry[]>(initialPicks);
  const [, startTransition] = useTransition();
  const [activeVoter, setActiveVoter] = useState<string | null>(null);
  const { text: countdownText, locked: nowLocked } = useCountdown();
  const locked = isLocked || nowLocked;

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        try {
          const res = await fetch("/api/picks", { cache: "no-store" });
          if (res.ok) {
            const data: Record<string, string> = await res.json();
            setPicks(Object.entries(data).map(([voter, horse]) => ({ voter, horse })));
          }
        } catch {
          // silent
        }
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Build a map: horseName → list of voters
  const horseInfo = Object.fromEntries(horses.map((h) => [h.name, h]));
  const byHorse: Record<string, string[]> = {};
  for (const { voter, horse } of picks) {
    if (!byHorse[horse]) byHorse[horse] = [];
    byHorse[horse].push(voter);
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center py-6 px-4">
        <h1 className="font-pixel text-derby-yellow text-base sm:text-xl leading-10">
          🏟 THE STARTING GATE
        </h1>
        <p className="font-arcade text-white text-2xl mt-1">
          {picks.length} {picks.length === 1 ? "person has" : "people have"} placed their bet
        </p>
        <p className="font-arcade text-derby-tan text-xl">
          {locked ? "🔒 PICKS LOCKED" : `🔒 Lock: ${lockDisplay} · ${countdownText}`}
        </p>
      </div>

      {/* Starting gate grid — responsive */}
      <div className="px-4 pb-36">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {horses.map((horse) => {
            const voters = byHorse[horse.name] ?? [];
            const iMyPick = horse.name === myHorse;
            const hasVoters = voters.length > 0;

            return (
              <div
                key={horse.post}
                className={[
                  "flex flex-col items-center w-full",
                  horse.scratched ? "opacity-40" : "",
                ].join(" ")}
              >
                {/* Gate structure */}
                <div
                  className={[
                    "w-full border-4 relative",
                    iMyPick
                      ? "border-derby-gold pixel-shadow-yellow"
                      : hasVoters
                        ? "border-derby-red"
                        : "border-gray-700",
                  ].join(" ")}
                >
                  {/* Post color header */}
                  <div
                    className="h-6 flex items-center justify-center"
                    style={{ backgroundColor: horse.postColor }}
                  >
                    <PostBadge horse={horse} />
                  </div>

                  {/* Gate door — wavy green track background */}
                  <div
                    className="h-24 flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                      background: hasVoters
                        ? "linear-gradient(to bottom, #1a4a1a 0%, #2d6e2d 25%, #1a4a1a 50%, #2d6e2d 75%, #1a4a1a 100%)"
                        : "linear-gradient(to bottom, #111 0%, #1a1a1a 50%, #111 100%)",
                    }}
                  >
                    {/* Gate bars */}
                    <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-30">
                      {[0, 1, 2].map((b) => (
                        <div key={b} className="h-px bg-yellow-600" />
                      ))}
                    </div>

                    {horse.scratched ? (
                      <div className="text-center z-10">
                        <span className="font-pixel text-[9px] text-derby-red leading-4">
                          SCRATCHED
                        </span>
                      </div>
                    ) : hasVoters ? (
                      <div className="text-4xl z-10">🏇</div>
                    ) : (
                      <div className="text-3xl z-10 opacity-30">🏇</div>
                    )}
                  </div>

                  {/* Horse name */}
                  <div className="bg-[#0a0a1a] px-1 py-2 text-center min-h-[3rem] flex items-center justify-center">
                    <p
                      className={[
                        "font-pixel leading-4",
                        iMyPick ? "text-derby-yellow text-[8px]" : "text-gray-300 text-[7px]",
                      ].join(" ")}
                    >
                      {horse.name}
                    </p>
                  </div>
                </div>

                {/* Voters list below gate */}
                <div className="w-full mt-2 flex flex-col gap-1 items-center min-h-[2rem]">
                  {voters.map((voter) => {
                    const isSession = sessionNames.includes(voter);
                    return (
                      <div
                        key={voter}
                        onClick={isSession ? () => setActiveVoter(voter) : undefined}
                        className={[
                          "w-full text-center px-1 py-0.5 border-2",
                          voter === myName
                            ? "border-derby-gold bg-[#1a1a00] text-derby-yellow"
                            : "border-derby-red bg-[#1a0a0a] text-white",
                          isSession ? "cursor-pointer active:opacity-60" : "",
                        ].join(" ")}
                      >
                        <span className="font-pixel text-[8px] leading-4">{voter}</span>
                        {voter === myName && (
                          <span className="ml-1 bg-derby-gold text-black font-pixel text-[7px] px-1">
                            YOU
                          </span>
                        )}
                        {isSession && (
                          <span className="ml-1 font-pixel text-[6px] text-gray-400">✏</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom bar — current user's pick info */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-derby-navy border-t-4 border-derby-gold">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-arcade text-derby-tan text-xl">Your pick: </span>
            <span className="font-pixel text-derby-yellow text-xs">{myHorse}</span>
            <span className="font-arcade text-gray-400 text-xl ml-3">
              · Post time 4:57 PM MDT · Good luck! 🤞
            </span>
          </div>
          {!locked && (
            <a
              href="/pick"
              className="border-4 border-derby-yellow bg-derby-red text-white font-pixel text-[9px] px-4 py-2 pixel-shadow-yellow pixel-btn inline-block"
            >
              CHANGE MY PICK
            </a>
          )}
        </div>
      </div>

      {/* Bottom sheet — session voter actions */}
      {activeVoter && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setActiveVoter(null)}
        >
          <div
            className="w-full max-w-md bg-derby-navy border-t-4 border-derby-gold p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-pixel text-derby-yellow text-[9px] leading-6 mb-4">
              {activeVoter}
            </p>
            <div className="flex flex-col gap-3">
              <form action={switchPicker}>
                <input type="hidden" name="name" value={activeVoter} />
                <button
                  type="submit"
                  className="w-full border-4 border-derby-yellow bg-derby-red text-white font-pixel text-[9px] py-3 pixel-shadow-yellow pixel-btn"
                >
                  CHANGE PICK →
                </button>
              </form>
              <a
                href={`/rename?name=${encodeURIComponent(activeVoter)}`}
                className="block w-full border-4 border-gray-500 bg-[#1a1a1a] text-gray-300 font-pixel text-[9px] py-3 pixel-shadow pixel-btn text-center"
              >
                RENAME ✏
              </a>
              <button
                onClick={() => setActiveVoter(null)}
                className="w-full border-4 border-gray-700 bg-transparent text-gray-500 font-pixel text-[9px] py-3 pixel-btn"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
