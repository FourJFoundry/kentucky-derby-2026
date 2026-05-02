import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { renamePicker } from "@/app/actions";

export default async function RenamePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const cookieStore = await cookies();
  const { name: nameToRename } = await searchParams;

  let session: string[] = [];
  try {
    session = JSON.parse(cookieStore.get("derby_session")?.value ?? "[]");
  } catch {}

  // Only allow renaming names that were entered on this device
  if (!nameToRename || !session.includes(nameToRename)) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm border-4 border-derby-yellow bg-[#0f0f3a] pixel-shadow-yellow p-8 text-center">
        <div className="text-4xl mb-4">✏️</div>
        <h1 className="font-pixel text-derby-yellow text-xs leading-8 mb-2">
          FIX A NAME
        </h1>
        <p className="font-arcade text-derby-tan text-xl mb-6">
          Rename &ldquo;{nameToRename}&rdquo;
        </p>

        <form action={renamePicker} className="flex flex-col gap-4">
          <input type="hidden" name="oldName" value={nameToRename} />
          <input
            name="newName"
            type="text"
            defaultValue={nameToRename}
            required
            minLength={2}
            maxLength={30}
            autoFocus
            className="border-4 border-white bg-derby-navy text-white font-arcade text-2xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-derby-yellow pixel-shadow w-full text-center"
          />
          <button
            type="submit"
            className="border-4 border-derby-yellow bg-derby-red text-white font-pixel text-xs py-4 pixel-shadow-yellow pixel-btn w-full"
          >
            SAVE NAME →
          </button>
        </form>

        <a
          href="/"
          className="block mt-4 font-pixel text-[9px] text-gray-500 hover:text-white"
        >
          ← CANCEL
        </a>
      </div>
    </div>
  );
}
