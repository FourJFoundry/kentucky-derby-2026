"use server";

import { hset } from "@/lib/kv";
import { revalidatePath } from "next/cache";

export async function setScratch(horseName: string, scratched: boolean) {
  await hset("scratches", horseName, scratched ? "1" : "0");
  revalidatePath("/admin");
  revalidatePath("/pick");
  revalidatePath("/results");
}
