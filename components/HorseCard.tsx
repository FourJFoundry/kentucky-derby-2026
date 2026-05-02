import { Horse, getOddsTier } from "@/lib/horses";

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
      {/* Post number badge */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span
          className="font-pixel text-xs px-2 py-1 border-2 border-black"
          style={{
            backgroundColor: horse.postColor,
            color: horse.postTextDark ? "#000" : "#fff",
          }}
        >
          #{horse.post}
        </span>
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

      {/* Horse name */}
      <div className="px-3 pt-1 pb-0.5">
        <p className="font-pixel text-[11px] leading-5 uppercase tracking-tight">
          {horse.name}
        </p>
      </div>

      {/* Jockey + Trainer */}
      <div className="px-3 pb-1 text-gray-700">
        <p className="font-arcade text-lg leading-5">🧑‍✈️ {horse.jockey}</p>
        <p className="font-arcade text-lg leading-5">🎩 {horse.trainer}</p>
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
