"use client";
import { useState } from "react";
import { TIP_CATEGORIES } from "@/lib/tips";

export function InsiderTips() {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 mb-4 max-w-5xl mx-auto">
      <button
        onClick={() => setOpen(!open)}
        className="w-full border-4 border-derby-tan bg-[#1a0f00] text-derby-tan font-pixel text-[10px] py-3 pixel-shadow pixel-btn flex items-center justify-center gap-3"
      >
        <span>🎯 INSIDER TIPS</span>
        <span>{open ? "▲ HIDE" : "▼ SHOW"}</span>
      </button>

      {open && (
        <div className="border-4 border-t-0 border-derby-tan bg-[#0d0d2a] p-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TIP_CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <h3 className="font-pixel text-derby-yellow text-[9px] leading-6 mb-2">
                {cat.icon} {cat.title}
              </h3>
              <ul className="space-y-2">
                {cat.content.map((line, i) => (
                  <li
                    key={i}
                    className="font-arcade text-gray-300 text-lg leading-5"
                  >
                    · {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
