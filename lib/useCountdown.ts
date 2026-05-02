"use client";
import { useEffect, useState } from "react";

const LOCK_MS = new Date("2026-05-02T22:27:00Z").getTime();

export function useCountdown() {
  const [text, setText] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    function tick() {
      const diff = LOCK_MS - Date.now();
      if (diff <= 0) {
        setText("PICKS LOCKED");
        setLocked(true);
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      const parts = [];
      if (h > 0) parts.push(`${h}h`);
      parts.push(`${m}m`);
      parts.push(`${s}s`);
      setText(`${parts.join(" ")} until lock`);
      setLocked(false);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { text, locked };
}
