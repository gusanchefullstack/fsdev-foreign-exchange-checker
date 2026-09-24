// Domain types (see specs/001-fx-checker-app/data-model.md).

export type CurrencyCode = string

export interface Currency {
  code: CurrencyCode
  name: string
  flagSrc: string
  popular: boolean
}

export interface CurrencyPair {
  from: CurrencyCode
  to: CurrencyCode
}

export interface RatesSnapshot {
  /** Date of the most recent publication (ISO date). */
  date: string
  /** USD → code rate for the latest publication; USD = 1. */
  latest: Record<CurrencyCode, number>
  /** USD → code rate for the publication before `latest`. */
  previous: Record<CurrencyCode, number>
  fetchedAt: number
  /** True when served from the cache after a failed fetch (FR-051). */
  stale: boolean
}

export type HistoryRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

export interface HistoryPoint {
  date: string
  rate: number
}

export interface HistoryStats {
  open: number
  last: number
  change: number
  changePct: number
  high: number
  low: number
  mid: number
}

export interface HistorySeries extends HistoryStats {
  pair: CurrencyPair
  range: HistoryRange
  points: HistoryPoint[]
}

export interface Favorite {
  from: CurrencyCode
  to: CurrencyCode
  pinnedAt: number
}

export interface ConversionLogEntry {
  id: string
  timestamp: number
  from: CurrencyCode
  to: CurrencyCode
  sendAmount: number
  receivedAmount: number
  rate: number
}

export type TabId = 'history' | 'compare' | 'favorites' | 'log'

export type Theme = 'dark' | 'light'

export type RatesErrorCode = 'network' | 'not-found' | 'invalid' | 'unknown'
