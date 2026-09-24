import type { HistorySeries } from '../../types'
import { formatPct, formatRate, formatSigned } from '../../utils/format'
import styles from './StatCards.module.css'

/** Open / Last / Change / % change for the selected range (FR-021). */
export function StatCards({ series }: { series: HistorySeries | null }) {
  const dir = series ? (series.change < 0 ? styles.down : styles.up) : ''
  const stats = [
    { label: 'Open', value: series ? formatRate(series.open) : '—', className: '' },
    { label: 'Last', value: series ? formatRate(series.last) : '—', className: '' },
    { label: 'Change', value: series ? formatSigned(series.change) : '—', className: dir },
    { label: '% change', value: series ? formatPct(series.changePct) : '—', className: dir },
  ]
  return (
    <dl className={styles.stats}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <dt className={styles.label}>{s.label}</dt>
          <dd className={`${styles.value} ${s.className}`}>{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
