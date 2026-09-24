---

description: "Task list for FX Checker Currency App"
---

# Tasks: FX Checker Currency App

**Input**: Design documents from `specs/001-fx-checker-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: The spec draft asks for Vitest tests of use cases and key or edge cases, so each story
has test tasks. Write each story's tests first and confirm they fail before implementing it.

**Organization**: Tasks are grouped by user story (spec.md US1–US10) so each can be built and
checked on its own. Phase order follows priority: P1 → P2 (US2, US3, US4, US7) → P3 (US5, US6) →
P4 (US8, US9, US10).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task belongs to (e.g., US1, US2, US3)
- Every task includes exact file paths

## Path Conventions

This is a single Vite project at the repo root: `index.html`, `src/`, `public/`, and `tests/setup.ts`.
Each component lives in `src/components/<Name>/` with `<Name>.tsx`, `<Name>.module.css`, and
`<Name>.test.tsx`. Reference docs: design facts and tokens are in research.md (R11, R12), API
shapes in `contracts/frankfurter-api.md`, storage keys in `contracts/storage.md`, and URL,
shortcuts, CSV, and announcement copy in `contracts/ui-contract.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Ask the user to confirm, then create the public GitHub repo `fsdev-foreign-exchange-checker` with `gh repo create` and add it as `origin` (Constitution: Versioning & Repository Policy says to create it first). Check that `.gitignore` still excludes `*.fig`, `*.sketch`, `*.xd`, then make the initial commit of the existing starter files and specs
- [X] T002 Initialize the Vite React TypeScript project in place at the repo root (package name `fsdev-foreign-exchange-checker`): `package.json` with scripts `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`, `test` (`vitest run`), `test:watch`; dependencies `react@19`, `react-dom@19`; devDependencies `vite@8`, `@vitejs/plugin-react`, `typescript@6`, `@types/react`, `@types/react-dom`
- [X] T003 Create `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` with `"strict": true`, `"noUncheckedIndexedAccess": true`, target ES2022, and `jsx: react-jsx`
- [X] T004 Create `vite.config.ts` with the React plugin and a Vitest `test` block (`environment: 'jsdom'`, `setupFiles: ['tests/setup.ts']`, `css.modules.classNameStrategy: 'non-scoped'`, `globals: true`)
- [X] T005 [P] Install and configure the test tooling: `vitest@5`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `vitest-axe`. Create `tests/setup.ts`, which registers the jest-dom and vitest-axe matchers, stubs `matchMedia` and `crypto.randomUUID`, and exports `mockFetch(routes)`, a helper that answers URLs matching regexes with JSON bodies from `contracts/frankfurter-api.md`
- [X] T006 [P] Configure ESLint (flat config) in `eslint.config.js` with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, and `eslint-plugin-jsx-a11y` (recommended rules)
- [X] T007 Move `assets/` to `public/assets/` with `git mv` so `/assets/images/...` and `/assets/fonts/...` URLs work in dev and build. Update the favicon path in `index.html` to `/assets/images/favicon-32x32.png`
- [X] T008 Rewrite `index.html` as the Vite entry: `lang="en"`, the viewport meta, the title `Frontend Mentor | FX Checker`, a meta description, `<div id="root"></div>`, and `<script type="module" src="/src/main.tsx">`. Keep the starter's static copy by moving it to `specs/001-fx-checker-app/starter-copy.md` for reference, since all copy is rendered by React
- [X] T009 Create the empty source tree from plan.md: `src/{styles,types,data,services,hooks,utils,components}/`, plus `src/main.tsx` (renders `<App/>` in `StrictMode` and imports `styles/fonts.css`, `styles/tokens.css`, `styles/global.css`) and a placeholder `src/App.tsx`

**Checkpoint**: `npm run dev`, `npm run build`, `npm run lint`, and `npm test` (no tests yet) all succeed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, types, the data catalog, the API service, the persistence helper, the layout
shell, and the announcer, which every story uses

**⚠️ CRITICAL**: No user story work can start until this phase is complete

- [X] T010 [P] Create `src/styles/tokens.css` with every Figma variable from research R11 as CSS custom properties on `:root`:
  - Colors: `--color-lime-500: #cef739`, `--color-lime-800: #283300`, `--color-green-500: #42eb05`, `--color-red-500: #ff4141`, and `--color-neutral-{50,100,200,400,500,600,700,900}`
  - Spacing: `--space-025`…`--space-600` (2, 6, 8, 10, 12, 16, 20, 24, 32, 48 px)
  - Radius: `--radius-8/16/20/full`
  - Type presets 1–6 (size, weight, line-height, letter-spacing) as `--text-preset-N-*`
  - Semantic aliases: `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-up`, `--color-down`, `--focus-ring`

  Before writing it, check any value you're unsure of against the Figma design system node 100:53 with the figma-desktop MCP `get_variable_defs`
- [X] T011 [P] Create `src/styles/fonts.css` with `@font-face` for `JetBrains Mono` loading `/assets/fonts/jetbrains-mono/jetbrains-mono-variable.ttf` (`font-weight: 100 800`, `font-display: swap`)
- [X] T012 [P] Create `src/styles/global.css`:
  - A modern reset and `box-sizing`
  - `body` on `--color-bg` with `--color-text` and JetBrains Mono
  - `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }`
  - A `.visually-hidden` utility
  - `@media (prefers-reduced-motion: reduce)`, which turns off animations and transitions
