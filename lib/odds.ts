import { HORSES } from "./horses";

export type OddsMap = Record<string, string>; // horseName → odds string e.g. "4-1"

export async function fetchLiveOdds(): Promise<OddsMap> {
  const key = process.env.ODDS_API_KEY;
  if (!key) return getFallbackOdds();

  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/horse_racing_us/odds/?apiKey=${key}&regions=us&markets=h2h&bookmakers=fanduel`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return getFallbackOdds();

    const data = await res.json();
    // The Odds API returns events; find the KY Derby event
    const derbyEvent = data.find(
      (e: { sport_title: string }) =>
        e.sport_title?.toLowerCase().includes("derby") ||
        e.sport_title?.toLowerCase().includes("kentucky")
    );
    if (!derbyEvent) return getFallbackOdds();

    const odds: OddsMap = {};
    for (const bookmaker of derbyEvent.bookmakers ?? []) {
      for (const market of bookmaker.markets ?? []) {
        for (const outcome of market.outcomes ?? []) {
          const horse = HORSES.find(
            (h) => h.name.toLowerCase() === outcome.name?.toLowerCase()
          );
          if (horse && !odds[horse.name]) {
            odds[horse.name] = decimalToFractional(outcome.price);
          }
        }
      }
    }
    return Object.keys(odds).length > 0
      ? { ...getFallbackOdds(), ...odds }
      : getFallbackOdds();
  } catch {
    return getFallbackOdds();
  }
}

function getFallbackOdds(): OddsMap {
  return Object.fromEntries(HORSES.map((h) => [h.name, h.odds]));
}

function decimalToFractional(decimal: number): string {
  if (!decimal || decimal <= 1) return "---";
  const n = Math.round((decimal - 1) * 10);
  const d = 10;
  const g = gcd(n, d);
  return `${n / g}-${d / g}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
