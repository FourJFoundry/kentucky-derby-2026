"use client";

import { useState, useTransition } from "react";
import { Horse } from "@/lib/horses";
import { HorseCard } from "./HorseCard";
import { submitPick } from "@/app/actions";

type Props = {
  horses: Horse[];
  oddsMap: Record<string, string>;
  pickerName: string;
};

export function PickGrid({ horses, oddsMap, pickerName }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!selected) return;
    startTransition(() => {
      submitPick(selected);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center py-6 px-4">
        <h1 className="font-pixel text-derby-yellow text-sm sm:text-base leading-8">
          HEY {pickerName.toUpperCase()}!
        </h1>
        <p className="font-arcade text-white text-2xl mt-2">
          Choose your horse to win the 2026 Kentucky Derby
        </p>
        <p className="font-arcade text-derby-tan text-xl mt-1">
          Tap a card to select · Then hit CONFIRM
        </p>
      </div>

      {/* Horse grid */}
      <div className="px-4 pb-36 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {horses.map((horse) => (
          <HorseCard
            key={horse.post}
            horse={horse}
            odds={oddsMap[horse.name]}
            selected={selected === horse.name}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* Sticky confirm bar */}
      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300",
          selected ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        <div className="bg-derby-navy border-t-4 border-derby-yellow">
          <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="font-arcade text-derby-tan text-xl">You picked: </span>
              <span className="font-pixel text-derby-yellow text-sm">
                {selected ?? ""}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="border-4 border-gray-500 bg-gray-700 text-white font-pixel text-xs px-5 py-4 pixel-shadow pixel-btn"
              >
                CHANGE
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="border-4 border-derby-yellow bg-derby-red text-white font-pixel text-xs px-8 py-4 pixel-shadow-yellow pixel-btn disabled:opacity-50"
              >
                {isPending ? "RACING..." : "✓ CONFIRM MY PICK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