- [X] T013 [P] Create the domain types in `src/types/index.ts`: `CurrencyCode`, `Currency {code,name,flagSrc,popular}`, `CurrencyPair {from,to}`, `RatesSnapshot {date,latest,previous,fetchedAt,stale}`, `HistoryRange = '1D'|'1W'|'1M'|'3M'|'1Y'|'5Y'`, `HistoryPoint`, `HistorySeries`, `Favorite {from,to,pinnedAt}`, `ConversionLogEntry {id,timestamp,from,to,sendAmount,receivedAmount,rate}`, `TabId = 'history'|'compare'|'favorites'|'log'`, `Theme = 'dark'|'light'`, and `RatesErrorCode = 'network'|'not-found'|'invalid'|'unknown'`, exactly as in data-model.md
- [X] T014 [P] Create `src/data/currencyCatalog.ts`:
  - `CURRENCY_CATALOG`: code → `{ iso2, name }` for the 57 codes mapped from `public/assets/images/flags/*.webp` (research R3). Leave out BGN, CYP, and HRK; `hm` is unused. Use the design names where they differ from the API ("US Dollar", "UAE Dirham", "Chinese Yuan", "Euro", "British Pound")
  - `POPULAR_CODES = ['USD','EUR','GBP']`
  - `TICKER_PAIRS`: EUR/USD, USD/JPY, GBP/USD, USD/CHF, EUR/GBP, AUD/USD, USD/CAD
  - `COMPARE_CODES = ['GBP','JPY','CHF','CAD','AUD','INR','CNY','BDT']`
  - `DEFAULT_PAIR = {from:'USD',to:'EUR'}`, `DEFAULT_AMOUNT = 1000`
- [X] T015 [P] Create the pure rate math in `src/utils/rates.ts`: `crossRate(snapshotRates, from, to)` (`latest[to]/latest[from]`, where `USD` = 1), `changePct(latest, previous)`, and `historyStats(points, range)`, which returns `{open,last,change,changePct,high,low,mid}`. For `'1D'`, open is the second-to-last point and the chart points are the last 5. For other ranges, it's first versus last. Add unit tests in `src/utils/rates.test.ts`, including checking against the known cross rates EUR/GBP = 0.75296/0.87638 ≈ 0.85917
- [X] T016 [P] Create the formatting utilities in `src/utils/format.ts`:
  - `formatAmount(n)`: grouping, 2 dp below 100,000 and 0 dp at 100,000+ (FR-007)
  - `formatRate(n)`: 4 dp below 10, 3 dp from 10 to 99.99, 2 dp at 100+ (FR-002)
  - `formatPct(n)`: signed with ▲/▼, 2 dp
  - `formatSigned(n)`: signed with 4 dp
  - `parseAmountInput(raw)`: accepts digits, one `.`, and grouping commas; rejects other characters; returns `null` for empty; clamps to `≤ 999,999,999,999`; no negatives

  Add unit tests in `src/utils/format.test.ts`, including the boundaries 9.9999/10, 99.999/100
  (rates) and 99,999.99/100,000 (amounts)
- [X] T017 Create the API service in `src/services/frankfurter.ts`, following `contracts/frankfurter-api.md`:
  - A private `getJson(url)` with an 8 s `AbortController` timeout that maps failures to `RatesError { code: RatesErrorCode }`: 404 → `not-found`, 422 → `invalid`, fetch/abort → `network`, anything else → `unknown`
  - `fetchCurrencies()`: `GET /v2/currencies`, returns the entries whose code is in `CURRENCY_CATALOG` as `Currency[]`, ordered Popular first then alphabetical
  - `fetchLatestSnapshot(codes)`: `GET /v2/rates?base=USD&quotes=…&from={today−10d}`, groups by quote and takes the last two dates as `latest`/`previous`
  - `fetchHistory(pair, range)`: `from`/`group` per the research R5 table

  Only this module calls `fetch`. Add tests in `src/services/frankfurter.test.ts` using `mockFetch`, covering each error mapping
