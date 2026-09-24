import { TICKER_PAIRS } from '../../data/currencyCatalog'
import type { CurrencyCode } from '../../types'
import { formatPct, formatRate } from '../../utils/format'
import styles from './LiveTicker.module.css'

interface LiveTickerProps {
  rate: (from: CurrencyCode, to: CurrencyCode) => number | null
  change: (from: CurrencyCode, to: CurrencyCode) => number | null
}

/**
 * Scrolling "Live markets" strip (FR-014, FR-015). The list is rendered twice so the CSS
 * animation loops seamlessly; the copy is aria-hidden. Pauses on hover/focus, and stays
 * still (scrollable) when the user prefers reduced motion.
 */
export function LiveTicker({ rate, change }: LiveTickerProps) {
  const items = TICKER_PAIRS.map((p) => ({ ...p, r: rate(p.from, p.to), c: change(p.from, p.to) })).filter(
    (p) => p.r !== null,
  )

  const list = (hidden: boolean) => (
    <ul className={styles.list} aria-hidden={hidden || undefined}>
      {items.map((p) => {
        const c = p.c ?? 0
        return (
          <li key={`${p.from}${p.to}`} className={styles.item}>
            <span className={styles.pair}>
              {p.from}/{p.to}
            </span>
            <span className={styles.rate}>{formatRate(p.r!)}</span>
            <span className={c < 0 ? styles.down : styles.up}>{formatPct(c)}</span>
          </li>
        )
      })}
    </ul>
  )

  return (
    <section className={styles.ticker} aria-label="Live markets">
      <p className={styles.badge} aria-hidden="true">
        <span className={styles.dot} />
        Live markets
      </p>
      {/* Focusable so keyboard users can pause it and scroll it (reduced motion). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className={styles.viewport} tabIndex={0} role="group" aria-label="Currency pairs, 24 hour change">
        <div className={styles.track}>
          {list(false)}
          {list(true)}
        </div>
      </div>
    </section>
  )
}
