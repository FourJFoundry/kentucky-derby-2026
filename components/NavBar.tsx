"use client";

import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ADD PICKER", icon: "🏠" },
  { href: "/results", label: "STARTING GATE", icon: "🏟" },
  { href: "/race", label: "RACE GAME", icon: "🏁" },
];

export function NavBar() {
  const path = usePathname();
  return (
    <div className="bg-derby-navy border-b-4 border-derby-gold flex">
      {NAV_ITEMS.map((item) => {
        const active = path === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className={[
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 border-r-2 border-gray-700 last:border-0",
              active
                ? "bg-[#0a0a2a] text-derby-yellow"
                : "text-gray-400",
            ].join(" ")}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="font-pixel text-[7px] leading-none">{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
