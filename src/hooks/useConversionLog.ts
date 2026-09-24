import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConversionLogEntry, CurrencyCode } from '../types'
import { round2 } from '../utils/rates'
import { isCode, isNonNegative, usePersistentState, validList } from './usePersistentState'

export const LOG_LIMIT = 100
export const UNDO_MS = 5000

const isEntry = (v: unknown): v is ConversionLogEntry => {
  if (typeof v !== 'object' || v === null) return false
  const e = v as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    isNonNegative(e.timestamp) &&
    isCode(e.from) &&
    isCode(e.to) &&
    isNonNegative(e.sendAmount) &&
    isNonNegative(e.receivedAmount) &&
    isNonNegative(e.rate)
  )
}

/**
 * Conversion log (FR-033–FR-036): newest first, capped at 100, saved in the browser.
 * "Clear all" empties it right away and keeps the old entries in memory for a 5 s Undo;
 * the countdown pauses while the Undo control is hovered/focused. Logging or deleting
 * during that window makes the clear final.
 */
export function useConversionLog() {
  const [entries, setEntries] = usePersistentState<ConversionLogEntry[]>('log', [], (raw) =>
    validList(raw, isEntry),
  )
  const [undoBuffer, setUndoBuffer] = useState<ConversionLogEntry[] | null>(null)
  const [paused, setPaused] = useState(false)
  const remaining = useRef(UNDO_MS)
  const startedAt = useRef(0)

  const endUndo = useCallback(() => {
    setUndoBuffer(null)
    setPaused(false)
  }, [])

  // Undo countdown; pausing keeps the time that was left.
  useEffect(() => {
    if (!undoBuffer || paused) return
    startedAt.current = Date.now()
    const t = setTimeout(endUndo, remaining.current)
    return () => {
      clearTimeout(t)
      remaining.current -= Date.now() - startedAt.current
    }
  }, [undoBuffer, paused, endUndo])

  const add = useCallback(
    (e: { from: CurrencyCode; to: CurrencyCode; sendAmount: number; rate: number }) => {
      endUndo()
      const entry: ConversionLogEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        from: e.from,
        to: e.to,
        sendAmount: e.sendAmount,
        receivedAmount: round2(e.sendAmount * e.rate),
        rate: e.rate,
      }
      setEntries((list) => [entry, ...list].slice(0, LOG_LIMIT))
      return entry
    },
    [endUndo, setEntries],
  )

  const remove = useCallback(
    (id: string) => {
      endUndo()
      setEntries((list) => list.filter((e) => e.id !== id))
    },
    [endUndo, setEntries],
  )

  const clearAll = useCallback(() => {
    remaining.current = UNDO_MS
    setPaused(false)
    setUndoBuffer(entries)
    setEntries([])
  }, [entries, setEntries])

  const undo = useCallback(() => {
    if (!undoBuffer) return
    setEntries(undoBuffer)
    endUndo()
  }, [undoBuffer, setEntries, endUndo])

  return {
    entries,
    add,
    remove,
    clearAll,
    undo,
    pauseUndo: setPaused,
    canUndo: undoBuffer !== null,
  }
}
