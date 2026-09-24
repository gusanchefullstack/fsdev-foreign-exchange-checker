import { useEffect, useRef } from 'react'
import { SHORTCUTS } from '../../hooks/useShortcuts'
import styles from './ShortcutsHelp.module.css'

/**
 * Non-modal list of keyboard shortcuts (FR-048). Escape closes it and focus returns to
 * whatever opened it. Built per spec Assumption "UI not in the design".
 */
export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    opener.current = document.activeElement
    ref.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (opener.current instanceof HTMLElement) opener.current.focus()
    }
  }, [onClose])

  return (
    <div ref={ref} className={styles.panel} role="dialog" aria-modal="false" aria-labelledby="shortcuts-title" tabIndex={-1}>
      <div className={styles.header}>
        <h2 id="shortcuts-title" className={styles.title}>
          Keyboard shortcuts
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close keyboard shortcuts">
          ×
        </button>
      </div>
      <dl className={styles.list}>
        {SHORTCUTS.map((s) => (
          <div key={s.keys} className={styles.row}>
            <dt>
              <kbd className={styles.kbd}>{s.keys}</kbd>
            </dt>
            <dd>{s.action}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
