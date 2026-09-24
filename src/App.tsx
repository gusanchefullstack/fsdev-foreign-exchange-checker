import { useState } from 'react'
import styles from './App.module.css'
import { Converter } from './components/Converter/Converter'
import { LiveAnnouncerProvider } from './components/LiveAnnouncer/LiveAnnouncer'
import { Tabs, type TabItem } from './components/Tabs/Tabs'
import { DEFAULT_AMOUNT, DEFAULT_PAIR } from './data/currencyCatalog'
import { useRates } from './hooks/useRates'
import type { CurrencyPair, TabId } from './types'
import { withFrom, withTo } from './utils/pair'

export default function App() {
  const rates = useRates()
  const [amountText, setAmountText] = useState(String(DEFAULT_AMOUNT))
  const [pair, setPair] = useState<CurrencyPair>(DEFAULT_PAIR)
  const [activeTab, setActiveTab] = useState<TabId>('history')

  const rate = rates.rate(pair.from, pair.to)

  const tabs: TabItem[] = [
    { id: 'history', label: 'History' },
    { id: 'compare', label: 'Compare' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'log', label: 'Log' },
  ]

  return (
    <LiveAnnouncerProvider>
      <main className={styles.content}>
        <h1 className="visually-hidden">FX Checker currency converter</h1>
        <section className={styles.section} aria-labelledby="converter-title">
          <h2 id="converter-title" className={styles.sectionTitle}>
            Check the rate
          </h2>
          {rates.status === 'loading' && (
            <p className={styles.status} role="status">
              Loading live rates…
            </p>
          )}
          {rates.status === 'error' && (
            <p className={styles.status} role="alert">
              Live rates are unavailable right now. Please try again in a minute.
            </p>
          )}
          {rates.status === 'ready' && (
            <Converter
              amountText={amountText}
              onAmountChange={setAmountText}
              pair={pair}
              currencies={rates.currencies}
              rate={rate}
              onFromChange={(code) => setPair((p) => withFrom(p, code))}
              onToChange={(code) => setPair((p) => withTo(p, code))}
              onSwap={() => setPair((p) => ({ from: p.to, to: p.from }))}
            />
          )}
        </section>
        <section aria-label="Rate details">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab}>
            <p />
          </Tabs>
        </section>
      </main>
    </LiveAnnouncerProvider>
  )
}
