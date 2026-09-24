import { useEffect, useState, type ReactNode } from 'react'
import type { ConversionLogEntry } from '../../types'
import { formatAmount } from '../../utils/format'
import { formatAbsolute, formatFull, formatRelativeTime } from '../../utils/relativeTime'
import { EmptyState } from '../EmptyState/EmptyState'
import { Icon } from '../Icon/Icon'
import { Panel } from '../Panel/Panel'
import panelStyles from '../Panel/Panel.module.css'
import styles from './LogPanel.module.css'

interface LogPanelProps {
  entries: ConversionLogEntry[]
  canUndo: boolean
  onDelete: (id: string) => void
  onClearAll: () => void
  onUndo: () => void
  onPauseUndo: (paused: boolean) => void
  /** Extra header controls (CSV export). */
  extraActions?: ReactNode
}

/** Refreshes relative times once a minute. */
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Log tab (FR-033–FR-037), with the post-clear Undo bar (built per spec Assumption "UI not in the design"). */
export function LogPanel({ entries, canUndo, onDelete, onClearAll, onUndo, onPauseUndo, extraActions }: LogPanelProps) {
  const now = useNow()

  const undoBar = canUndo && (
    <div
      className={styles.undo}
      onMouseEnter={() => onPauseUndo(true)}
      onMouseLeave={() => onPauseUndo(false)}
      onFocus={() => onPauseUndo(true)}
      onBlur={() => onPauseUndo(false)}
    >
      <p>Conversion log cleared</p>
      <button type="button" className={styles.button} onClick={onUndo}>
        Undo
      </button>
    </div>
  )

  if (entries.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        {undoBar}
        <EmptyState title="No conversions logged yet">
          Every conversion is recorded here automatically when you tap <span className="label">Log conversion</span>.
          Your log is private to this session and this browser.
        </EmptyState>
      </div>
    )
  }

  return (
    <Panel
      title="Conversion log"
      meta={
        <>
          <span>{entries.length} logged</span>
          {extraActions}
          <button type="button" className={styles.button} onClick={onClearAll}>
            Clear all
          </button>
        </>
      }
    >
      <ol className={panelStyles.list}>
        {entries.map((e) => {
          const relative = formatRelativeTime(e.timestamp, now)
          const isDate = /\d [A-Z]/.test(relative)
          return (
            <li key={e.id} className={`${panelStyles.row} ${styles.row}`}>
              <time
                className={`${styles.time} ${isDate ? '' : styles.upper}`}
                dateTime={formatAbsolute(e.timestamp)}
                title={formatFull(e.timestamp)}
              >
                {relative}
              </time>
              <span className={styles.pair}>
                {e.from}
                <Icon name="arrow-right" size={11} className={styles.arrow} />
                <span className="visually-hidden"> to </span>
                {e.to}
              </span>
              <span className={styles.amounts}>
                <span className={styles.sent}>{formatAmount(e.sendAmount)}</span>
                <span className="visually-hidden"> converts to </span>
                <span className={styles.received}>{formatAmount(e.receivedAmount)}</span>
              </span>
              <button
                type="button"
                className={styles.delete}
                aria-label={`Delete conversion ${e.from} to ${e.to}, ${formatAmount(e.sendAmount)}`}
                onClick={() => onDelete(e.id)}
              >
                <Icon name="delete" size={16} className={styles.deleteIcon} />
                <Icon name="delete-filled" size={16} className={styles.deleteIconHover} />
              </button>
            </li>
          )
        })}
      </ol>
      {undoBar}
    </Panel>
  )
}
