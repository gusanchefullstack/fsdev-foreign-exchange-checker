import { useState } from 'react'
import styles from './App.module.css'
import { Converter } from './components/Converter/Converter'
import { FavoritesPanel } from './components/FavoritesPanel/FavoritesPanel'
import { Header } from './components/Header/Header'
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel'
import { LogPanel } from './components/LogPanel/LogPanel'
import { LiveAnnouncerProvider, useAnnounce } from './components/LiveAnnouncer/LiveAnnouncer'
import { PinButton } from './components/PinButton/PinButton'
import { Tabs, type TabItem } from './components/Tabs/Tabs'
import { DEFAULT_AMOUNT, DEFAULT_PAIR } from './data/currencyCatalog'
import { useConversionLog } from './hooks/useConversionLog'
import { useFavorites } from './hooks/useFavorites'
import { usePersistentState } from './hooks/usePersistentState'
import { useRates } from './hooks/useRates'
import type { CurrencyPair, HistoryRange, TabId } from './types'
import { formatAmount, formatInputDisplay, parseAmountInput } from './utils/format'
import { swapPair, withFrom, withTo } from './utils/pair'

const TAB_IDS: TabId[] = ['history', 'compare', 'favorites', 'log']

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
  const log = useConversionLog()
  const [amountText, setAmountText] = useState(String(DEFAULT_AMOUNT))
  const [pair, setPair] = useState<CurrencyPair>(DEFAULT_PAIR)
  const [activeTab, setActiveTab] = usePersistentState<TabId>('activeTab', 'history', (v) =>
    TAB_IDS.includes(v as TabId) ? (v as TabId) : null,
  )
  const [range, setRange] = useState<HistoryRange>('1M')

  const rate = rates.rate(pair.from, pair.to)
  const amount = parseAmountInput(amountText).value
  const canLog = amount !== null && amount > 0 && rate !== null

  function logConversion() {
    if (!canLog) return
    const entry = log.add({ from: pair.from, to: pair.to, sendAmount: amount, rate })
    announce(
      `Conversion logged: ${formatInputDisplay(amountText)} ${pair.from} to ${formatAmount(entry.receivedAmount)} ${pair.to}`,
    )
  }

  function deleteEntry(id: string) {
    log.remove(id)
    announce('Log entry deleted')
  }

  function clearLog() {
    log.clearAll()
    announce('Conversion log cleared. Undo available for 5 seconds')
  }

  function undoClear() {
    log.undo()
    announce('Conversion log restored')
  }

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
    { id: 'log', label: 'Log', badge: log.entries.length },
  ]

  return (
    <>
      <Header currencyCount={rates.status === 'ready' ? rates.currencies.length : null} />
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
                <>
                  <PinButton
                    withText
                    pinned={favorites.isPinned(pair)}
                    label={`Favorite ${pair.from} to ${pair.to}`}
                    onClick={() => togglePin(pair)}
                  />
                  <button type="button" className={styles.logButton} disabled={!canLog} onClick={logConversion}>
                    Log conversion
                  </button>
                </>
              }
            />
          )}
        </section>
        <section aria-label="Rate details">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab}>
            {activeTab === 'history' && rates.status !== 'loading' && (
              <HistoryPanel pair={pair} range={range} onRangeChange={setRange} />
            )}
            {activeTab === 'favorites' && (
              <FavoritesPanel
                favorites={favorites.favorites}
                rate={rates.rate}
                change={rates.change}
                onSelect={setPair}
                onUnpin={unpin}
              />
            )}
            {activeTab === 'log' && (
              <LogPanel
                entries={log.entries}
                canUndo={log.canUndo}
                onDelete={deleteEntry}
                onClearAll={clearLog}
                onUndo={undoClear}
                onPauseUndo={log.pauseUndo}
              />
            )}
          </Tabs>
        </section>
      </main>
    </>
  )
}
