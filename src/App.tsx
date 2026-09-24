import { useState } from 'react'
import styles from './App.module.css'
import { ComparePanel } from './components/ComparePanel/ComparePanel'
import { Converter } from './components/Converter/Converter'
import { FavoritesPanel } from './components/FavoritesPanel/FavoritesPanel'
import { Header } from './components/Header/Header'
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel'
import { LiveTicker } from './components/LiveTicker/LiveTicker'
import { LogPanel } from './components/LogPanel/LogPanel'
import { LiveAnnouncerProvider, useAnnounce } from './components/LiveAnnouncer/LiveAnnouncer'
import { PinButton } from './components/PinButton/PinButton'
import { StaleBanner } from './components/StaleBanner/StaleBanner'
import { Tabs, type TabItem } from './components/Tabs/Tabs'
import { DEFAULT_AMOUNT, DEFAULT_PAIR } from './data/currencyCatalog'
import { useConversionLog } from './hooks/useConversionLog'
import { useFavorites } from './hooks/useFavorites'
import { usePersistentState } from './hooks/usePersistentState'
import { useTheme } from './hooks/useTheme'
import { pairFromUrl, useUrlPairSync } from './hooks/useUrlPair'
import { useRates } from './hooks/useRates'
import type { CurrencyPair, HistoryRange, TabId } from './types'
import { formatAmount, formatInputDisplay, parseAmountInput } from './utils/format'
import { swapPair, withFrom, withTo } from './utils/pair'

/** Sun / moon glyph in the icon set's 1.5px stroke style (spec Assumption "UI not in the design"). */
function ThemeIcon({ light }: { light: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      {light ? (
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 11.5A7 7 0 1 1 8.5 3a5.5 5.5 0 0 0 8.5 8.5Z"
        />
      ) : (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="10" cy="10" r="3.5" />
          <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4" />
        </g>
      )}
    </svg>
  )
}

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
  const theme = useTheme()
  // null = not chosen yet: use the pair from the URL (once currencies are known) or the default.
  const [chosenPair, setChosenPair] = useState<CurrencyPair | null>(null)
  const ready = rates.status === 'ready'
  const pair =
    chosenPair ?? (ready ? pairFromUrl(window.location.search, rates.currencies.map((c) => c.code)) : null) ?? DEFAULT_PAIR
  const setPair = (next: CurrencyPair | ((p: CurrencyPair) => CurrencyPair)) =>
    setChosenPair(typeof next === 'function' ? next(pair) : next)
  useUrlPairSync(pair, ready)
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
      <Header
        currencyCount={ready ? rates.currencies.length : null}
        actions={
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={theme.theme === 'light'}
            aria-label="Light theme"
            title="Light theme"
            onClick={theme.toggle}
          >
            <ThemeIcon light={theme.theme === 'light'} />
          </button>
        }
      />
      {ready && <LiveTicker rate={rates.rate} change={rates.change} />}
      <main className={styles.content}>
        <h1 className="visually-hidden">FX Checker currency converter</h1>
        {rates.snapshot?.stale && <StaleBanner date={rates.snapshot.date} />}
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
            {activeTab === 'compare' && (
              <ComparePanel
                amount={amount}
                from={pair.from}
                currencies={rates.currencies}
                rate={rates.rate}
                isPinned={favorites.isPinned}
                onTogglePin={togglePin}
              />
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
