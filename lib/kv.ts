import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// File-based fallback for local dev — shared across all Next.js workers
const LOCAL_FILE = join(process.cwd(), ".next", "local-picks.json");

function isKvConfigured() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function readLocal(): Record<string, Record<string, string>> {
  try {
    if (existsSync(LOCAL_FILE)) {
      return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
    }
  } catch {
    // ignore parse errors
  }
  return {};
}

function writeLocal(data: Record<string, Record<string, string>>) {
  try {
    writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore write errors (e.g. .next dir not created yet)
  }
}

export async function hset(
  key: string,
  field: string,
  value: string
): Promise<void> {
  if (!isKvConfigured()) {
    const all = readLocal();
    all[key] = all[key] ?? {};
    all[key][field] = value;
    writeLocal(all);
    return;
  }
  const { kv } = await import("@vercel/kv");
  await kv.hset(key, { [field]: value });
}

export async function hget(
  key: string,
  field: string
): Promise<string | null> {
  if (!isKvConfigured()) {
    return readLocal()[key]?.[field] ?? null;
  }
  const { kv } = await import("@vercel/kv");
  return kv.hget<string>(key, field);
}

export async function hgetall(
  key: string
): Promise<Record<string, string> | null> {
  if (!isKvConfigured()) {
    return readLocal()[key] ?? null;
  }
  const { kv } = await import("@vercel/kv");
  return kv.hgetall<Record<string, string>>(key);
}
