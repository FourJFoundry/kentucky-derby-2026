type Props = {
  coatColor: string;
  coatType: string;
};

export function CoatSwatch({ coatColor, coatType }: Props) {
  return (
    <div className="flex items-center gap-1.5" title={`Coat: ${coatType}`}>
      <div
        className="w-5 h-5 flex-shrink-0 border-2 border-black"
        style={{
          backgroundColor: coatColor,
          boxShadow: "2px 2px 0 #000",
        }}
      />
      <span className="font-arcade text-base text-gray-500 leading-none">
        {coatType}
      </span>
    </div>
  );
}
