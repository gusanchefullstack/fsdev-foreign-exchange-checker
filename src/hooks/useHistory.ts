import { useEffect, useState } from 'react'
import { fetchHistory } from '../services/frankfurter'
import type { CurrencyPair, HistoryRange, HistorySeries } from '../types'
import { historyStats } from '../utils/rates'

type HistoryState = { status: 'loading' | 'error'; series: null } | { status: 'ready'; series: HistorySeries }

// Session cache: history for past dates doesn't change while the app is open.
const cache = new Map<string, HistorySeries | 'error'>()
const keyOf = (pair: CurrencyPair, range: HistoryRange) => `${pair.from}-${pair.to}-${range}`

export const clearHistoryCache = () => cache.clear()

function fromCache(key: string): HistoryState | null {
  const hit = cache.get(key)
  if (!hit || hit === 'error') return null
  return { status: 'ready', series: hit }
}

/** Rate history for the active pair and range (FR-019–FR-023). */
export function useHistory(pair: CurrencyPair, range: HistoryRange): HistoryState {
  const key = keyOf(pair, range)
  const [state, setState] = useState<{ key: string; value: HistoryState }>(() => ({
    key,
    value: fromCache(key) ?? { status: 'loading', series: null },
  }))

  useEffect(() => {
    if (fromCache(key)) return
    let cancelled = false
    fetchHistory(pair, range)
      .then((points) => {
        const result = historyStats(points, range)
        if (!result) throw new Error('not enough points')
        const series: HistorySeries = { pair, range, points: result.points, ...result.stats }
        cache.set(key, series)
        if (!cancelled) setState({ key, value: { status: 'ready', series } })
      })
      .catch(() => {
        // Errors are not cached, so the next visit retries.
        if (!cancelled) setState({ key, value: { status: 'error', series: null } })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // A cached key renders straight away; a new key shows "loading" until its fetch resolves,
  // never the previous pair's data.
  const cached = fromCache(key)
  if (cached) return cached
  if (state.key !== key) return { status: 'loading', series: null }
  return state.value
}
