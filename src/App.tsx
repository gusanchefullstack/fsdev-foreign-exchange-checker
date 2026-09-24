import { useState } from 'react'
import styles from './App.module.css'
import { Converter } from './components/Converter/Converter'
import { FavoritesPanel } from './components/FavoritesPanel/FavoritesPanel'
import { LiveAnnouncerProvider, useAnnounce } from './components/LiveAnnouncer/LiveAnnouncer'
import { PinButton } from './components/PinButton/PinButton'
import { Tabs, type TabItem } from './components/Tabs/Tabs'
import { DEFAULT_AMOUNT, DEFAULT_PAIR } from './data/currencyCatalog'
import { useFavorites } from './hooks/useFavorites'
import { useRates } from './hooks/useRates'
import type { CurrencyPair, TabId } from './types'
import { swapPair, withFrom, withTo } from './utils/pair'

export default function App() {
  return (
    <LiveAnnouncerProvider>
      <FxChecker />
    </LiveAnnouncerProvider>
  )
}

/** Owns the top-level state: active pair, amount, tab and the persisted collections. */
function FxChecker() {
  const announce = useAnnounce()
  const rates = useRates()
  const favorites = useFavorites()
  const [amountText, setAmountText] = useState(String(DEFAULT_AMOUNT))
  const [pair, setPair] = useState<CurrencyPair>(DEFAULT_PAIR)
  const [activeTab, setActiveTab] = useState<TabId>('history')

  const rate = rates.rate(pair.from, pair.to)

  function togglePin(p: CurrencyPair) {
    const nowPinned = favorites.toggle(p)
    announce(`${p.from} to ${p.to} ${nowPinned ? 'added to' : 'removed from'} favorites`)
  }

  function unpin(p: CurrencyPair) {
    favorites.remove(p)
    announce(`${p.from} to ${p.to} removed from favorites`)
  }

  const tabs: TabItem[] = [
    { id: 'history', label: 'History' },
    { id: 'compare', label: 'Compare' },
    { id: 'favorites', label: 'Favorites', badge: favorites.favorites.length },
    { id: 'log', label: 'Log' },
  ]

  return (
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
            onSwap={() => setPair(swapPair)}
            actions={
              <PinButton
                withText
                pinned={favorites.isPinned(pair)}
                label={`Favorite ${pair.from} to ${pair.to}`}
                onClick={() => togglePin(pair)}
              />
            }
          />
        )}
      </section>
      <section aria-label="Rate details">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab}>
          {activeTab === 'favorites' && (
            <FavoritesPanel
              favorites={favorites.favorites}
              rate={rates.rate}
              change={rates.change}
              onSelect={setPair}
              onUnpin={unpin}
            />
          )}
        </Tabs>
      </section>
    </main>
  )
}
