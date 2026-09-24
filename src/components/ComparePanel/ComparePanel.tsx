import { COMPARE_CODES } from '../../data/currencyCatalog'
import type { Currency, CurrencyCode, CurrencyPair } from '../../types'
import { formatAmount, formatRate } from '../../utils/format'
import { EmptyState } from '../EmptyState/EmptyState'
import { Flag } from '../Flag/Flag'
import { Panel } from '../Panel/Panel'
import panelStyles from '../Panel/Panel.module.css'
import { PinButton } from '../PinButton/PinButton'
import styles from './ComparePanel.module.css'

interface ComparePanelProps {
  amount: number | null
  from: CurrencyCode
  currencies: Currency[]
  rate: (from: CurrencyCode, to: CurrencyCode) => number | null
  isPinned: (pair: CurrencyPair) => boolean
  onTogglePin: (pair: CurrencyPair) => void
}

/** Compare tab: the send amount in the design's comparison currencies (FR-024–FR-027). */
export function ComparePanel({ amount, from, currencies, rate, isPinned, onTogglePin }: ComparePanelProps) {
  if (amount === null) {
    return (
      <EmptyState title="No comparison available">
        Enter an amount in <span className="label">Send</span> above to see what your money is worth in other
        currencies.
      </EmptyState>
    )
  }

  const rows = COMPARE_CODES.filter((code) => code !== from)
    .map((code) => ({ code, currency: currencies.find((c) => c.code === code), r: rate(from, code) }))
    .filter((row) => row.r !== null)

  return (
    <Panel
      title={
        <>
          <span className={styles.kicker}>Multi-currency</span>{' '}
          <span className={styles.base}>
            {formatAmount(amount).replace(/\.00$/, '')} from {from}
          </span>
        </>
      }
      meta={`${rows.length} ${rows.length === 1 ? 'pair' : 'pairs'}`}
    >
      <ul className={panelStyles.list}>
        {rows.map(({ code, currency, r }) => {
          const pair = { from, to: code }
          return (
            <li key={code} className={panelStyles.row}>
              <Flag code={code} size={24} />
              <span className={styles.names}>
                <span className={styles.code}>{code}</span>
                <span className={styles.name}>{currency?.name ?? code}</span>
              </span>
              <span className={styles.values}>
                <span className={styles.amount}>{formatAmount(amount * r!)}</span>
                <span className={styles.rate}>@ {formatRate(r!)}</span>
              </span>
              <PinButton pinned={isPinned(pair)} label={`Pin ${from} to ${code}`} onClick={() => onTogglePin(pair)} />
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
