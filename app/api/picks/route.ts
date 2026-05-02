import { NextResponse } from "next/server";
import { hgetall } from "@/lib/kv";

export async function GET() {
  const picks = await hgetall("picks");
  return NextResponse.json(picks ?? {});
}
