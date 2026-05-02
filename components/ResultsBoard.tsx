"use client";

import { useEffect, useState, useTransition } from "react";
import { HORSES } from "@/lib/horses";

type PickEntry = {
  voter: string;
  horse: string;
};

type Props = {
  initialPicks: PickEntry[];
  myName: string;
  myHorse: string;
};

export function ResultsBoard({ initialPicks, myName, myHorse }: Props) {
  const [picks, setPicks] = useState<PickEntry[]>(initialPicks);
  const [, startTransition] = useTransition();

  // Poll for new picks every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        try {
          const res = await fetch("/api/picks", { cache: "no-store" });
          if (res.ok) {
            const data: Record<string, string> = await res.json();
            const entries = Object.entries(data).map(([voter, horse]) => ({
              voter,
              horse,
            }));
            setPicks(entries);
          }
        } catch {
          // silent — stale data is fine
        }
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Sort: my pick first, then alphabetical
  const sorted = [...picks].sort((a, b) => {
    if (a.voter === myName) return -1;
    if (b.voter === myName) return 1;
    return a.voter.localeCompare(b.voter);
  });

  const horseInfo = Object.fromEntries(HORSES.map((h) => [h.name, h]));
  const waiting = picks.length;

  return (
    <div>
      {/* Header */}
      <div className="text-center py-8 px-4">
        <h1 className="font-pixel text-derby-yellow text-base sm:text-xl leading-10">
          🏆 THE PICKS ARE IN
        </h1>
        <p className="font-arcade text-white text-2xl mt-2">
          {waiting} {waiting === 1 ? "person has" : "people have"} picked —
          more may still be voting!
        </p>
        <p className="font-arcade text-derby-tan text-xl">
          Updates every 30 seconds ⏳
        </p>
      </div>

      {/* Picks grid (race lanes) */}
      <div className="px-4 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {sorted.map((entry) => {
          const isMe = entry.voter === myName;
          const horse = horseInfo[entry.horse];
          return (
            <div
              key={entry.voter}
              className={[
                "border-4 pixel-shadow p-4",
                isMe
                  ? "border-derby-gold bg-[#1a1a00]"
                  : "border-derby-red bg-[#1a0a0a]",
              ].join(" ")}
            >
              {/* Voter name */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-pixel text-xs text-white leading-5">
                  {entry.voter}
                </span>
                {isMe && (
                  <span className="bg-derby-gold text-black font-pixel text-[9px] px-2 py-0.5 border-2 border-black">
                    YOU
                  </span>
                )}
              </div>

              {/* Horse info */}
              {horse ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="font-pixel text-xs px-2 py-1 border-2 border-black"
                      style={{
                        backgroundColor: horse.postColor,
                        color: horse.postTextDark ? "#000" : "#fff",
                      }}
                    >
                      #{horse.post}
                    </span>
                    <p className="font-pixel text-derby-yellow text-[10px] leading-5">
                      {horse.name}
                    </p>
                  </div>
                  <p className="font-arcade text-gray-300 text-lg">
                    🧑‍✈️ {horse.jockey}
                  </p>
                  <p className="font-arcade text-gray-400 text-lg">
                    Odds: {horse.odds}
                  </p>
                </>
              ) : (
                <p className="font-arcade text-derby-yellow text-xl">
                  {entry.horse}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* My pick summary at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-derby-navy border-t-4 border-derby-gold px-4 py-3">
        <div className="text-center">
          <span className="font-arcade text-derby-tan text-xl">Your pick: </span>
          <span className="font-pixel text-derby-yellow text-xs">{myHorse}</span>
          <span className="font-arcade text-gray-400 text-xl ml-3">
            · Post time ~6:57 PM ET · Good luck! 🤞
          </span>
        </div>
      </div>
    </div>
  );
}