- [X] T018 [P] Create `src/hooks/usePersistentState.ts`: `usePersistentState<T>(key, defaultValue, validate)`. It reads `fx:v1:${key}` inside try/catch plus `validate` (falling back to the default when data is invalid or missing), writes on change, and silently stays in memory when storage throws (FR-039, `contracts/storage.md`). Add tests in `src/hooks/usePersistentState.test.ts` covering corrupt JSON, an invalid shape, and storage that throws
- [X] T019 [P] Create `src/components/LiveAnnouncer/LiveAnnouncer.tsx`: a context provider that renders one visually hidden `<div aria-live="polite" aria-atomic="true">`, plus a `useAnnounce()` hook that returns `announce(message)`. It clears and resets the text so a repeated message is re-announced
- [X] T020 [P] Create `src/components/Flag/Flag.tsx` and `Flag.module.css`: a round flag image (`alt=""`, since it's decorative next to the code) with an `onError` fallback to a neutral circle that shows the currency code (spec edge case "Flag image fails to load")
- [X] T021 [P] Create `src/components/EmptyState/EmptyState.tsx` and `EmptyState.module.css`: a title plus a description, styled per the Figma empty frames (nodes 334:8158, 334:8347, 338:8598, 338:8713)
- [X] T022 Create `src/hooks/useRates.ts`. It loads `fetchCurrencies` and `fetchLatestSnapshot` on mount and exposes `{status:'loading'|'ready'|'error', currencies, snapshot, errorCode, rate(from,to), change(from,to)}`. It writes a successful snapshot to `fx:v1:rates` (cache writing only; reading the cache comes in US8)
- [X] T023 Create the layout shell in `src/App.tsx` and `src/App.module.css`:
  - `LiveAnnouncerProvider` wrapping a `<header>` slot, a ticker slot, and a single `<main>` with a visually hidden `<h1>FX Checker</h1>`
  - The "Check the rate" `<section>` (h2) and the tabs region
  - A centered 1100px content column on desktop, full width with 16–20px side padding on tablet and mobile (Figma frames 75:175, 237:1176, 237:1337)
  - Wire in `useRates`
- [X] T024 Create the base `src/components/Tabs/Tabs.tsx` and `Tabs.module.css`:
  - A WAI-ARIA tablist (`role="tablist"`, `role="tab"` with `aria-selected`/`aria-controls`, `role="tabpanel"` with `aria-labelledby`), manual activation, and ←/→/Home/End keys
  - Tabs: History, Compare, Favorites (badge), Log (badge)
  - `activeTab` held in `App` state, defaulting to `'history'`
  - Styled per the Figma Components frame 151:2489 (underline on the active tab, lime badge)

  Add keyboard tests in `Tabs.test.tsx`

**Checkpoint**: The foundation is ready. The app shell renders with tabs, rates load, and the utility tests pass.

---

## Phase 3: User Story 1 - Convert an amount between two currencies (Priority: P1) 🎯 MVP

**Goal**: Type an amount, pick send and receive currencies from a searchable grouped picker, see
the converted amount and the rate line, and swap.

**Independent Test**: Load the app. The default is 1,000 USD→EUR with a correct result and rate
line. Change the amount and both currencies, and swap. Every value matches the reference rate
(quickstart V1–V3).

### Tests for User Story 1

> Write these first and confirm they fail before implementing

- [X] T025 [P] [US1] Converter behavior tests in `src/components/Converter/Converter.test.tsx`:
  - The defaults are 1,000 USD→EUR, the received amount is `amount × rate` to 2 dp, and the rate line reads `1 USD = 0.8764 EUR`
  - Typing updates the result on every keystroke
  - An empty amount shows a blank result
  - Non-numeric characters are rejected
  - Swap keeps the amount and inverts the pair
- [X] T026 [P] [US1] Picker tests in `src/components/CurrencyPicker/CurrencyPicker.test.tsx`:
  - The groups "Popular" (3) and "Other currencies" (N−3) with counts
  - The check on the selected currency
  - Search by code and by name, ignoring case ("yen", "jp")
  - The "no currencies found" message
  - ↑/↓ plus Enter selects
  - Escape closes it and returns focus to the trigger
  - Clicking outside closes it
  - Choosing the currency on the other side swaps the pair
  - No axe violations

### Implementation for User Story 1

- [X] T027 [US1] Create `src/components/CurrencyPicker/CurrencyPicker.tsx` and `CurrencyPicker.module.css`:
  - The trigger button (flag, code, chevron icon from `/assets/images/icon-chevron-down.svg`) with `aria-haspopup="listbox"` and `aria-expanded`
  - A popover (376px wide on desktop, full width on mobile, per Figma 266:6113 and 332:6918) with a search input (`role="combobox"`, `aria-controls`, `aria-activedescendant`, placeholder "Search currencies...", search icon)
  - A `role="listbox"` with two `role="group"` sections, each with a heading label and count
  - Options showing flag, code, and name, with a check icon (`/assets/images/icon-check.svg`) and `aria-selected` on the current one
  - Filtering by code or name ignoring case, keyboard navigation, and closing on Escape, outside click, or selection, with focus returning to the trigger (FR-008–FR-012)
- [X] T028 [US1] Create `src/components/Converter/Converter.tsx` and `Converter.module.css`, per Figma 75:175:
  - The Send panel: label "Send", a numeric text input with `inputMode="decimal"` and an accessible label, and a `CurrencyPicker`
  - A swap icon button (`/assets/images/icon-exchange.svg`, with `icon-exchange-vertical.svg` on mobile) with `aria-label="Swap currencies"`
  - The Receive panel: label "Receive", the converted amount in lime (`<output>`), and a `CurrencyPicker`
  - The rate line `1 {FROM} = {rate} {TO}` below a dashed divider
  - Placeholder slots for the Favorite and Log conversion buttons, which come in US2 and US3

  The amount input shows grouped formatting when it isn't focused (FR-001–FR-004, FR-007)
- [X] T029 [US1] In `src/App.tsx`, lift converter state (`amountInput`, `pair`) into `App`:
  - Implement the same-currency rule: choosing the other side's currency swaps the pair (data-model CurrencyPair)
  - Render `Converter` inside the "Check the rate" section
  - Show a loading skeleton while `useRates` is loading, and friendly copy ("Live rates are unavailable right now. Please try again in a minute.") when it has errored (FR-052, FR-053)
- [X] T030 [US1] Announce the converted amount through `useAnnounce`, debounced 500 ms, as "1,000 USD equals 853.02 EUR" (`contracts/ui-contract.md`), in `src/components/Converter/Converter.tsx`
- [X] T031 [US1] Make the converter responsive in `src/components/Converter/Converter.module.css`: side-by-side panels on desktop and tablet, stacked with a vertical swap icon on mobile (Figma 237:1337), no overflow at 320px, and large amounts (999,999,999,999) shrink or wrap without overflowing

**Checkpoint**: The MVP works on its own. Conversion, picker, and swap are complete, and the US1 tests pass.

---

## Phase 4: User Story 2 - Pin favorite pairs and reload them (Priority: P2)

**Goal**: Pin the active pair, list pinned pairs with rate and daily change, load one into the
converter, unpin, and keep them across sessions.

**Independent Test**: Pin two pairs, reload, open Favorites, select one row (the converter
updates), and unpin the other. With none left, the empty state shows (quickstart V4).

### Tests for User Story 2

- [X] T032 [P] [US2] Hook tests in `src/hooks/useFavorites.test.ts`:
  - Pin adds it newest first
  - A duplicate pin does nothing ("Unique by `from-to` (FR-032)")
  - Unpin removes it
  - Favorites persist to `fx:v1:favorites` and reload from it
  - Invalid stored entries are dropped individually
- [X] T033 [P] [US2] Panel tests in `src/components/FavoritesPanel/FavoritesPanel.test.tsx`:
  - Rows show "USD → EUR", the rate, and the change % with ▲/▼
  - Header "N favorites"
  - Selecting a row calls `onSelectPair`
  - The star unpins it
  - The empty state reads "No pinned pairs yet"
  - No axe violations

### Implementation for User Story 2

- [X] T034 [US2] Create `src/hooks/useFavorites.ts` on top of `usePersistentState('favorites', [], validateFavorites)`, exposing `favorites`, `isPinned(pair)`, `toggle(pair)`, and `remove(pair)`. Order is newest `pinnedAt` first, and duplicates by `from-to` are prevented (FR-028, FR-032)
- [X] T035 [US2] Add the Favorite toggle to `src/components/Converter/Converter.tsx` and its CSS:
  - A `<button aria-pressed>` with a star icon (`icon-star.svg` or `icon-star-filled.svg`)
  - The label is "Favorite" when unpinned and "Favorited" when pinned, with the lime filled style from Figma
  - It announces "USD to EUR added to favorites" or "…removed from favorites" (FR-005, FR-043)
- [X] T036 [US2] Create `src/components/FavoritesPanel/FavoritesPanel.tsx` and `FavoritesPanel.module.css`, per Figma 160:2949 and the FavoritesItem 257px frame:
  - The section title "Pinned pairs" with the count "N favorites"
  - A `<ul>` of rows, each a `<button>` (accessible name "Load USD to EUR") showing the pair, the live rate, and the change % colored up/down
  - A separate filled-star unpin button with `aria-label="Unpin USD to EUR"`
  - `EmptyState` with the copy from spec FR-031
  - Favorites whose currency isn't in the list are hidden (FR-028–FR-031)
- [X] T037 [US2] In `src/App.tsx`, wire `useFavorites` into `App`:
  - The Favorites tab badge shows `favorites.length`
  - Render `FavoritesPanel` in its tabpanel
  - Selecting a row sets the active `pair`

**Checkpoint**: US1 and US2 both work on their own.

---

## Phase 5: User Story 3 - Log conversions and review the log (Priority: P2)

**Goal**: Log conversions, show them with relative times, delete one, clear all with a 5 s Undo,
cap the log at 100, and keep it across sessions.

**Independent Test**: Log 3, delete 1, reload (2 remain). Clear all, then Undo within 5 s (both
restored). Clear again and wait, and the empty state stays (quickstart V5).

### Tests for User Story 3

- [ ] T038 [P] [US3] Unit tests in `src/utils/relativeTime.test.ts` for FR-035: "`<60 s → "now"`, `<60 min → "{m}m"`, `<24 h → "{h}h"`, else `"{d} {Mon}"`" (e.g., "13 May"), including the boundaries at 59 s, 60 s, 59 m, 23 h, and 24 h
- [ ] T039 [P] [US3] Hook tests in `src/hooks/useConversionLog.test.ts` (fake timers):
  - Log adds it newest first with `receivedAmount` rounded to 2 dp and the frozen `rate`
  - The 101st entry drops the oldest ("capped at 100")
  - Delete removes one
  - `clearAll` empties the list and writes `[]` right away
  - `undo` within 5 s restores the entries in their original order
  - The timer pauses while `pauseUndo(true)`
  - After 5 s, undo is no longer available
  - `add()` during the undo window clears `canUndo` and keeps only the new entry
- [ ] T040 [P] [US3] Panel tests in `src/components/LogPanel/LogPanel.test.tsx`:
  - Rows show the relative time, the pair, and the send and receive amounts
  - Header "N logged"
  - The delete button (`aria-label` "Delete conversion USD to EUR, 1,000.00") works
  - Clear all shows the Undo button
  - Empty state copy "No conversions logged yet"
  - The Converter's "Log conversion" is disabled for an empty or zero amount
  - No axe violations

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create `src/utils/relativeTime.ts` with `formatRelativeTime(timestamp, now)` per FR-035, plus `formatAbsolute(timestamp)` for the `<time dateTime>` attribute
- [ ] T042 [US3] Create `src/hooks/useConversionLog.ts` on top of `usePersistentState('log', [], validateLog)`:
  - `add({from,to,sendAmount,rate})` creates `{id: crypto.randomUUID(), timestamp: Date.now(), receivedAmount: round2(sendAmount×rate)}`, prepends it, and slices to 100
  - `remove(id)`
  - `clearAll()` stores the previous entries in an in-memory `undoBuffer`, sets the entries to `[]`, and starts a 5000 ms timer
  - `undo()` and `pauseUndo(paused)`
  - `canUndo`
  - `add()` and `remove()` discard the `undoBuffer` and cancel the timer

  (FR-033, FR-034, FR-036, data-model ConversionLogEntry)
- [ ] T043 [US3] Add the "Log conversion" button to `src/components/Converter/Converter.tsx` (outlined lime style per Figma). It's disabled when `amount` is null or 0 or rates aren't ready. On click it calls `add` and announces "Conversion logged: 1,000 USD to 853.02 EUR" (FR-006, FR-043)
- [ ] T044 [US3] Create `src/components/LogPanel/LogPanel.tsx` and `LogPanel.module.css`, per Figma 160:3998 and LoggedItem:
  - The title "Conversion log" with the count "N logged" and a "Clear all" button
  - A `<ol>` of entries, each with a `<time>` showing the relative time, the pair, the send amount, the received amount, and a delete icon button (`icon-delete.svg`, `icon-delete-filled.svg` on hover)
  - After a clear: an Undo bar (built per spec Assumption "UI not in the design") ("Conversion log cleared" + "Undo" button) whose timer pauses on hover and focus
  - Announcements "Log entry deleted", "Conversion log cleared. Undo available for 5 seconds", and "Conversion log restored"
  - `EmptyState` with the copy from FR-037
  - Relative times refresh every 60 s
- [ ] T045 [US3] In `src/App.tsx`, wire `useConversionLog` into `App`: the Log tab badge shows `entries.length`, and `LogPanel` renders in its tabpanel

**Checkpoint**: US1–US3 work on their own.

---

## Phase 6: User Story 4 - View the rate history of the active pair (Priority: P2)

**Goal**: The History tab (the default) shows a line and area chart for the active pair with
range buttons 1D–5Y (default 1M), Open/Last/Change/% change, and a friendly error state.

**Independent Test**: Cycle through all six ranges. The chart and stats update correctly, 1D shows
5 points with stats from the last two, and a blocked request shows the error copy (quickstart
V6–V7).

### Tests for User Story 4

- [ ] T046 [P] [US4] Hook tests in `src/hooks/useHistory.test.ts`:
  - Each range requests the correct `from`/`group` (research R5)
  - The in-memory cache is used for a repeated pair and range
  - Fewer than 2 points gives the `error` state
  - A pair change refetches
- [ ] T047 [P] [US4] Panel tests in `src/components/HistoryPanel/HistoryPanel.test.tsx`:
  - The default range is 1M, with `aria-checked` on it
  - Stats show Open, Last, signed Change, and % change with ▲/▼ and up/down classes
  - Arrow keys move through the range group
  - The error state reads "No chart data available" plus "We couldn't load rate history for USD/EUR right now. This usually clears up in a minute."
  - The chart has `role="img"` with a descriptive `aria-label`
  - No axe violations

### Implementation for User Story 4

- [ ] T048 [US4] Create `src/hooks/useHistory.ts`. `useHistory(pair, range)` calls `fetchHistory`, caches results in a module-level `Map` keyed `${from}-${to}-${range}`, and returns `{status:'loading'|'ready'|'error', series}` with `historyStats` applied. `points.length < 2` → `error` (FR-019–FR-023)
- [ ] T049 [P] [US4] Create `src/components/HistoryPanel/StatCards.tsx` and `StatCards.module.css`: four cards (Open, Last, Change, % change) as a `<dl>`, with values colored `--color-up` or `--color-down` by sign (Figma 75:175 stat row)
- [ ] T050 [P] [US4] Create `src/components/HistoryPanel/RangeSelector.tsx` and `RangeSelector.module.css`: a `role="radiogroup"` labeled "Chart range" with six `role="radio"` buttons (visible labels 1D 1W 1M 3M 1Y 5Y, written in normal case in the markup as "1d" etc. and uppercased with CSS), a roving tabindex, and ←/→ selecting (FR-020)
- [ ] T051 [US4] Create `src/components/HistoryPanel/RateChart.tsx` and `RateChart.module.css`: a responsive hand-drawn SVG (research R7) with:
  - A lime line and a lime-to-transparent gradient area
  - Dashed gridlines with high, mid, and low Y labels at 4 dp
  - About 5 evenly spaced X date labels ("Apr 14")
  - The header with the pair label "USD/EUR" and "{rate} · {Mon DD} 16:00 CET" (the date from the last point, "16:00 CET" as a fixed label per FR-022)
  - `role="img"` with `aria-label="USD to EUR rate over 1 month: from 0.8516 to 0.8530, up 0.16%"`

  Leave a prop hook for the US10 crosshair
- [ ] T052 [US4] Create `src/components/HistoryPanel/HistoryPanel.tsx` and `HistoryPanel.module.css`. It composes StatCards, RangeSelector, and RateChart, shows a loading skeleton while loading, and on `error` shows `EmptyState` with the FR-023 copy using the pair name. Stats and range sit in a row on desktop and stack on mobile (Figma 237:1337). Range state lives in `App` so US10 shortcuts can change it
- [ ] T053 [US4] In `src/App.tsx`, render `HistoryPanel` in the History tabpanel with the active `pair` and `range` (default `'1M'`)

**Checkpoint**: US1–US4 work on their own.

---

## Phase 7: User Story 7 - Use the app comfortably on any device and with any input (Priority: P2)

**Goal**: A mobile tab dropdown, the last tab remembered, a fully responsive layout, complete
keyboard operation, visible focus, and hover and focus states everywhere.

**Independent Test**: Complete US1–US4 with the keyboard only at 375, 768, and 1440px, and again
with VoiceOver. The layout matches Figma, there's no horizontal scroll from 320px up, and the last
tab is restored on reload (quickstart V10).

### Tests for User Story 7

- [ ] T054 [P] [US7] Tests in `src/components/Tabs/Tabs.test.tsx`:
  - With `matchMedia('(max-width: 767px)')` matching, the tabs render as a native `<select>` labeled "View" with badge counts in the option text ("Favorites (10)")
  - Choosing an option switches the panel
  - The active tab persists to `fx:v1:activeTab` and is restored on remount
- [ ] T055 [P] [US7] App-level accessibility test in `src/App.test.tsx`:
  - Exactly one `<main>` and exactly one `<h1>`
  - No duplicate link text
  - Every interactive element is reachable in DOM order by `userEvent.tab()`
  - `axe` reports no violations for each tab panel

### Implementation for User Story 7

- [ ] T056 [US7] Extend `src/components/Tabs/Tabs.tsx` and its CSS with the mobile dropdown variant (`<label class="visually-hidden">View</label><select>`, styled per Figma Components 151:2489 with a chevron), switched with `useMediaQuery('(max-width: 767px)')` in `src/hooks/useMediaQuery.ts`
- [ ] T057 [US7] Persist the active tab in `src/App.tsx` with `usePersistentState('activeTab','history', isTabId)` (FR-018)
- [ ] T058 [US7] Create `src/components/Header/Header.tsx` and `Header.module.css`:
  - The logo `<img src="/assets/images/logo.svg" alt="FX Checker">`
  - The currency count text "{N} Currencies · EOD · ECB data" (uppercased with CSS)
  - The mobile header variant at 52px (Figma "Mobile Header") versus 66px on desktop

  Render it in `App` (FR-013)
- [ ] T059 [US7] Do a responsive pass over `src/App.module.css` and every component's CSS against the Figma frames: Desktop 1440 (75:175, 151:2490, 160:2949, 160:3998), Tablet 768 (237:1176, 248:1583, 248:2178, 250:2914), and Mobile 375 (237:1337, 248:1878, 248:2200, 250:2936). Use mobile-first media queries at 768px and 1100px+, with no horizontal scroll from 320px to 1920px (FR-044, SC-006)
- [ ] T060 [US7] Do a hover and focus pass on every interactive element in each `*.module.css`, matching the Figma Hover and Focus frames (266:5918, 276:5297, 349:7572, 276:6525, 276:7014, 349:7918). Check that the focus ring has at least 3:1 contrast and isn't hidden by `overflow` clipping (FR-041)
- [ ] T061 [US7] Do a semantic and labels pass: all uppercase labels are written in normal case in the JSX and use `text-transform: uppercase` (FR-045); icon-only buttons have `aria-label`s; decorative icons use `alt=""` or `aria-hidden`; lists use `<ul>`/`<ol>`

**Checkpoint**: The P1 and P2 stories are complete and accessible on all devices.

---

## Phase 8: User Story 5 - Compare the send amount across many currencies (Priority: P3)

**Goal**: The Compare tab converts the send amount into the design's 8 currencies, with the rate
per row and a star to pin or unpin each row.

**Independent Test**: With 1,000 USD, each row's amount equals 1,000 × its rate, pinning GBP adds
USD→GBP to Favorites, and an empty amount shows the empty state (quickstart V8).

### Tests for User Story 5

- [ ] T062 [P] [US5] Tests in `src/components/ComparePanel/ComparePanel.test.tsx`:
  - The header "1,000 from USD" and "8 pairs"
  - Rows GBP, JPY, CHF, CAD, AUD, INR, CNY, BDT with amount and "@ rate"
  - The send currency is left out (send=GBP → 7 pairs)
  - The star toggles the favorite `send→row` with `aria-pressed`
  - The empty amount state "No comparison available"
  - No axe violations

### Implementation for User Story 5

- [ ] T063 [US5] Create `src/components/ComparePanel/ComparePanel.tsx` and `ComparePanel.module.css`, per Figma 151:2490 and CompareItem:
  - The title "Multi-currency" with "{amount} from {FROM}" and the count "{n} pairs"
  - A `<ul>` of rows showing flag, code, name, the converted amount (`formatAmount`), and "@ {rate}"
  - A star toggle `<button aria-pressed aria-label="Pin USD to GBP">` that announces the pin change
  - `EmptyState` with the FR-027 copy

  (FR-024–FR-027)
- [ ] T064 [US5] In `src/App.tsx`, render `ComparePanel` in the Compare tabpanel with `amount`, `pair.from`, `useRates().rate`, and `useFavorites` toggle and `isPinned`

**Checkpoint**: US5 works on its own. Pinned rows appear in Favorites.

---

## Phase 9: User Story 6 - Scan live markets at a glance (Priority: P3)

**Goal**: A continuously scrolling ticker of the 7 design pairs with the rate and daily change,
which pauses on hover and focus and stays still with reduced motion.

**Independent Test**: The ticker scrolls, the values match the cross rates, hover or focus pauses
it, and reduced motion stops it (quickstart V9).

### Tests for User Story 6

- [ ] T065 [P] [US6] Tests in `src/components/LiveTicker/LiveTicker.test.tsx`:
  - It renders 7 pairs with the rate formatted by `formatRate` (FR-002) and ▲/▼ change with the up/down class
  - The duplicated loop copy is `aria-hidden="true"`
  - The region is labeled "Live markets"
  - No axe violations

### Implementation for User Story 6

- [ ] T066 [US6] Create `src/components/LiveTicker/LiveTicker.tsx` and `LiveTicker.module.css`, per Figma Livemarkets (334:8160, 40px desktop and 34px mobile):
  - A fixed "● Live markets" lime label
  - A `<section aria-label="Live markets">` containing a `<ul>` of `TICKER_PAIRS` items, each showing the muted pair, the rate, and the colored change %, each 208px wide
  - A second `aria-hidden` copy for a seamless CSS `@keyframes` translateX loop
  - `animation-play-state: paused` on `:hover` and `:focus-within`, and no animation under `prefers-reduced-motion`, where the list becomes horizontally scrollable inside its own container (FR-014, FR-015)
- [ ] T067 [US6] In `src/App.tsx`, render `LiveTicker` between the header and main

**Checkpoint**: All P1–P3 stories are complete.

---

## Phase 10: User Story 8 - Keep working when rates are unavailable (Priority: P4)

**Goal**: If fetching fails, use the last cached snapshot with an out-of-date banner. With no cache,
show friendly copy.

**Independent Test**: Load online, go offline, and reload. Cached rates show with the banner and
date. With no cache, friendly copy shows (quickstart V11).

### Tests for User Story 8

- [ ] T068 [P] [US8] Tests in `src/hooks/useRates.test.ts`:
  - On a network error with a valid `fx:v1:rates` cache, it returns `status:'ready'` with `snapshot.stale=true` and the cached date
  - With no cache it returns `error`
  - A successful fetch clears `stale`
- [ ] T069 [P] [US8] Tests in `src/components/StaleBanner/StaleBanner.test.tsx`: it renders "Showing saved rates from {date}. Live rates are unavailable." with `role="status"`, and no raw error text anywhere

### Implementation for User Story 8

- [ ] T070 [US8] Extend `src/hooks/useRates.ts`: on a failed fetch, read and validate `fx:v1:rates` (`contracts/storage.md`) and return it with `stale: true`. The currency list falls back to the catalog codes present in the cached snapshot (FR-051)
- [ ] T071 [US8] Create `src/components/StaleBanner/StaleBanner.tsx` and `StaleBanner.module.css` (a notice bar using the surface and lime accent tokens, per spec Assumption "UI not in the design"). Render it at the top of `<main>` in `src/App.tsx` when `snapshot.stale`, and announce it once

**Checkpoint**: The app is resilient offline.

---

## Phase 11: User Story 9 - Personalize the theme and share a pair (Priority: P4)

**Goal**: Toggle between dark and light themes (remembered), and put the active pair in the URL so
it can be bookmarked or shared.

**Independent Test**: Toggle the theme and reload, and it persists. `/?from=GBP&to=JPY` loads that
pair. An invalid URL falls back silently (quickstart V12).

### Tests for User Story 9

- [ ] T072 [P] [US9] Tests in `src/hooks/useUrlPair.test.ts`:
  - It parses a valid `?from=GBP&to=JPY`
  - An unknown code, `from===to`, or missing params give the default USD→EUR
  - A pair change calls `history.replaceState` (not `pushState`) with `?from=…&to=…`
- [ ] T073 [P] [US9] Tests in `src/hooks/useTheme.test.ts`: the default is `dark`, toggling sets `document.documentElement.dataset.theme` and persists to `fx:v1:theme`, and it's restored on load

### Implementation for User Story 9

- [ ] T074 [P] [US9] Create `src/hooks/useUrlPair.ts` per `contracts/ui-contract.md` § URL, and use it in `src/App.tsx` for the initial `pair` (after currencies load) and for syncing changes (FR-046)
- [ ] T075 [P] [US9] Create `src/hooks/useTheme.ts` on top of `usePersistentState('theme','dark', isTheme)`, setting `data-theme` on `<html>` (FR-047)
- [ ] T076 [US9] Add the light theme tokens to `src/styles/tokens.css` under `:root[data-theme="light"]`. Invert the neutral scale for bg, surface, and text, keep lime as the accent with darkened text-on-lime, and use darker up/down variants that meet 4.5:1 on white. Check that each token pair has AA contrast. Build it per spec Assumption "UI not in the design".
- [ ] T077 [US9] Add the theme toggle button to `src/components/Header/Header.tsx` (`aria-pressed`, label "Light theme", sun/moon inline SVG with `aria-hidden`, per spec Assumption "UI not in the design")

**Checkpoint**: The theme and share-link enhancements work.

---

## Phase 12: User Story 10 - Power-user tools (Priority: P4)

**Goal**: Keyboard shortcuts with a help panel, CSV export of the log, and a chart hover crosshair.

**Independent Test**: `/`, `s`, `1`–`6`, and `?` work, but not while typing. The CSV downloads
with the contract header and rows. Hovering the chart shows the date and rate (quickstart V13).

### Tests for User Story 10

- [ ] T078 [P] [US10] Tests in `src/hooks/useShortcuts.test.ts`:
  - Each key from `contracts/ui-contract.md` calls its handler
  - Nothing fires while focus is in an input, select, or textarea, or when Ctrl, Meta, or Alt is held
- [ ] T079 [P] [US10] Tests in `src/utils/csv.test.ts`:
  - The header is exactly `datetime,from,to,send_amount,received_amount,rate`
  - Rows are newest first, amounts are 2 dp with no grouping, the rate is 6 dp, and lines end in `\r\n`
  - Values that need it are quoted
- [ ] T080 [P] [US10] Tests in `src/components/HistoryPanel/RateChart.test.tsx`: the pointer moving over the SVG shows a crosshair and a tooltip with the nearest point's date and 4 dp rate, and pointer leave hides it

### Implementation for User Story 10

- [ ] T081 [P] [US10] Create `src/utils/csv.ts`: `toCsv(entries)` and `downloadCsv(entries)` (a Blob plus a temporary anchor, filename `fx-conversion-log-YYYY-MM-DD.csv`). Add an "Export CSV" button to `src/components/LogPanel/LogPanel.tsx`, disabled when the log is empty (FR-049)
- [ ] T082 [P] [US10] Create `src/hooks/useShortcuts.ts` and wire it into `src/App.tsx`:
  - `/` opens the Send picker and focuses its search (expose `open()` through a ref on `CurrencyPicker`)
  - `s` swaps
  - `1`–`6` set the range and switch to History
  - `?` toggles the help panel

  (FR-048)
- [ ] T083 [US10] Create `src/components/ShortcutsHelp/ShortcutsHelp.tsx` and `ShortcutsHelp.module.css`: a non-modal popover listing the shortcuts in a `<dl>`, opened by a "Keyboard shortcuts" header button or `?`, and closed by Escape with focus returning to its opener. Add the button to `src/components/Header/Header.tsx`. Build it per spec Assumption "UI not in the design".
- [ ] T084 [US10] Add the crosshair to `src/components/HistoryPanel/RateChart.tsx`: pointer events map x to the nearest point, then draw a vertical dashed line, a lime point marker, and a tooltip showing "May 06 · 0.8530" kept inside the chart bounds. Touch drag works too, and pointer leave hides it (FR-050)

**Checkpoint**: All user stories are complete.

---

## Phase 13: Polish, Delivery & Cross-Cutting Concerns

**Purpose**: Quality gates, visual fidelity, documentation, and deployment (carried over from the
spec draft and plan)

- [ ] T085 Run the full quality gate: `npm run lint`, `npm test`, `npm run build`. Fix every failure and check that the gzipped JS bundle is under 100 KB (`dist/assets/*.js`)
- [ ] T086 Visual fidelity pass: compare the running app with the Figma screenshots at exactly 375 and 1440 (and 768) using the figma-desktop MCP `get_screenshot` and Chrome DevTools `take_screenshot`, and fix spacing, type, and color deviations in the component CSS modules (Principle II)
- [ ] T087 Accessibility audit: run a Chrome DevTools Lighthouse accessibility audit on each tab at 375 and 1440, aiming for 100 (SC-005), then do a manual VoiceOver pass over quickstart V10. Fix any findings
- [ ] T088 Performance check (SC-001, SC-002): with Chrome DevTools, record a performance trace while typing 10 characters in Send and confirm each input-to-paint is under 100 ms. Run Lighthouse performance on a production build (`npm run preview`) with network throttling off and confirm the first converted amount renders within 3 s. Record the results in `specs/001-fx-checker-app/checklists/validation.md`
- [ ] T089 Run every quickstart.md validation scenario (V1–V13) at 375, 768, and 1440, and record the results in `specs/001-fx-checker-app/checklists/validation.md`
- [ ] T090 [P] Add plain-language comments to the key logic: cross-rate math, history stats, the undo timer, cache fallback, shortcut guards (`src/utils/rates.ts`, `src/hooks/useConversionLog.ts`, `src/hooks/useRates.ts`, `src/hooks/useShortcuts.ts`)
- [ ] T091 Update `CLAUDE.md` with the real commands and a short note on the final architecture, replacing the "planned" wording
- [ ] T092 Ask the user to confirm the project is done, then deploy to Vercel under the user's account (production), and record the live URL
- [ ] T093 Take the screenshots at exactly 375px and 1440px viewports into `screenshots/` (e.g., `screenshots/mobile-375.png`, `screenshots/desktop-1440.png`)
- [ ] T094 Write `README.md` from `README-template.md` using the `create-readme` skill:
  - The author section has an inline row of badges linking to LinkedIn, GitHub, Hashnode, X, Bluesky, freeCodeCamp, and Frontend Mentor (URLs in `my-sdd-docs/spec-draft.md`)
  - Embed the screenshots, with the 375px image at 40% of the 1440px width
  - Include the live URL

  Then delete `README-template.md` as the starter instructs
- [ ] T095 After the user confirms, submit to Frontend Mentor with the `frontendmentor-submitter` agent (challenge `foreign-exchange-currency-converter`). Check that the snapshot the platform captures matches the design
- [ ] T096 Add the Frontend Mentor solution URL and Vercel live URL to `README.md`, and set the GitHub repo homepage with `gh repo edit --homepage <live-url>`
- [ ] T097 Ask the user for confirmation, then update the portfolio with the `landing-page-portfolio-updater` agent
- [ ] T098 Ask the user for confirmation, then fix the Frontend Mentor quality-report issues with the `frontend-mentor-issue-fixer` agent

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. T001 (repo) comes first per the constitution
- **Foundational (Phase 2)**: Depends on Setup. It blocks all user stories
- **User stories (Phases 3–12)**: All depend on Foundational
- **Polish (Phase 13)**: Depends on all stories you want to ship. T092–T098 run in order and each needs user confirmation where noted

### User Story Dependencies

- **US1 (P1)**: After Foundational. No story dependencies
- **US2 (P2)**: After Foundational. The Favorite toggle goes in the Converter (US1 file), so run it after US1 to avoid file conflicts, though it can be tested on its own
- **US3 (P2)**: After Foundational. The Log button goes in the Converter (US1 file), so run it after US1
- **US4 (P2)**: After Foundational. Independent
- **US7 (P2)**: After US1–US4, because its responsive, hover, and focus passes touch their CSS
- **US5 (P3)**: After Foundational. It uses `useFavorites` (US2) for the stars, so run it after US2
- **US6 (P3)**: After Foundational. Independent
- **US8 (P4)**: Extends `useRates` (Foundational). Independent
- **US9 (P4)**: The theme toggle goes in the Header (US7). URL sync is independent
- **US10 (P4)**: Export needs LogPanel (US3), the crosshair needs RateChart (US4), and the shortcuts need the Converter, picker, and History (US1, US4)

### Within Each User Story

- Write the tests first and confirm they fail, then implement
- Hooks and utils before components, components before wiring them into `App.tsx`
- Finish the story before moving to the next priority

### Parallel Opportunities

- Setup: T005 and T006 in parallel after T002–T004
- Foundational: T010–T016 and T018–T021 in parallel (different files). T017 after T013 and T014. T022 after T017. T023 and T024 after T019 and T022
- Within stories: all test tasks marked [P] in parallel. In US4, T049 and T050 in parallel. In US9, T074 and T075 in parallel. In US10, T081 and T082 in parallel
- Across stories: US4, US6, and US8 can go alongside US2 and US3 if staffed (they touch different files)

---

## Parallel Example: User Story 1

```bash
# Tests first, together:
Task: "Converter behavior tests in src/components/Converter/Converter.test.tsx"
Task: "Picker tests in src/components/CurrencyPicker/CurrencyPicker.test.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "Hook tests in src/hooks/useHistory.test.ts"
Task: "Panel tests in src/components/HistoryPanel/HistoryPanel.test.tsx"
# then
Task: "StatCards in src/components/HistoryPanel/StatCards.tsx"
Task: "RangeSelector in src/components/HistoryPanel/RangeSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup (T001 creates the repo first) and Phase 2 Foundational
2. Phase 3 US1, then **stop and validate** with quickstart V1–V3
3. Optionally deploy a preview

### Incremental Delivery

1. Foundation → US1 (MVP)
2. P2 → US2 → US3 → US4 → US7. The app is feature-complete for the core challenge
3. P3 → US5 → US6. This matches the full Figma design
4. P4 → US8 → US9 → US10. These are the "other features"
5. Phase 13 polish and delivery (deploy, README, submission), with user confirmations

---

## Notes

- [P] tasks touch different files and have no dependencies on incomplete tasks
- Build only what the spec documents (Constitution I). If a task seems to need behavior not in
  `spec.md`, stop and ask for a spec update
- Never render raw error messages (Constitution IV). Map `RatesError` codes to copy
- Commit after each task or logical group, and never commit `*.fig`
