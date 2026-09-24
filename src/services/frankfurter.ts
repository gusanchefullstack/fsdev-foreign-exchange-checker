// The only module that talks to the network (contracts/frankfurter-api.md).
import { CATALOG_CODES, CURRENCY_CATALOG, POPULAR_CODES, flagSrc } from '../data/currencyCatalog'
import type {
  Currency,
  CurrencyCode,
  CurrencyPair,
  HistoryPoint,
  HistoryRange,
  RatesErrorCode,
  RatesSnapshot,
} from '../types'

export const API_BASE = 'https://api.frankfurter.dev'
const TIMEOUT_MS = 8000

/** Typed failure; UI maps `code` to friendly copy and never shows raw messages. */
export class RatesError extends Error {
  constructor(public code: RatesErrorCode) {
    super(code)
    this.name = 'RatesError'
  }
}

async function getJson<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { signal: controller.signal })
  } catch {
    throw new RatesError('network')
  } finally {
    clearTimeout(timer)
  }
  if (res.status === 404) throw new RatesError('not-found')
  if (res.status === 422) throw new RatesError('invalid')
  if (!res.ok) throw new RatesError('unknown')
  try {
    return (await res.json()) as T
  } catch {
    throw new RatesError('unknown')
  }
}

/** ISO date (YYYY-MM-DD) `days` before `from`, in UTC. */
export function isoDaysAgo(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function isoMonthsAgo(months: number, from = new Date()): string {
  const d = new Date(from)
  d.setUTCMonth(d.getUTCMonth() - months)
  return d.toISOString().slice(0, 10)
}

interface ApiCurrency {
  iso_code: string
  name: string
}

interface ApiRate {
  date: string
  base: string
  quote: string
  rate: number
}

/** Currencies = API list ∩ bundled flag catalog; Popular first, then by code. */
export async function fetchCurrencies(): Promise<Currency[]> {
  const list = await getJson<ApiCurrency[]>('/v2/currencies')
  if (!Array.isArray(list)) throw new RatesError('unknown')
  const currencies = list
    .filter((c) => c.iso_code in CURRENCY_CATALOG)
    .map<Currency>((c) => ({
      code: c.iso_code,
      name: CURRENCY_CATALOG[c.iso_code]?.name ?? c.name,
      flagSrc: flagSrc(c.iso_code),
      popular: POPULAR_CODES.includes(c.iso_code),
    }))
  return sortCurrencies(currencies)
}

export function sortCurrencies(list: Currency[]): Currency[] {
  return [...list].sort((a, b) => {
    const pa = POPULAR_CODES.indexOf(a.code)
    const pb = POPULAR_CODES.indexOf(b.code)
    if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb)
    return a.code.localeCompare(b.code)
  })
}

/**
 * One request for everything "live": USD-based rates for the last 10 days.
 * Per quote, the last two dates become `latest` and `previous` (research R4).
 */
export async function fetchLatestSnapshot(codes: CurrencyCode[] = CATALOG_CODES): Promise<RatesSnapshot> {
  const quotes = codes.filter((c) => c !== 'USD').join(',')
  const rows = await getJson<ApiRate[]>(`/v2/rates?base=USD&quotes=${quotes}&from=${isoDaysAgo(10)}`)
  if (!Array.isArray(rows) || rows.length === 0) throw new RatesError('unknown')

  const byQuote = new Map<string, ApiRate[]>()
  for (const row of rows) {
    const list = byQuote.get(row.quote) ?? []
    list.push(row)
    byQuote.set(row.quote, list)
  }

  const latest: Record<string, number> = { USD: 1 }
  const previous: Record<string, number> = { USD: 1 }
  let date = ''
  for (const [quote, list] of byQuote) {
    list.sort((a, b) => a.date.localeCompare(b.date))
    const last = list[list.length - 1]!
    latest[quote] = last.rate
    previous[quote] = (list[list.length - 2] ?? last).rate
    if (last.date > date) date = last.date
  }
  return { date, latest, previous, fetchedAt: Date.now(), stale: false }
}

/** Query window and grouping per range (research R5). */
export function historyQuery(range: HistoryRange, now = new Date()): { from: string; group?: 'week' | 'month' } {
  switch (range) {
    case '1D':
      return { from: isoDaysAgo(10, now) }
    case '1W':
      return { from: isoDaysAgo(7, now) }
    case '1M':
      return { from: isoMonthsAgo(1, now) }
    case '3M':
      return { from: isoMonthsAgo(3, now) }
    case '1Y':
      return { from: isoMonthsAgo(12, now), group: 'week' }
    case '5Y':
      return { from: isoMonthsAgo(60, now), group: 'month' }
  }
}

/** Direct (not cross) history for the pair, ascending by date. */
export async function fetchHistory(pair: CurrencyPair, range: HistoryRange): Promise<HistoryPoint[]> {
  const { from, group } = historyQuery(range)
  const rows = await getJson<ApiRate[]>(
    `/v2/rates?base=${pair.from}&quotes=${pair.to}&from=${from}${group ? `&group=${group}` : ''}`,
  )
  if (!Array.isArray(rows)) throw new RatesError('unknown')
  return rows
    .filter((r) => r.quote === pair.to && Number.isFinite(r.rate))
    .map((r) => ({ date: r.date, rate: r.rate }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
