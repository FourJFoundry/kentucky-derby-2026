"use client";

import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "MAKE A PICK", icon: "🏠" },
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
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 border-r-4 last:border-0",
              active
                ? "bg-[#0a0a2a] border-r-gray-700 border-b-4 border-b-derby-yellow text-derby-yellow"
                : "border-r-gray-700 text-gray-400",
            ].join(" ")}
          >
            <span className="text-3xl leading-none">{item.icon}</span>
            <span className="font-arcade text-2xl leading-none">{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}
