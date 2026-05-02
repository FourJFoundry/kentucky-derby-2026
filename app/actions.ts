"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget, hset, hdel } from "@/lib/kv";
import { isPicksLocked } from "@/lib/lockTime";

// Read session list from cookie (names entered on this device)
async function readSession(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<string[]> {
  try {
    return JSON.parse(cookieStore.get("derby_session")?.value ?? "[]");
  } catch {
    return [];
  }
}

async function writeSession(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  session: string[]
) {
  cookieStore.set("derby_session", JSON.stringify(session), {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });
}

export async function setName(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name || name.length < 2) return;

  const cookieStore = await cookies();

  // Track this name in the session list
  const session = await readSession(cookieStore);
  if (!session.includes(name)) {
    await writeSession(cookieStore, [...session, name]);
  }

  cookieStore.set("derby_name", name, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  redirect("/pick");
}

export async function switchPicker(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;

  const cookieStore = await cookies();
  const session = await readSession(cookieStore);
  if (!session.includes(name)) return; // only allow session names

  cookieStore.set("derby_name", name, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  // If they've already picked go to results, else go to pick
  const existing = await hget("picks", name);
  redirect(existing ? "/results" : "/pick");
}

export async function renamePicker(formData: FormData) {
  const oldName = formData.get("oldName")?.toString().trim();
  const newName = formData.get("newName")?.toString().trim();
  if (!oldName || !newName || newName.length < 2) redirect("/");

  const cookieStore = await cookies();
  const session = await readSession(cookieStore);
  if (!session.includes(oldName!)) redirect("/"); // safety: only own session names

  // Move pick in KV
  const oldPick = await hget("picks", oldName!);
  if (oldPick) {
    await hset("picks", newName!, oldPick);
    await hdel("picks", oldName!);
  }

  // Update session list
  await writeSession(
    cookieStore,
    session.map((n) => (n === oldName ? newName! : n))
  );

  // Update active cookie if this was the active user
  const activeName = cookieStore.get("derby_name")?.value;
  if (activeName === oldName) {
    cookieStore.set("derby_name", newName!, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }

  redirect("/");
}

export async function submitPick(horseName: string) {
  if (isPicksLocked()) redirect("/results");
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;
  if (!name) redirect("/");
  await hset("picks", name, horseName);
  redirect("/results");
}

export async function changePick(horseName: string) {
  if (isPicksLocked()) redirect("/results");
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;
  if (!name) redirect("/");
  await hset("picks", name, horseName);
  redirect("/results");
}
