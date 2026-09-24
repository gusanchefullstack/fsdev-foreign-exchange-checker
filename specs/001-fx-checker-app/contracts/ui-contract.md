# Contract: User-facing interface (URL, keyboard, CSV, announcements)

## URL (FR-046)

- Format: `/?from=USD&to=EUR`. It's updated with `history.replaceState` on every pair change, so no
  history entries are added.
- On load, a pair is valid when both codes are in the currency list and `from ≠ to`. Otherwise the
  default USD→EUR is used silently.
- The amount and tab are not in the URL.

## Keyboard shortcuts (FR-048)

These are active only when focus is not in an `input`, `textarea`, `select`, or contenteditable
element, and no modifier key (Ctrl, Meta, Alt) is held.

| Key | Action |
|-----|--------|
| `/` | Open the Send currency picker and focus its search |
| `s` | Swap currencies |
| `1`–`6` | Select chart range 1D, 1W, 1M, 3M, 1Y, 5Y (switches to History) |
| `?` | Show or hide the shortcuts help panel |

Discoverability: a "Keyboard shortcuts" button in the header opens the same help panel.

Component keyboard behavior:
- Tabs: ←/→, Home, and End move focus. Enter/Space activates.
- Range: a radio-group style control. ←/→ moves and selects.
- Picker: typing filters. ↑/↓ moves the active option. Enter selects. Escape closes and focus
  returns to the trigger.

## CSV export (FR-049)

- Filename: `fx-conversion-log-YYYY-MM-DD.csv`, UTF-8, `\r\n` line endings.
- Header: `datetime,from,to,send_amount,received_amount,rate`
- Rows: newest first. `datetime` is ISO 8601 local with offset. Amounts are plain decimals with no
  grouping (2 dp). The rate has 6 dp.
- Export is disabled when the log is empty.

## Live-region announcements (FR-043)

One polite region, with copy:

| Event | Message |
|-------|---------|
| Amount/pair change (debounced 500 ms) | "1,000 USD equals 853.02 EUR" |
| Pin / unpin | "USD to EUR added to favorites" / "…removed from favorites" |
| Log | "Conversion logged: 1,000 USD to 853.02 EUR" |
| Delete entry | "Log entry deleted" |
| Clear all | "Conversion log cleared. Undo available for 5 seconds" |
| Undo | "Conversion log restored" |
| Stale rates | "Showing saved rates from {date}. Live rates are unavailable" |
