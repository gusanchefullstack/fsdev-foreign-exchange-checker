import { useRef, type KeyboardEvent } from 'react'
import type { HistoryRange } from '../../types'
import { RANGES, rangeName } from '../../utils/ranges'
import styles from './RangeSelector.module.css'

/** Radio group with roving tabindex; arrow keys move and select (FR-020). */
export function RangeSelector({ value, onChange }: { value: HistoryRange; onChange: (r: HistoryRange) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: KeyboardEvent, index: number) {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + RANGES.length) % RANGES.length
    onChange(RANGES[next]!)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Chart range" className={styles.group}>
      {RANGES.map((r, i) => (
        <button
          key={r}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={r === value}
          title={rangeName(r)}
          tabIndex={r === value ? 0 : -1}
          className={styles.option}
          onClick={() => onChange(r)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
