import { Horse } from "@/lib/horses";

type Props = {
  horse: Horse;
  size?: "sm" | "md";
};

export function PostBadge({ horse, size = "sm" }: Props) {
  const textClass = size === "md" ? "text-sm px-3 py-1.5" : "text-xs px-2 py-1";
  const baseStyle: React.CSSProperties = {
    color: horse.postTextDark ? "#000" : "#fff",
    textShadow: horse.postColorPattern ? "0 0 4px rgba(0,0,0,0.8)" : undefined,
    fontFamily: "inherit",
    border: "2px solid #000",
    display: "inline-block",
    fontWeight: "bold",
  };

  if (horse.postColorPattern === "diagonal") {
    baseStyle.background = `linear-gradient(135deg, ${horse.postColor} 50%, ${horse.postColorSecondary} 50%)`;
  } else if (horse.postColorPattern === "halves") {
    baseStyle.background = `linear-gradient(to right, ${horse.postColor} 50%, ${horse.postColorSecondary} 50%)`;
  } else {
    baseStyle.backgroundColor = horse.postColor;
  }

  return (
    <span className={`font-pixel ${textClass}`} style={baseStyle}>
      #{horse.post}
    </span>
  );
}
