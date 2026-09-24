import { useRef } from 'react'
import { useFocusAfterRemoval } from '../../hooks/useFocusAfterRemoval'
import type { CurrencyCode, CurrencyPair, Favorite } from '../../types'
import { formatPct, formatRate } from '../../utils/format'
import { EmptyState } from '../EmptyState/EmptyState'
import { Icon } from '../Icon/Icon'
import { Panel } from '../Panel/Panel'
import panelStyles from '../Panel/Panel.module.css'
import { PinButton } from '../PinButton/PinButton'
import styles from './FavoritesPanel.module.css'

interface FavoritesPanelProps {
  favorites: Favorite[]
  rate: (from: CurrencyCode, to: CurrencyCode) => number | null
  change: (from: CurrencyCode, to: CurrencyCode) => number | null
  onSelect: (pair: CurrencyPair) => void
  onUnpin: (pair: CurrencyPair) => void
}

/** Favorites tab: pinned pairs with live rate and daily change (FR-028–FR-031). */
export function FavoritesPanel({ favorites, rate, change, onSelect, onUnpin }: FavoritesPanelProps) {
  // Pairs whose currency is no longer offered are hidden, not deleted.
  const visible = favorites.filter((f) => rate(f.from, f.to) !== null)
  const listRef = useRef<HTMLUListElement>(null)
  const emptyRef = useRef<HTMLDivElement>(null)
  const markRemoved = useFocusAfterRemoval(listRef, '[aria-pressed]', emptyRef, visible.length)

  if (visible.length === 0) {
    return (
      <div ref={emptyRef} tabIndex={-1} className={styles.empty}>
        <EmptyState title="No pinned pairs yet">
          Pin a pair to track its rate here. Tap the star icon on any conversion or comparison row.
        </EmptyState>
      </div>
    )
  }

  return (
    <Panel title="Pinned pairs" meta={`${visible.length} ${visible.length === 1 ? 'favorite' : 'favorites'}`}>
      <ul ref={listRef} className={panelStyles.list}>
        {visible.map((f, index) => {
          const r = rate(f.from, f.to)!
          const pct = change(f.from, f.to) ?? 0
          return (
            <li key={`${f.from}-${f.to}`} className={`${panelStyles.row} ${styles.row}`}>
              <button
                type="button"
                className={styles.load}
                aria-label={`Load ${f.from} to ${f.to}, rate ${formatRate(r)}, ${formatPct(pct)}`}
                onClick={() => onSelect({ from: f.from, to: f.to })}
              >
                <span className={styles.pair}>
                  {f.from}
                  <Icon name="arrow-right" size={11} className={styles.arrow} />
                  {f.to}
                </span>
                <span className={styles.price}>
                  <span className={styles.rate}>{formatRate(r)}</span>
                  <span className={`${styles.change} ${pct < 0 ? panelStyles.down : panelStyles.up}`}>
                    {formatPct(pct)}
                  </span>
                </span>
              </button>
              <PinButton pinned label={`Unpin ${f.from} to ${f.to}`} onClick={() => {
                  markRemoved(index)
                  onUnpin({ from: f.from, to: f.to })
                }} />
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
