import { useEffect, useRef, type RefObject } from 'react'

/**
 * Keeps keyboard focus in place when a row is removed: call `removed(index)` before the
 * removal, and after the list re-renders focus moves to the same position's control
 * (or the last one), or to `fallbackRef` when the list is now empty.
 */
export function useFocusAfterRemoval(
  listRef: RefObject<HTMLElement | null>,
  selector: string,
  fallbackRef: RefObject<HTMLElement | null>,
  length: number,
) {
  const pending = useRef<number | null>(null)

  useEffect(() => {
    if (pending.current === null) return
    const index = pending.current
    pending.current = null
    const controls = listRef.current?.querySelectorAll<HTMLElement>(selector)
    const target = controls && controls.length > 0 ? controls[Math.min(index, controls.length - 1)] : fallbackRef.current
    target?.focus()
  }, [length, listRef, selector, fallbackRef])

  return (index: number) => {
    pending.current = index
  }
}
