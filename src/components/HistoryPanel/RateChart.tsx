import { useId } from 'react'
import type { HistorySeries } from '../../types'
import { formatPct, formatRate, formatShortDate } from '../../utils/format'
import { rangeName } from '../../utils/ranges'
import styles from './RateChart.module.css'

// Drawing space; the SVG stretches to the container (non-scaling strokes keep lines crisp).
const W = 944
const H = 272
const PAD = 8 // keeps the line off the top/bottom edges

/** Picks ~5 evenly spaced indices for the date axis. */
function tickIndices(count: number, ticks = 5): number[] {
  if (count <= ticks) return Array.from({ length: count }, (_, i) => i)
  return Array.from({ length: ticks }, (_, i) => Math.round((i * (count - 1)) / (ticks - 1)))
}

/** Hand-drawn SVG line + area chart for the pair's rate history (FR-019, FR-022, research R7). */
export function RateChart({ series }: { series: HistorySeries }) {
  const gradientId = useId()
  const { points, high, low, mid, pair, range } = series
  const span = high - low || high * 0.001 || 1
  const x = (i: number) => (points.length === 1 ? W / 2 : (i / (points.length - 1)) * W)
  const y = (rate: number) => PAD + ((high - rate) / span) * (H - PAD * 2)

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(p.rate).toFixed(2)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const lastPoint = points[points.length - 1]!
  const summary =
    `${pair.from} to ${pair.to} rate over ${rangeName(range)}: from ${formatRate(series.open)} ` +
    `to ${formatRate(series.last)}, ${series.changePct < 0 ? 'down' : 'up'} ${formatPct(series.changePct).replace(/[▲▼+−] ?/g, '')}. ` +
    `High ${formatRate(high)}, low ${formatRate(low)}.`

  return (
    <div className={styles.chart}>
      <div className={styles.header}>
        <p className={styles.pair}>
          {pair.from}/{pair.to}
        </p>
        <p className={styles.info}>
          {formatRate(lastPoint.rate)} · {formatShortDate(lastPoint.date)} 16:00 CET
        </p>
      </div>
      <div className={styles.body}>
        <div className={styles.yAxis} aria-hidden="true">
          <span>{formatRate(high)}</span>
          <span>{formatRate(mid)}</span>
          <span>{formatRate(low)}</span>
        </div>
        <div className={styles.plot}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={summary}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[PAD, H / 2, H - PAD].map((gy) => (
              <line key={gy} x1="0" x2={W} y1={gy} y2={gy} className={styles.grid} vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} className={styles.line} vectorEffect="non-scaling-stroke" />
          </svg>
          <div className={styles.xAxis} aria-hidden="true">
            {tickIndices(points.length).map((i) => (
              <span key={i}>{formatShortDate(points[i]!.date)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
