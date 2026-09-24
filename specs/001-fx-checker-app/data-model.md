# Phase 1 Data Model: FX Checker Currency App

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

All types live in `src/types/`. Codes are ISO 4217 uppercase strings.

## Currency

| Field | Type | Rules |
|-------|------|-------|
| `code` | `CurrencyCode` (string) | 3 uppercase letters, unique |
| `name` | string | Design display name if set in the catalog, else the API name |
| `flagSrc` | string | Path under `assets/images/flags/{iso2}.webp` |
| `popular` | boolean | `true` only for USD, EUR, GBP |

- Source: the bundled catalog (`src/data/currencyCatalog.ts`) intersected with `GET /v2/currencies`
  (research R3).
- Ordering: the Popular group is USD, EUR, GBP. "Other currencies" is sorted alphabetically by code.

## RatesSnapshot (latest rates, USD-based)

| Field | Type | Rules |
|-------|------|-------|
| `date` | ISO date string | Date of the most recent publication |
| `latest` | `Record<CurrencyCode, number>` | USD→code rate, and `USD` = 1 |
| `previous` | `Record<CurrencyCode, number>` | The publication before `latest` |
| `fetchedAt` | epoch ms | When the snapshot was fetched |
| `stale` | boolean | `true` when it came from the cache after a failed fetch (FR-051) |

Derived values (pure functions in `src/utils/rates.ts`):
- `rate(a, b) = latest[b] / latest[a]`
- `prevRate(a, b) = previous[b] / previous[a]`
- `changePct(a, b) = (rate − prevRate) / prevRate × 100`

## CurrencyPair

| Field | Type | Rules |
|-------|------|-------|
| `from` | CurrencyCode | Must be in the currency list |
| `to` | CurrencyCode | Must be in the currency list, and `from ≠ to` |

- Identity: `"${from}-${to}"`. Direction matters (USD-EUR ≠ EUR-USD).
- Choosing `to` equal to `from` (or the reverse) swaps the pair instead (spec US1 scenario 7).

## ConverterState (in memory, not persisted)

| Field | Type | Rules |
|-------|------|-------|
| `amountInput` | string | Raw user text. Allowed: digits, one decimal separator, grouping commas. Empty is allowed |
| `amount` | number \| null | Parsed value. `null` when empty. Must be ≥ 0 and ≤ 999,999,999,999 |
| `pair` | CurrencyPair | Default USD→EUR, or from the URL (FR-046) |

- `received = amount × rate(pair)`, formatted per FR-007 (grouping; 2 dp below 100,000, 0 dp at 100,000+).
- "Log conversion" is enabled when `amount > 0` and rates are available (FR-006).

## HistorySeries

| Field | Type | Rules |
|-------|------|-------|
| `pair` | CurrencyPair | |
| `range` | `'1D' \| '1W' \| '1M' \| '3M' \| '1Y' \| '5Y'` | Default `'1M'` |
| `points` | `{date: string; rate: number}[]` | Ascending by date. For 1D, the last 5 points |
| `open`, `last` | number | 1D: previous vs latest point. Other ranges: first vs last point (FR-020) |
| `change` | number | `last − open`, signed |
| `changePct` | number | `change / open × 100`, signed |
| `high`, `low`, `mid` | number | Max, min, and midpoint of `points` for the Y axis |

- States: `loading` → `ready` \| `error`. `error` also applies when `points.length < 2` (FR-023).

## Favorite (persisted)

| Field | Type | Rules |
|-------|------|-------|
| `from`, `to` | CurrencyCode | Unique by `from-to` (FR-032) |
| `pinnedAt` | epoch ms | Order: newest first (FR-028) |

- Transitions: `unpinned --pin--> pinned --unpin--> unpinned`. Pinning an already-pinned pair does
  nothing.
- A favorite whose currency is no longer in the currency list is hidden, not deleted.

## ConversionLogEntry (persisted)

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | `crypto.randomUUID()` |
| `timestamp` | epoch ms | When it was logged |
| `from`, `to` | CurrencyCode | |
| `sendAmount` | number | > 0 |
| `receivedAmount` | number | `sendAmount × rate`, rounded to 2 decimals at log time |
| `rate` | number | The rate used, frozen (FR-033) |

- The collection is newest first and capped at 100. Logging the 101st entry drops the oldest
  (FR-033).
- Clear all: `entries → []`, while `undoBuffer = previous entries` for 5 s. The timer pauses while
  Undo is hovered or focused. Undo restores `undoBuffer`, and when the timer ends the buffer is
  discarded (FR-036). The undo buffer is only in memory: closing the app finalizes the clear.
  `add()` or `remove()` while `canUndo` discards the `undoBuffer`.
- Relative time (FR-035): `<60 s → "now"`, `<60 min → "{m}m"`, `<24 h → "{h}h"`, else `"{d} {Mon}"`.

## Preferences (persisted)

| Field | Type | Default |
|-------|------|---------|
| `activeTab` | `'history' \| 'compare' \| 'favorites' \| 'log'` | `'history'` |
| `theme` | `'dark' \| 'light'` | `'dark'` |

## RatesCache (persisted, FR-051)

The last successful `RatesSnapshot` (without `stale`). It's written after every successful fetch
and read only when a fetch fails.

## Relationships

```text
Currency 1 ─── * CurrencyPair (from/to)
CurrencyPair 1 ─── 0..1 Favorite
CurrencyPair 1 ─── * ConversionLogEntry (snapshot, not a live link)
RatesSnapshot ──► derives rates for Converter, Ticker, Compare, Favorites
CurrencyPair + range ──► HistorySeries
```
