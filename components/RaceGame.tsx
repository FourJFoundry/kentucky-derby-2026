"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Horse } from "@/lib/horses";
import { PostBadge } from "./PostBadge";

type Mode = "menu" | "passive" | "kids" | "adult";
type GameState = "idle" | "countdown" | "racing" | "finished";

type HorseState = {
  horse: Horse;
  position: number; // 0–100 percent
  isMyHorse: boolean;
};

type Props = {
  horses: Horse[];
  myPick: string;
  myName: string;
};

const FINISH = 92;
const LANE_HEIGHT = 48;

// Odds-weighted random advance per tick for passive/adult CPU horses
function passiveAdvance(oddsNum: number): number {
  const base = 0.18 / Math.sqrt(oddsNum); // favorites advance more per tick
  const burst = Math.random() < 0.25 ? Math.random() * 0.6 : 0;
  const pause = Math.random() < 0.15 ? -0.05 : 0;
  return Math.max(0, base + burst + pause);
}

export function RaceGame({ horses, myPick, myName }: Props) {
  const [mode, setMode] = useState<Mode>("menu");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [horseStates, setHorseStates] = useState<HorseState[]>([]);
  const [winner, setWinner] = useState<HorseState | null>(null);
  const [targets, setTargets] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetIdRef = useRef(0);

  function initHorses() {
    return horses.map((h) => ({
      horse: h,
      position: 0,
      isMyHorse: h.name === myPick,
    }));
  }

  function startGame(selectedMode: Mode) {
    setMode(selectedMode);
    setHorseStates(initHorses());
    setWinner(null);
    setScore(0);
    setTargets([]);
    setGameState("countdown");
    setCountdown(3);
  }

  function resetGame() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (targetRef.current) clearInterval(targetRef.current);
    setGameState("idle");
    setMode("menu");
    setHorseStates([]);
    setWinner(null);
    setTargets([]);
    setScore(0);
  }

  // Countdown effect
  useEffect(() => {
    if (gameState !== "countdown") return;
    if (countdown <= 0) {
      setGameState("racing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, countdown]);

  // Race tick
  useEffect(() => {
    if (gameState !== "racing") return;

    tickRef.current = setInterval(() => {
      setHorseStates((prev) => {
        const next = prev.map((hs) => {
          let advance = 0;
          if (mode === "passive") {
            advance = passiveAdvance(hs.horse.oddsNum);
          } else if (mode === "kids") {
            // CPU horses advance slowly
            if (!hs.isMyHorse) advance = passiveAdvance(hs.horse.oddsNum) * 0.35;
          } else if (mode === "adult") {
            // CPU horses advance at normal speed, player advances via taps
            if (!hs.isMyHorse) advance = passiveAdvance(hs.horse.oddsNum) * 0.9;
          }
          return { ...hs, position: Math.min(FINISH + 2, hs.position + advance) };
        });

        const finished = next.find((hs) => hs.position >= FINISH);
        if (finished) {
          clearInterval(tickRef.current!);
          if (targetRef.current) clearInterval(targetRef.current);
          setWinner(finished);
          setGameState("finished");
          setTargets([]);
        }
        return next;
      });
    }, 80);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [gameState, mode]);

  // Adult mode: spawn tap targets
  useEffect(() => {
    if (gameState !== "racing" || mode !== "adult") return;

    targetRef.current = setInterval(() => {
      const id = targetIdRef.current++;
      setTargets((prev) => [
        ...prev.slice(-6), // max 6 targets on screen
        {
          id,
          x: 5 + Math.random() * 60,
          y: 10 + Math.random() * 75,
        },
      ]);
      // Auto-remove after 900ms
      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== id));
      }, 900);
    }, 400);

    return () => {
      if (targetRef.current) clearInterval(targetRef.current);
    };
  }, [gameState, mode]);

  // Kids mode: advance on big button tap
  function handleKickButton() {
    if (gameState !== "racing" || mode !== "kids") return;
    setHorseStates((prev) =>
      prev.map((hs) =>
        hs.isMyHorse
          ? { ...hs, position: Math.min(FINISH + 2, hs.position + 4 + Math.random() * 2) }
          : hs
      )
    );
  }

  // Adult mode: tap a target
  const handleTargetTap = useCallback(
    (id: number) => {
      if (gameState !== "racing" || mode !== "adult") return;
      setTargets((prev) => prev.filter((t) => t.id !== id));
      setScore((s) => s + 1);
      setHorseStates((prev) =>
        prev.map((hs) =>
          hs.isMyHorse
            ? { ...hs, position: Math.min(FINISH + 2, hs.position + 1.8 + Math.random() * 0.8) }
            : hs
        )
      );
    },
    [gameState, mode]
  );

  const myHorseState = horseStates.find((hs) => hs.isMyHorse);

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="text-center py-4 px-4">
        <h1 className="font-pixel text-derby-yellow text-sm leading-8">
          🏁 DERBY RACE GAME
        </h1>
        <p className="font-arcade text-derby-tan text-xl">
          Your horse: <span className="text-derby-yellow">{myPick}</span> · {myName}
        </p>
      </div>

      {/* MODE MENU */}
      {mode === "menu" && (
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="border-4 border-derby-yellow bg-[#0f0f3a] p-6 text-center pixel-shadow-yellow">
            <p className="font-arcade text-white text-2xl mb-6">
              Choose your race experience:
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => startGame("passive")}
                className="border-4 border-gray-400 bg-[#1a1a1a] text-white font-pixel text-[10px] py-4 px-6 pixel-shadow pixel-btn text-left"
              >
                <div className="font-pixel text-derby-yellow text-[10px] mb-1">📺 WATCH THE RACE</div>
                <div className="font-arcade text-gray-300 text-lg">
                  Sit back and watch all 20 horses race. Odds determine who wins — anything can happen!
                </div>
              </button>
              <button
                onClick={() => startGame("kids")}
                className="border-4 border-derby-green bg-[#0a1a0a] text-white font-pixel text-[10px] py-4 px-6 pixel-shadow-green pixel-btn text-left"
              >
                <div className="font-pixel text-derby-green text-[10px] mb-1">⭐ KIDS RACE · EASY</div>
                <div className="font-arcade text-gray-300 text-lg">
                  Tap the big KICK button to charge your horse forward! The other horses go slow — you've got this!
                </div>
              </button>
              <button
                onClick={() => startGame("adult")}
                className="border-4 border-derby-red bg-[#1a0505] text-white font-pixel text-[10px] py-4 px-6 pixel-shadow pixel-btn text-left"
              >
                <div className="font-pixel text-derby-red text-[10px] mb-1">🔥 CHAMPS RACE · HARD</div>
                <div className="font-arcade text-gray-300 text-lg">
                  Tap the glowing circles as fast as you can to power your horse! CPU horses don't hold back.
                </div>
              </button>
            </div>
          </div>
          <a
            href="/results"
            className="font-pixel text-[9px] text-gray-500 text-center hover:text-white"
          >
            ← Back to Starting Gate
          </a>
        </div>
      )}

      {/* COUNTDOWN */}
      {gameState === "countdown" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center">
            <p className="font-pixel text-derby-yellow text-xs mb-4">GET READY...</p>
            <p className="font-pixel text-white text-6xl">
              {countdown === 0 ? "GO!" : countdown}
            </p>
          </div>
        </div>
      )}

      {/* RACE TRACK */}
      {(gameState === "racing" || gameState === "finished") && mode !== "menu" && (
        <div className="relative">
          {/* Track */}
          <div
            className="relative mx-2 border-4 border-yellow-800 overflow-hidden"
            style={{ height: `${horses.length * LANE_HEIGHT}px` }}
          >
            {/* Finish line */}
            <div
              className="absolute top-0 bottom-0 w-1 z-20"
              style={{
                left: `${FINISH}%`,
                background: "repeating-linear-gradient(to bottom, #fff 0px, #fff 8px, #000 8px, #000 16px)",
              }}
            />

            {/* Horse lanes */}
            {horseStates.map((hs, i) => (
              <div
                key={hs.horse.post}
                className="absolute left-0 right-0 flex items-center"
                style={{
                  top: `${i * LANE_HEIGHT}px`,
                  height: `${LANE_HEIGHT}px`,
                  background:
                    i % 2 === 0
                      ? "linear-gradient(to bottom, #1a4a1a 0%, #2d6e2d 50%, #1a4a1a 100%)"
                      : "linear-gradient(to bottom, #154015 0%, #267326 50%, #154015 100%)",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {/* Post color stripe on left */}
                <div
                  className="w-1.5 h-full flex-shrink-0"
                  style={{ backgroundColor: hs.horse.postColor }}
                />

                {/* Moving horse */}
                <div
                  className="absolute flex items-center gap-1 transition-none"
                  style={{
                    left: `calc(${hs.position}% - 1.5rem)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <span
                    className={[
                      "text-2xl",
                      hs.isMyHorse ? "filter drop-shadow-[0_0_6px_gold]" : "",
                    ].join(" ")}
                  >
                    🏇
                  </span>
                </div>

                {/* Horse label on right edge */}
                <div className="absolute right-2 flex items-center gap-1">
                  <PostBadge horse={hs.horse} size="sm" />
                  {hs.isMyHorse && (
                    <span className="font-pixel text-[7px] text-derby-yellow">YOU</span>
                  )}
                </div>
              </div>
            ))}

            {/* Adult mode tap targets */}
            {mode === "adult" &&
              targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTargetTap(t.id)}
                  className="absolute z-30 w-10 h-10 rounded-full border-4 border-white bg-derby-red animate-ping-slow flex items-center justify-center font-pixel text-white text-[10px]"
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: "translate(-50%, -50%)",
                    animation: "pulse 0.4s ease-in-out infinite",
                  }}
                >
                  ●
                </button>
              ))}
          </div>

          {/* Kids mode kick button */}
          {mode === "kids" && gameState === "racing" && (
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-derby-navy border-t-4 border-derby-green flex justify-center">
              <button
                onPointerDown={handleKickButton}
                className="border-4 border-derby-green bg-derby-green text-black font-pixel text-sm px-16 py-6 pixel-shadow-green pixel-btn active:scale-95"
                style={{ fontSize: "clamp(12px, 4vw, 20px)" }}
              >
                ⚡ KICK! ⚡
              </button>
            </div>
          )}

          {/* Adult mode score */}
          {mode === "adult" && gameState === "racing" && (
            <div className="fixed top-16 right-4 z-40 border-4 border-derby-red bg-[#1a0505] px-4 py-2 text-center">
              <p className="font-pixel text-derby-red text-[9px]">TAPS</p>
              <p className="font-pixel text-white text-base">{score}</p>
            </div>
          )}

          {/* Passive info bar */}
          {mode === "passive" && gameState === "racing" && myHorseState && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-derby-navy border-t-4 border-derby-gold px-4 py-2 text-center">
              <span className="font-arcade text-derby-tan text-xl">
                Your horse {myPick} is at{" "}
              </span>
              <span className="font-pixel text-derby-yellow text-xs">
                {Math.round((myHorseState.position / FINISH) * 100)}%
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
                <p className="font-pixel text-derby-yellow text-xs leading-8 mb-2">
                  🏆 YOU WIN!
                </p>
                <p className="font-arcade text-white text-2xl mb-1">
                  {winner.horse.name} wins the race!
                </p>
                <p className="font-arcade text-derby-green text-xl mb-6">
                  {myName}, your pick is a WINNER!
                </p>
              </>
            ) : (
              <>
                <p className="font-pixel text-white text-xs leading-8 mb-2">
                  🏁 RACE OVER
                </p>
                <p className="font-arcade text-derby-yellow text-2xl mb-1">
                  {winner.horse.name} wins!
                </p>
                <p className="font-arcade text-gray-400 text-xl mb-6">
                  Your horse {myPick} didn&apos;t make it this time...
                </p>
              </>
            )}

            <PostBadge horse={winner.horse} size="md" />

            {mode === "adult" && (
              <p className="font-arcade text-derby-tan text-xl mt-3">
                You hit {score} targets!
              </p>
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
                ← SEE EVERYONE'S PICKS
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
