"use client";

import { useEffect, useRef, useState } from "react";
import { Horse } from "@/lib/horses";
import { PostBadge } from "./PostBadge";

type Mode = "menu" | "passive" | "kids" | "adult";
type GameState = "idle" | "countdown" | "racing" | "finished";

type HorseState = {
  horse: Horse;
  position: number; // 0–100
  isMyHorse: boolean;
};

type Props = { horses: Horse[]; myPick: string; myName: string };

const FINISH = 92;
const LANE_H = 30;

// Kids: 6 buttons (2×3), Adult: 12 buttons (3×4)
const KIDS_BUTTONS = 6;
const ADULT_BUTTONS = 12;

// How long a lit button stays visible (ms)
const KIDS_WINDOW = 1100;
const ADULT_WINDOW = 702;

// How often a new button lights up (ms)
const KIDS_SPAWN = 750;
const ADULT_SPAWN = 290;

// How many buttons can be lit simultaneously
const KIDS_MAX_LIT = 1;
const ADULT_MAX_LIT = 3;

// How much the player's horse advances per button tap
const KIDS_ADVANCE = 2.1;
const ADULT_ADVANCE = 1.6;

function cpuAdvance(oddsNum: number, mode: Mode): number {
  // Compressed base speed: favorites still faster but race stays close.
  // Range: 4-1 horse → ~0.068, 50-1 horse → ~0.056 (only ~20% spread before variance)
  const base = 0.050 + 0.030 / Math.sqrt(oddsNum);
  // Big random bursts make any horse capable of surging
  const burst = Math.random() < 0.28 ? Math.random() * 1.1 : 0;
  // Occasional stumble keeps favorites honest
  const stumble = Math.random() < 0.10 ? -0.12 : 0;
  const speed = mode === "kids" ? 0.22 : mode === "adult" ? 0.72 : 1.0;
  return Math.max(0, (base + burst + stumble) * speed);
}

