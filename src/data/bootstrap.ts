// Build-time rate bundle (spec FR-054): written by scripts/fetch-rates.mjs during `prebuild`
// so the first paint shows real rates instead of a loading state.
import { currenciesFromApi, snapshotFromRows } from '../services/frankfurter'
import type { Currency, HistoryPoint, RatesSnapshot } from '../types'
import raw from './bootstrap.json'

export interface Bootstrap {
  currencies: Currency[]
  snapshot: RatesSnapshot
  /** USD → EUR, last month (the default pair and range). */
  history: HistoryPoint[]
}

/** Bundled rates more than this many whole days old are shown with the out-of-date banner. */
const STALE_AFTER_DAYS = 4
const DAY_MS = 86_400_000

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

/** Validates the bundle; returns null for anything malformed so the app falls back to loading. */
export function parseBootstrap(data: unknown, now = new Date()): Bootstrap | null {
  if (!isRecord(data) || !Array.isArray(data.currencies) || !Array.isArray(data.rows) || !Array.isArray(data.history)) {
    return null
  }
  const rows = data.rows.filter(
    (r): r is { date: string; quote: string; rate: number } =>
      isRecord(r) && typeof r.date === 'string' && typeof r.quote === 'string' && typeof r.rate === 'number',
  )
  const apiCurrencies = data.currencies.filter(
    (c): c is { iso_code: string; name: string } =>
      isRecord(c) && typeof c.iso_code === 'string' && typeof c.name === 'string',
  )
  const history = data.history.filter(
    (p): p is HistoryPoint => isRecord(p) && typeof p.date === 'string' && typeof p.rate === 'number',
  )
  if (rows.length === 0 || apiCurrencies.length === 0) return null

  const snapshot = snapshotFromRows(rows)
  const ageDays = (now.getTime() - new Date(`${snapshot.date}T00:00:00Z`).getTime()) / DAY_MS
  const currencies = currenciesFromApi(apiCurrencies).filter((c) => c.code in snapshot.latest)
  return {
    currencies,
    snapshot: { ...snapshot, fetchedAt: 0, stale: Math.floor(ageDays) > STALE_AFTER_DAYS },
    history: [...history].sort((a, b) => a.date.localeCompare(b.date)),
  }
}

let cached: Bootstrap | null | undefined

/** The parsed bundle (memoized). Tests replace this via tests/setup.ts. */
export function getBootstrap(): Bootstrap | null {
  if (cached === undefined) cached = parseBootstrap(raw)
  return cached
}
