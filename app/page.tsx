import { setName } from "./actions";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Main card */}
      <div className="w-full max-w-md border-4 border-derby-yellow bg-[#0f0f3a] pixel-shadow-yellow p-8 text-center">
        {/* Horse emoji big */}
        <div className="text-6xl mb-4">🏇</div>

        <h1 className="font-pixel text-derby-yellow text-sm sm:text-base leading-8 mb-2">
          KENTUCKY DERBY
        </h1>
        <p className="font-pixel text-white text-xs leading-8 mb-6">
          2026 · PICK YOUR WINNER
        </p>

        <p className="font-arcade text-derby-tan text-2xl mb-8 leading-7">
          20 horses · 1 race · 1 pick
          <br />
          Who do YOU think wins?
        </p>

        <form action={setName} className="flex flex-col gap-4">
          <label className="font-arcade text-white text-xl text-left">
            Enter your name to start:
          </label>
          <input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={30}
            placeholder="Your name..."
            autoFocus
            className="border-4 border-white bg-derby-navy text-white font-arcade text-2xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-derby-yellow pixel-shadow w-full"
          />
          <button
            type="submit"
            className="border-4 border-derby-yellow bg-derby-red text-white font-pixel text-xs py-4 pixel-shadow-yellow pixel-btn mt-2 w-full"
          >
            LET&apos;S RACE →
          </button>
        </form>
      </div>

      {/* Galloping horses strip */}
      <div className="fixed bottom-0 left-0 right-0 overflow-hidden h-16 pointer-events-none">
        <div className="absolute bottom-2 left-0 right-0 flex gap-0">
          {[3, 6, 10, 14, 18].map((delay, i) => (
            <span
              key={i}
              className="horse-gallop text-4xl absolute"
              style={{
                animationDuration: `${8 + i * 2}s`,
                animationDelay: `${delay}s`,
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
