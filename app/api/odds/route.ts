import { NextResponse } from "next/server";
import { fetchLiveOdds } from "@/lib/odds";

// Cache for 30 minutes — Next.js data cache handles this
export const revalidate = 1800;

export async function GET() {
  const odds = await fetchLiveOdds();
  return NextResponse.json(odds);
}
