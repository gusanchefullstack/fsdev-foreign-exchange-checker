import { useHistory } from '../../hooks/useHistory'
import type { CurrencyPair, HistoryRange } from '../../types'
import { EmptyState } from '../EmptyState/EmptyState'
import { RangeSelector } from './RangeSelector'
import { RateChart } from './RateChart'
import { StatCards } from './StatCards'
import styles from './HistoryPanel.module.css'

interface HistoryPanelProps {
  pair: CurrencyPair
  range: HistoryRange
  onRangeChange: (range: HistoryRange) => void
}

/** History tab: stats, range selector and chart for the active pair (US4). */
export function HistoryPanel({ pair, range, onRangeChange }: HistoryPanelProps) {
  const { status, series } = useHistory(pair, range)

  return (
    <div className={styles.history}>
      <div className={styles.controls}>
        <StatCards series={series} />
        <RangeSelector value={range} onChange={onRangeChange} />
      </div>
      {status === 'loading' && (
        <div className={styles.loading} role="status">
          Loading rate history…
        </div>
      )}
      {status === 'error' && (
        <div className={styles.error}>
          <EmptyState title="No chart data available">
            We couldn&apos;t load rate history for {pair.from}/{pair.to} right now. This usually clears up in a minute.
          </EmptyState>
        </div>
      )}
      {status === 'ready' && series && <RateChart series={series} />}
    </div>
  )
}
