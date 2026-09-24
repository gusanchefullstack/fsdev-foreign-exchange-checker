import type { CurrencyCode, HistoryPoint, HistoryRange, HistoryStats } from '../types'

/**
 * Cross rate through USD: the snapshot stores USD → X for every currency,
 * so A → B = (USD → B) / (USD → A). Returns null when either side is unknown.
 */
export function crossRate(
  usdRates: Record<CurrencyCode, number>,
  from: CurrencyCode,
  to: CurrencyCode,
): number | null {
  const a = from === 'USD' ? 1 : usdRates[from]
  const b = to === 'USD' ? 1 : usdRates[to]
  if (!a || !b) return null
  return b / a
}

/** Percentage change from `previous` to `latest`. */
export function changePct(latest: number, previous: number): number {
  if (!previous) return 0
  return ((latest - previous) / previous) * 100
}

/** How many points the 1D range charts (spec FR-020). */
export const ONE_DAY_POINTS = 5

/**
 * Picks the points to chart for a range and derives the summary stats.
 * 1D charts the last 5 publications but compares only the last two (FR-020);
 * every other range compares its first and last point.
 */
export function historyStats(
  allPoints: HistoryPoint[],
  range: HistoryRange,
): { points: HistoryPoint[]; stats: HistoryStats } | null {
  const points = range === '1D' ? allPoints.slice(-ONE_DAY_POINTS) : allPoints
  if (points.length < 2) return null

  const last = points[points.length - 1]!.rate
  const open = range === '1D' ? points[points.length - 2]!.rate : points[0]!.rate
  const rates = points.map((p) => p.rate)
  const high = Math.max(...rates)
  const low = Math.min(...rates)
  const change = last - open

  return {
    points,
    stats: { open, last, change, changePct: changePct(last, open), high, low, mid: (high + low) / 2 },
  }
}

/** Rounds to 2 decimals the way amounts are stored in the log. */
export const round2 = (n: number) => Math.round(n * 100) / 100
