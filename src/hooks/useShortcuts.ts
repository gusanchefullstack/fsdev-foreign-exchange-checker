import { useEffect, useRef } from 'react'
import type { HistoryRange } from '../types'
import { RANGES } from '../utils/ranges'

export interface ShortcutHandlers {
  openSearch: () => void
  swap: () => void
  setRange: (range: HistoryRange) => void
  toggleHelp: () => void
}

/** The documented shortcuts (contracts/ui-contract.md). */
export const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: '/', action: 'Search currencies (Send)' },
  { keys: 's', action: 'Swap currencies' },
  { keys: '1 – 6', action: 'Chart range: 1D, 1W, 1M, 3M, 1Y, 5Y' },
  { keys: '?', action: 'Show or hide this list' },
]

/** True when the user is typing, so single-key shortcuts must not fire. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Global single-key shortcuts (FR-048). Ignored while typing or with Ctrl/Meta/Alt held. */
export function useShortcuts(handlers: ShortcutHandlers) {
  // Keep the latest handlers without re-binding the listener every render.
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented || isTyping(e.target)) return
      const h = ref.current
      if (e.key === '/') {
        e.preventDefault()
        h.openSearch()
      } else if (e.key === 's' || e.key === 'S') {
        h.swap()
      } else if (e.key === '?') {
        h.toggleHelp()
      } else if (/^[1-6]$/.test(e.key)) {
        h.setRange(RANGES[Number(e.key) - 1]!)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
