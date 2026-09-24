import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import type { Currency, CurrencyCode, CurrencyPair } from '../../types'
import { formatAmount, formatInputDisplay, formatRate, parseAmountInput } from '../../utils/format'
import { CurrencyPicker, type CurrencyPickerHandle } from '../CurrencyPicker/CurrencyPicker'
import { Icon } from '../Icon/Icon'
import { useAnnounce } from '../LiveAnnouncer/LiveAnnouncer'
import styles from './Converter.module.css'

interface ConverterProps {
  amountText: string
  onAmountChange: (text: string) => void
  pair: CurrencyPair
  currencies: Currency[]
  rate: number | null
  onFromChange: (code: CurrencyCode) => void
  onToChange: (code: CurrencyCode) => void
  onSwap: () => void
  /** Favorite / Log conversion buttons. */
  actions?: ReactNode
  sendPickerRef?: Ref<CurrencyPickerHandle>
}

/** Shrinks the big amount text for long numbers so it never overflows (FR-044). */
const sizeClass = (text: string) => (text.length > 13 ? styles.xsmall : text.length > 9 ? styles.small : '')

export function Converter({
  amountText,
  onAmountChange,
  pair,
  currencies,
  rate,
  onFromChange,
  onToChange,
  onSwap,
  actions,
  sendPickerRef,
}: ConverterProps) {
  const announce = useAnnounce()
  const [focused, setFocused] = useState(false)
  const amount = parseAmountInput(amountText).value
  const received = amount !== null && rate !== null ? formatAmount(amount * rate) : ''
  const shownInput = focused ? amountText : formatInputDisplay(amountText)

  // Announce the converted amount once typing settles (FR-043), not on first render.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!received || amount === null) return
    const t = setTimeout(
      () => announce(`${formatInputDisplay(amountText)} ${pair.from} equals ${received} ${pair.to}`),
      500,
    )
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [received, pair.from, pair.to])

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.panel}>
          <label className={styles.label} htmlFor="send-amount">
            Send
          </label>
          <div className={styles.row}>
            <div className={styles.amountBox}>
              <input
                id="send-amount"
                className={`${styles.amount} ${sizeClass(shownInput)}`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                aria-label="Amount to send"
                placeholder="0"
                value={shownInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => onAmountChange(parseAmountInput(e.target.value).text)}
              />
            </div>
            <CurrencyPicker
              ref={sendPickerRef}
              label="Send currency"
              value={pair.from}
              currencies={currencies}
              onSelect={onFromChange}
            />
          </div>
        </div>

        <button type="button" className={styles.swap} aria-label="Swap currencies" onClick={onSwap}>
          <Icon name="exchange" size={20} className={styles.swapHorizontal} />
          <Icon name="exchange-vertical" size={20} className={styles.swapVertical} />
        </button>

        <div className={styles.panel}>
          <span className={styles.label} id="receive-label">
            Receive
          </span>
          <div className={styles.row}>
            <div className={styles.amountBox}>
              <output
                className={`${styles.amount} ${styles.received} ${sizeClass(received)}`}
                aria-labelledby="receive-label"
                // <output> is an implicit live region; the debounced announcement below replaces it.
                aria-live="off"
                data-testid="received-amount"
              >
                {received}
              </output>
            </div>
            <CurrencyPicker label="Receive currency" value={pair.to} currencies={currencies} onSelect={onToChange} />
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.rate}>{rate !== null ? `1 ${pair.from} = ${formatRate(rate)} ${pair.to}` : '—'}</p>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  )
}
