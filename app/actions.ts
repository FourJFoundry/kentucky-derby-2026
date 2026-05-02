"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hget, hset } from "@/lib/kv";

export async function setName(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name || name.length < 2) return;

  const cookieStore = await cookies();
  cookieStore.set("derby_name", name, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: "lax",
  });

  // If they already picked from a previous session, send them to results
  const existing = await hget("picks", name);
  if (existing) redirect("/results");

  redirect("/pick");
}

export async function submitPick(horseName: string) {
  const cookieStore = await cookies();
  const name = cookieStore.get("derby_name")?.value;
  if (!name) redirect("/");

  await hset("picks", name, horseName);
  redirect("/results");
}
