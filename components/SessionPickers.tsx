"use client";

import { useState } from "react";
import { switchPicker, renamePicker } from "@/app/actions";

type Picker = { name: string; pick: string | null };

export function SessionPickers({ pickers }: { pickers: Picker[] }) {
  const [renaming, setRenaming] = useState<string | null>(null);

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
            {renaming === p.name ? (
              /* Rename form */
              <form action={renamePicker} className="flex gap-2 items-center flex-wrap">
                <input type="hidden" name="oldName" value={p.name} />
                <input
                  name="newName"
                  type="text"
                  defaultValue={p.name}
                  required
                  minLength={2}
                  maxLength={30}
                  autoFocus
                  className="border-2 border-derby-yellow bg-derby-navy text-white font-arcade text-xl px-3 py-1 focus:outline-none flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="border-2 border-derby-green text-derby-green font-pixel text-[8px] px-3 py-1 pixel-btn"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setRenaming(null)}
                  className="border-2 border-gray-500 text-gray-400 font-pixel text-[8px] px-3 py-1 pixel-btn"
                >
                  CANCEL
                </button>
              </form>
            ) : (
              /* Normal row */
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
                  <button
                    type="button"
                    onClick={() => setRenaming(p.name)}
                    className="border-2 border-gray-500 text-gray-400 font-pixel text-[8px] px-2 py-1 pixel-btn"
                  >
                    RENAME
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
