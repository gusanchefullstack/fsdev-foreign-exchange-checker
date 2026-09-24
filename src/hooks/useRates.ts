import { useCallback, useEffect, useMemo, useState } from 'react'
import { RatesError, fetchCurrencies, fetchLatestSnapshot, sortCurrencies } from '../services/frankfurter'
import { CATALOG_CODES, CURRENCY_CATALOG, POPULAR_CODES, flagSrc } from '../data/currencyCatalog'
import type { Currency, CurrencyCode, RatesErrorCode, RatesSnapshot } from '../types'
import { changePct, crossRate } from '../utils/rates'
import { isNonNegative, readStored, writeStored } from './usePersistentState'

export type RatesStatus = 'loading' | 'ready' | 'error'

export interface RatesState {
  status: RatesStatus
  currencies: Currency[]
  snapshot: RatesSnapshot | null
  errorCode: RatesErrorCode | null
  /** A → B rate from the snapshot, or null if unknown. */
  rate: (from: CurrencyCode, to: CurrencyCode) => number | null
  /** % change of A → B since the previous publication. */
  change: (from: CurrencyCode, to: CurrencyCode) => number | null
}

const CACHE_KEY = 'rates'

const isRateMap = (v: unknown): v is Record<string, number> =>
  typeof v === 'object' && v !== null && Object.values(v).every(isNonNegative)

/** Validates the cached snapshot (contracts/storage.md). */
export function validateCachedSnapshot(raw: unknown): Omit<RatesSnapshot, 'stale'> | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.date !== 'string' || !isRateMap(r.latest) || !isRateMap(r.previous)) return null
  if (typeof r.fetchedAt !== 'number') return null
  return { date: r.date, latest: r.latest, previous: r.previous, fetchedAt: r.fetchedAt }
}

/** Currency list rebuilt from a cached snapshot when the live list can't load. */
function currenciesFromSnapshot(snapshot: Pick<RatesSnapshot, 'latest'>): Currency[] {
  return sortCurrencies(
    Object.keys(snapshot.latest)
      .filter((code) => code in CURRENCY_CATALOG)
      .map((code) => ({
        code,
        name: CURRENCY_CATALOG[code]?.name ?? code,
        flagSrc: flagSrc(code),
        popular: POPULAR_CODES.includes(code),
      })),
  )
}

/** Loads the currency list and the latest rates once, with a cached fallback (FR-051). */
export function useRates(): RatesState {
  const [state, setState] = useState<Pick<RatesState, 'status' | 'currencies' | 'snapshot' | 'errorCode'>>({
    status: 'loading',
    currencies: [],
    snapshot: null,
    errorCode: null,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchCurrencies(), fetchLatestSnapshot(CATALOG_CODES)])
      .then(([currencies, snapshot]) => {
        if (cancelled) return
        writeStored(CACHE_KEY, {
          date: snapshot.date,
          latest: snapshot.latest,
          previous: snapshot.previous,
          fetchedAt: snapshot.fetchedAt,
        })
        // Only offer currencies we actually have a rate for.
        const withRates = currencies.filter((c) => c.code in snapshot.latest)
        setState({ status: 'ready', currencies: withRates, snapshot, errorCode: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const errorCode = err instanceof RatesError ? err.code : 'unknown'
        // Fall back to the last successful rates, flagged as stale.
        const cached = readStored(CACHE_KEY, validateCachedSnapshot)
        if (cached) {
          setState({
            status: 'ready',
            currencies: currenciesFromSnapshot(cached),
            snapshot: { ...cached, stale: true },
            errorCode,
          })
        } else {
          setState({ status: 'error', currencies: [], snapshot: null, errorCode })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { snapshot } = state
  const rate = useCallback(
    (from: CurrencyCode, to: CurrencyCode) => (snapshot ? crossRate(snapshot.latest, from, to) : null),
    [snapshot],
  )
  const change = useCallback(
    (from: CurrencyCode, to: CurrencyCode) => {
      if (!snapshot) return null
      const now = crossRate(snapshot.latest, from, to)
      const prev = crossRate(snapshot.previous, from, to)
      return now === null || prev === null ? null : changePct(now, prev)
    },
    [snapshot],
  )

  return useMemo(() => ({ ...state, rate, change }), [state, rate, change])
}
