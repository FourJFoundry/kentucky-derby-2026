"use client";

import { switchPicker } from "@/app/actions";

type Picker = { name: string; pick: string | null };

export function SessionPickers({ pickers }: { pickers: Picker[] }) {
  if (pickers.length === 0) return null;

  return (
    <div className="mb-6 border-4 border-derby-yellow bg-[#0a0a1e] pixel-shadow-yellow">
      <div className="border-b-4 border-derby-yellow px-4 py-2">
        <p className="font-pixel text-derby-yellow text-[9px] leading-6">
          🏠 PICKS FROM THIS DEVICE
        </p>
      </div>
      <div className="divide-y divide-gray-800">
        {pickers.map((p) => (
          <div key={p.name} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-pixel text-white text-[10px] leading-5 truncate">{p.name}</span>
                {p.pick ? (
                  <span className="font-arcade text-derby-yellow text-lg leading-none shrink-0">
                    → {p.pick}
                  </span>
                ) : (
                  <span className="font-arcade text-gray-500 text-lg leading-none shrink-0">
                    no pick yet
                  </span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <form action={switchPicker}>
                  <input type="hidden" name="name" value={p.name} />
                  <button
                    type="submit"
                    className="border-2 border-derby-yellow bg-derby-red text-white font-pixel text-[8px] px-2 py-1 pixel-btn"
                  >
                    {p.pick ? "CHANGE PICK" : "PICK NOW"}
                  </button>
                </form>
                <a
                  href={`/rename?name=${encodeURIComponent(p.name)}`}
                  className="border-2 border-gray-500 text-gray-400 font-pixel text-[8px] px-2 py-1 pixel-btn inline-block"
                >
                  RENAME
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
