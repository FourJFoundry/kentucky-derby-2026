import { Horse, getOddsTier } from "@/lib/horses";
import { PostBadge } from "./PostBadge";
import { CoatSwatch } from "./CoatSwatch";
import { HOT_TIP_HORSES } from "@/lib/tips";

type Props = {
  horse: Horse;
  odds?: string;
  selected: boolean;
  onSelect: (name: string) => void;
};

const tierBorder: Record<string, string> = {
  gold: "border-derby-gold",
  silver: "border-gray-400",
  bronze: "border-gray-600",
};

export function HorseCard({ horse, odds, selected, onSelect }: Props) {
  const tier = getOddsTier(horse.oddsNum);
  const displayOdds = odds ?? horse.odds;
  const hotTip = HOT_TIP_HORSES[horse.name];

  if (horse.scratched) {
    return (
      <div className="w-full text-left bg-gray-200 text-gray-500 border-4 border-gray-400 opacity-60 relative">
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <PostBadge horse={horse} />
        </div>
        <div className="px-3 pt-1 pb-1">
          <p className="font-pixel text-[11px] leading-5 uppercase tracking-tight line-through">
            {horse.name}
          </p>
        </div>
        <div className="bg-derby-red text-white text-center py-2 font-pixel text-xs">
          SCRATCHED
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(horse.name)}
      className={[
        "w-full text-left bg-white text-black border-4 cursor-pointer transition-transform",
        "hover:scale-[1.03] hover:border-derby-yellow",
        selected
          ? "selected-card border-derby-green pixel-shadow-green"
          : `${tierBorder[tier]} pixel-shadow`,
      ].join(" ")}
    >
      {/* Post badge + odds */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <PostBadge horse={horse} />
        <span
          className={[
            "font-arcade text-xl px-2 py-0.5 border-2 border-black font-bold",
            tier === "gold"
              ? "bg-derby-gold text-black"
              : tier === "silver"
                ? "bg-gray-300 text-black"
                : "bg-gray-700 text-white",
          ].join(" ")}
        >
          {displayOdds}
        </span>
      </div>

      {/* Hot tip badge */}
      {hotTip && (
        <div className="px-3 pb-1">
          <span className="inline-block bg-derby-red text-white font-pixel text-[8px] px-1.5 py-0.5 border-2 border-derby-yellow">
            🔥 {hotTip}
          </span>
        </div>
      )}

      {/* Horse name */}
      <div className="px-3 pt-1 pb-0.5">
        <p className="font-pixel text-[11px] leading-5 uppercase tracking-tight">
          {horse.name}
        </p>
      </div>

      {/* Jockey + Trainer + Coat */}
      <div className="px-3 pb-2 text-gray-700">
        <p className="font-arcade text-lg leading-5">🧑‍✈️ {horse.jockey}</p>
        <p className="font-arcade text-lg leading-5">🎩 {horse.trainer}</p>
        <div className="mt-1">
          <CoatSwatch coatColor={horse.coatColor} coatType={horse.coatType} />
        </div>
      </div>

      {/* Fact strip */}
      <div className="bg-derby-navy px-3 py-2 mt-1">
        <p className="font-arcade text-base text-derby-yellow italic leading-5">
          {horse.fact}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="bg-derby-green text-white text-center py-1 font-pixel text-xs">
          ✓ YOUR PICK
        </div>
      )}
    </button>
  );
}
