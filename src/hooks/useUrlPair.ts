import { useEffect } from 'react'
import type { CurrencyCode, CurrencyPair } from '../types'

/** Reads `?from=GBP&to=JPY`; returns null unless both codes are known and different (FR-046). */
export function pairFromUrl(search: string, known: CurrencyCode[]): CurrencyPair | null {
  const params = new URLSearchParams(search)
  const from = params.get('from')?.toUpperCase()
  const to = params.get('to')?.toUpperCase()
  if (!from || !to || from === to || !known.includes(from) || !known.includes(to)) return null
  return { from, to }
}

/** Mirrors the active pair into the URL without adding history entries. */
export function useUrlPairSync(pair: CurrencyPair, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const url = new URL(window.location.href)
    url.searchParams.set('from', pair.from)
    url.searchParams.set('to', pair.to)
    window.history.replaceState(window.history.state, '', url)
  }, [pair.from, pair.to, enabled])
}