export function RaceGame({ horses, myPick, myName }: Props) {
  const [mode, setMode] = useState<Mode>("menu");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [horseStates, setHorseStates] = useState<HorseState[]>([]);
  const [winner, setWinner] = useState<HorseState | null>(null);
  const [litButtons, setLitButtons] = useState<Set<number>>(new Set());
  const [hits, setHits] = useState(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const buttonCount = mode === "adult" ? ADULT_BUTTONS : KIDS_BUTTONS;

  function clearAll() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }

  function startGame(m: Mode) {
    clearAll();
    setMode(m);
    setHorseStates(horses.map((h) => ({ horse: h, position: 0, isMyHorse: h.name === myPick })));
    setWinner(null);
    setHits(0);
    setLitButtons(new Set());
    setGameState("countdown");
    setCountdown(3);
  }

  function resetGame() {
    clearAll();
    setGameState("idle");
    setMode("menu");
    setHorseStates([]);
    setWinner(null);
    setLitButtons(new Set());
    setHits(0);
  }

  // Countdown
  useEffect(() => {
    if (gameState !== "countdown") return;
    if (countdown <= 0) { setGameState("racing"); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, countdown]);

  // Race tick — CPU horses
  useEffect(() => {
    if (gameState !== "racing") return;
    tickRef.current = setInterval(() => {
      setHorseStates((prev) => {
        const next = prev.map((hs) => ({
          ...hs,
          position: Math.min(
            FINISH + 2,
            hs.position + (hs.isMyHorse && mode !== "passive" ? 0 : cpuAdvance(hs.horse.oddsNum, mode))
          ),
        }));
        const fin = next.find((hs) => hs.position >= FINISH);
        if (fin) {
          clearAll();
          setWinner(fin);
          setGameState("finished");
          setLitButtons(new Set());
        }
        return next;
      });
    }, 80);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [gameState, mode]);

  // Auto-scroll track to keep player's horse visible
  useEffect(() => {
    if (gameState !== "racing" || mode === "passive") return;
    const myIdx = horseStates.findIndex((hs) => hs.isMyHorse);
    if (myIdx >= 0 && trackRef.current) {
      const targetScroll = myIdx * LANE_H - 80;
      trackRef.current.scrollTop = Math.max(0, targetScroll);
    }
  }, [horseStates, gameState, mode]);

  // Spawn lit buttons for interactive modes
  useEffect(() => {
    if (gameState !== "racing" || mode === "passive") return;
    const maxLit = mode === "kids" ? KIDS_MAX_LIT : ADULT_MAX_LIT;
    const window_ms = mode === "kids" ? KIDS_WINDOW : ADULT_WINDOW;
    const count = mode === "kids" ? KIDS_BUTTONS : ADULT_BUTTONS;

    spawnRef.current = setInterval(() => {
      setLitButtons((prev) => {
        if (prev.size >= maxLit) return prev;
        // pick a random unlit button
        const unlit = Array.from({ length: count }, (_, i) => i).filter((i) => !prev.has(i));
        if (unlit.length === 0) return prev;
        const pick = unlit[Math.floor(Math.random() * unlit.length)];
        const next = new Set(prev);
        next.add(pick);
        // auto-extinguish after window
        const t = setTimeout(() => {
          setLitButtons((s) => { const n = new Set(s); n.delete(pick); return n; });
        }, window_ms);
        timeoutRefs.current.push(t);
        return next;
      });
    }, mode === "kids" ? KIDS_SPAWN : ADULT_SPAWN);

    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [gameState, mode]);

  function handleButtonTap(idx: number) {
    if (gameState !== "racing" || mode === "passive") return;
    if (!litButtons.has(idx)) return;
    setLitButtons((prev) => { const n = new Set(prev); n.delete(idx); return n; });
    setHits((h) => h + 1);
    const advance = mode === "kids" ? KIDS_ADVANCE : ADULT_ADVANCE;
    setHorseStates((prev) =>
      prev.map((hs) =>
        hs.isMyHorse
          ? { ...hs, position: Math.min(FINISH + 2, hs.position + advance + Math.random() * 0.5) }
          : hs
      )
    );
  }

  const myHorseState = horseStates.find((hs) => hs.isMyHorse);
  const cols = mode === "adult" ? 4 : 3;
  const rows = mode === "adult" ? 3 : 2;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center py-3 px-4 flex-shrink-0">
        <h1 className="font-pixel text-derby-yellow text-sm leading-8">🏁 DERBY RACE GAME</h1>
        <p className="font-arcade text-derby-tan text-xl">
          Your horse: <span className="text-derby-yellow">{myPick}</span> · {myName}
        </p>
      </div>

      {/* MODE MENU */}
      {mode === "menu" && (
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4 w-full">
          <div className="border-4 border-derby-yellow bg-[#0f0f3a] p-6 pixel-shadow-yellow">
            <p className="font-arcade text-white text-2xl mb-5 text-center">Choose your race:</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => startGame("passive")}
                className="border-4 border-gray-500 bg-[#1a1a1a] text-white font-pixel text-[10px] py-4 px-5 pixel-shadow pixel-btn text-left"
              >
                <div className="text-derby-yellow mb-1">📺 WATCH THE RACE</div>
                <div className="font-arcade text-gray-300 text-lg font-normal">
                  Sit back and watch. Odds determine who wins — anything can happen!
                </div>
              </button>
              <button
                onClick={() => startGame("kids")}
                className="border-4 border-derby-green bg-[#0a1a0a] text-white font-pixel text-[10px] py-4 px-5 pixel-shadow-green pixel-btn text-left"
              >
                <div className="text-derby-green mb-1">⭐ KIDS RACE · EASY</div>
                <div className="font-arcade text-gray-300 text-lg font-normal">
                  Tap the glowing buttons to charge your horse! Buttons stay lit longer — nice and easy.
                </div>
              </button>
              <button
                onClick={() => startGame("adult")}
                className="border-4 border-derby-red bg-[#1a0505] text-white font-pixel text-[10px] py-4 px-5 pixel-shadow pixel-btn text-left"
              >
                <div className="text-derby-red mb-1">🔥 CHAMPS RACE · HARD</div>
                <div className="font-arcade text-gray-300 text-lg font-normal">
                  More buttons, faster flashes. CPU horses don't hold back. You'll need quick reflexes!
                </div>
              </button>
            </div>
          </div>
          <a href="/results" className="font-pixel text-[9px] text-gray-500 text-center">
            ← Back to Starting Gate
          </a>
        </div>
      )}

      {/* COUNTDOWN overlay */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center">
            <p className="font-pixel text-derby-yellow text-xs mb-4">GET READY...</p>
            <p className="font-pixel text-white text-6xl">{countdown === 0 ? "GO!" : countdown}</p>
          </div>
        </div>
      )}

      {/* RACE VIEW */}
      {(gameState === "racing" || gameState === "finished") && mode !== "menu" && (
        <div className="flex flex-col flex-1">
          {/* Track — scrollable, fixed height */}
          <div
            ref={trackRef}
            className="mx-2 border-4 border-yellow-800 overflow-y-auto flex-shrink-0 relative"
            style={{ height: `min(${horses.length * LANE_H}px, 52vh)` }}
          >
            {/* Finish line */}
            <div
              className="absolute top-0 z-20 pointer-events-none"
              style={{
                left: `${FINISH}%`,
                width: "4px",
                height: `${horses.length * LANE_H}px`,
                background: "repeating-linear-gradient(to bottom,#fff 0,#fff 6px,#000 6px,#000 12px)",
              }}
            />

            {horseStates.map((hs, i) => (
              <div
                key={hs.horse.post}
                className="absolute left-0 right-0 flex items-center"
                style={{
                  top: i * LANE_H,
                  height: LANE_H,
                  background:
                    i % 2 === 0
                      ? "linear-gradient(to bottom,#1a4a1a,#2d6e2d 50%,#1a4a1a)"
                      : "linear-gradient(to bottom,#154015,#267326 50%,#154015)",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="w-1 h-full flex-shrink-0" style={{ backgroundColor: hs.horse.postColor }} />
                {/* Horse name label — left-aligned background text */}
                <span
                  className="absolute font-arcade text-white pointer-events-none select-none"
                  style={{
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "clamp(9px, 1.8vw, 14px)",
                    opacity: hs.isMyHorse ? 0.7 : 0.28,
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hs.horse.name.toUpperCase()}
                </span>
                {/* Moving horse */}
                <div
                  className="absolute"
                  style={{ left: `calc(${hs.position}% - 14px)`, top: "50%", transform: "translateY(-50%) scaleX(-1)" }}
                >
                  <span
                    className="text-xl leading-none"
                    style={hs.isMyHorse ? { filter: "drop-shadow(0 0 5px gold) drop-shadow(0 0 10px gold)" } : {}}
                  >
                    🏇
                  </span>
                </div>
                {/* Right label */}
                <div className="absolute right-1 flex items-center gap-1">
                  <PostBadge horse={hs.horse} size="sm" />
                  {hs.isMyHorse && (
                    <span className="font-pixel text-[6px] text-derby-yellow leading-none">YOU</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar for player's horse */}
          {mode !== "passive" && myHorseState && gameState === "racing" && (
            <div className="mx-2 mt-1 flex-shrink-0">
              <div className="h-3 bg-gray-800 border-2 border-gray-600 relative">
                <div
                  className="h-full bg-derby-yellow transition-all duration-100"
                  style={{ width: `${Math.min(100, (myHorseState.position / FINISH) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between px-1">
                <span className="font-pixel text-[7px] text-derby-tan">YOUR HORSE</span>
                <span className="font-pixel text-[7px] text-derby-yellow">
                  {Math.round((myHorseState.position / FINISH) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* BUTTON PANEL — below track for interactive modes */}
          {(mode === "kids" || mode === "adult") && gameState === "racing" && (
            <div className="flex-1 bg-[#08081a] border-t-4 border-derby-navy flex flex-col items-center justify-center px-4 py-3 gap-2 flex-shrink-0">
              <p className="font-pixel text-[8px] text-gray-500 mb-1">
                {mode === "kids" ? "TAP THE LIGHT · MOVE YOUR HORSE" : `TAP FAST! · ${hits} HITS`}
              </p>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
              >
                {Array.from({ length: buttonCount }, (_, idx) => {
                  const isLit = litButtons.has(idx);
                  return (
                    <button
                      key={idx}
                      onPointerDown={() => handleButtonTap(idx)}
                      className="rounded-full border-4 flex items-center justify-center pixel-btn select-none"
                      style={{
                        width: mode === "adult" ? "clamp(44px,10vw,64px)" : "clamp(52px,13vw,80px)",
                        height: mode === "adult" ? "clamp(44px,10vw,64px)" : "clamp(52px,13vw,80px)",
                        backgroundColor: isLit ? "#f4d03f" : "#1a1a2e",
                        borderColor: isLit ? "#ffffff" : "#444",
                        boxShadow: isLit
                          ? "0 0 12px #f4d03f, 0 0 24px #f4d03f, 4px 4px 0 #000"
                          : "2px 2px 0 #000",
                        transition: "background-color 0.05s, box-shadow 0.05s",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Passive mode bottom bar */}
          {mode === "passive" && gameState === "racing" && myHorseState && (
            <div className="flex-shrink-0 bg-derby-navy border-t-4 border-derby-gold px-4 py-2 text-center">
              <span className="font-arcade text-derby-tan text-xl">
                {myPick} — {Math.round((myHorseState.position / FINISH) * 100)}% of the way there
              </span>
            </div>
          )}
        </div>
      )}

      {/* WINNER SCREEN */}
      {gameState === "finished" && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="border-4 border-derby-yellow bg-[#0f0f3a] pixel-shadow-yellow p-8 text-center max-w-sm w-full">
            {winner.isMyHorse ? (
              <>
                <p className="font-pixel text-derby-yellow text-xs leading-8 mb-2">🏆 YOU WIN!</p>
                <p className="font-arcade text-white text-2xl mb-1">{winner.horse.name} crosses first!</p>
                <p className="font-arcade text-derby-green text-xl mb-4">{myName}, your pick is a WINNER!</p>
              </>
            ) : (
              <>
                <p className="font-pixel text-white text-xs leading-8 mb-2">🏁 RACE OVER</p>
                <p className="font-arcade text-derby-yellow text-2xl mb-1">{winner.horse.name} wins!</p>
                <p className="font-arcade text-gray-400 text-xl mb-4">
                  Your horse {myPick} didn&apos;t make it this time...
                </p>
              </>
            )}
            <PostBadge horse={winner.horse} size="md" />
            {mode !== "passive" && (
              <p className="font-arcade text-derby-tan text-xl mt-3">You hit {hits} buttons!</p>
            )}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => startGame(mode)}
                className="border-4 border-derby-yellow bg-derby-red text-white font-pixel text-[9px] py-3 pixel-shadow-yellow pixel-btn"
              >
                RACE AGAIN
              </button>
              <button
                onClick={resetGame}
                className="border-4 border-gray-500 bg-gray-800 text-white font-pixel text-[9px] py-3 pixel-shadow pixel-btn"
              >
                CHANGE MODE
              </button>
              <a
                href="/results"
                className="border-4 border-derby-tan bg-derby-navy text-derby-tan font-pixel text-[9px] py-3 pixel-shadow pixel-btn inline-block text-center"
              >
                ← SEE EVERYONE&apos;S PICKS
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
