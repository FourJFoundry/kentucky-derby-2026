import { cookies } from "next/headers";
import { setName } from "./actions";

export default async function Home() {
  const cookieStore = await cookies();
  const existingName = cookieStore.get("derby_name")?.value?.trim() ?? null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md border-4 border-derby-yellow bg-[#0f0f3a] pixel-shadow-yellow p-8 text-center">
        <div className="text-6xl mb-4">🏇</div>

        <h1 className="font-pixel text-derby-yellow text-sm sm:text-base leading-8 mb-2">
          KENTUCKY DERBY
        </h1>
        <p className="font-pixel text-white text-xs leading-8 mb-6">
          2026 · PICK YOUR WINNER
        </p>

        {/* Welcome back section */}
        {existingName && (
          <div className="mb-6 border-2 border-derby-green bg-[#0a1a0a] p-4 text-left">
            <p className="font-arcade text-derby-green text-xl mb-3">
              Welcome back, {existingName}!
            </p>
            <div className="flex gap-2 flex-wrap">
              <a
                href="/results"
                className="border-2 border-derby-yellow bg-derby-navy text-derby-yellow font-pixel text-[9px] px-3 py-2 pixel-shadow inline-block"
              >
                SEE PICKS →
              </a>
              <a
                href="/pick"
                className="border-2 border-derby-yellow bg-derby-red text-white font-pixel text-[9px] px-3 py-2 pixel-shadow-yellow inline-block"
              >
                CHANGE MY PICK →
              </a>
              <a
                href="/race"
                className="border-2 border-derby-green bg-[#0a1a0a] text-derby-green font-pixel text-[9px] px-3 py-2 pixel-shadow inline-block"
              >
                🏁 RACE GAME →
              </a>
            </div>
          </div>
        )}

        {/* Name entry form */}
        <form action={setName} className="flex flex-col gap-4">
          <label className="font-arcade text-white text-xl text-left">
            {existingName ? "Change your name or pick for someone else:" : "Enter your name to start:"}
          </label>
          <input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={30}
            placeholder="Your name..."
            defaultValue={existingName ?? ""}
            autoFocus={!existingName}
            className="border-4 border-white bg-derby-navy text-white font-arcade text-2xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-derby-yellow pixel-shadow w-full"
          />
          <button
            type="submit"
            className="border-4 border-derby-yellow bg-derby-red text-white font-pixel text-xs py-4 pixel-shadow-yellow pixel-btn mt-2 w-full"
          >
            {existingName ? "GO →" : "LET'S RACE →"}
          </button>
        </form>
      </div>

      {/* Galloping horses strip */}
      <div className="fixed bottom-0 left-0 right-0 overflow-hidden h-16 pointer-events-none">
        <div className="absolute bottom-2 left-0 right-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`horse-gallop-${i} text-4xl absolute`}
              style={{
                animationDuration: "10s",
                animationDelay: "0s",
                bottom: `${4 + (i % 3) * 8}px`,
              }}
            >
              🏇
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
