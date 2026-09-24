import { useCallback, useMemo } from 'react'
import type { CurrencyPair, Favorite } from '../types'
import { samePair } from '../utils/pair'
import { isCode, isNonNegative, usePersistentState, validList } from './usePersistentState'

const isFavorite = (v: unknown): v is Favorite => {
  if (typeof v !== 'object' || v === null) return false
  const f = v as Record<string, unknown>
  return isCode(f.from) && isCode(f.to) && f.from !== f.to && isNonNegative(f.pinnedAt)
}

/** Pinned pairs, newest first, unique by direction (FR-028, FR-032), saved in the browser. */
export function useFavorites() {
  const [favorites, setFavorites] = usePersistentState<Favorite[]>('favorites', [], (raw) =>
    validList(raw, isFavorite),
  )

  const isPinned = useCallback((pair: CurrencyPair) => favorites.some((f) => samePair(f, pair)), [favorites])

  const pin = useCallback(
    (pair: CurrencyPair) =>
      setFavorites((list) =>
        list.some((f) => samePair(f, pair)) ? list : [{ from: pair.from, to: pair.to, pinnedAt: Date.now() }, ...list],
      ),
    [setFavorites],
  )

  const remove = useCallback(
    (pair: CurrencyPair) => setFavorites((list) => list.filter((f) => !samePair(f, pair))),
    [setFavorites],
  )

  /** Pins or unpins; returns true when the pair is now pinned. */
  const toggle = useCallback(
    (pair: CurrencyPair) => {
      const wasPinned = favorites.some((f) => samePair(f, pair))
      if (wasPinned) remove(pair)
      else pin(pair)
      return !wasPinned
    },
    [favorites, pin, remove],
  )

  const sorted = useMemo(() => [...favorites].sort((a, b) => b.pinnedAt - a.pinnedAt), [favorites])

  return { favorites: sorted, isPinned, pin, remove, toggle }
}
