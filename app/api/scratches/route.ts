import { NextResponse } from "next/server";
import { hgetall } from "@/lib/kv";

export async function GET() {
  const scratches = await hgetall("scratches");
  return NextResponse.json(scratches ?? {});
}
