# Feature Specification: FX Checker Currency App

**Feature Branch**: `001-fx-checker-app` (spec directory; no branch hook configured, work is on `main`)

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "@my-sdd-docs/spec-draft.md" (FX Checker currency app: converter, currency
picker, live markets ticker, rate history, compare, favorites, conversion log, accessibility,
persistence, empty/error states, and the listed enhancement features)

## Clarifications

### Session 2026-09-24

- Q: Reference rates are published once per business day, so what should the "1D" chart range show? → A: 1D charts the last 5 published rates (the 5 most recent publication days). Its Open/Last/Change/% change compare the latest published rate with the previous one.
- Q: Should the currency picker list every currency the rate source returns, or only the currencies we have flag images for? → A (revised during planning, after the API was found to return 166 currencies against the design's 55): Only currencies that the source returns AND that have a bundled flag image (the design's set, about 55). The code placeholder remains only as a fallback.
- Q: When the user taps "Clear all" in the conversion log, should the log be deleted immediately, or should there be a safety step first? → A: Clear immediately, then offer "Undo" for 5 seconds to restore the log.
- Q: Should the conversion log have a maximum number of entries, with the oldest dropped automatically when it's full? → A: Keep the 100 most recent entries; the oldest is dropped automatically when a new one is logged.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Convert an amount between two currencies (Priority: P1)

A visitor opens the app, types an amount to send, picks the "send" and "receive" currencies from a
searchable picker, and immediately sees the converted amount and the exchange rate for the pair.
They can swap the two currencies with one action.

**Why this priority**: Converting money is the core purpose of the app. On its own it is a usable
product (MVP).

**Independent Test**: Load the app, change the amount and both currencies, press swap, and confirm
that the converted amount and rate line are correct against the published reference rate.

**Acceptance Scenarios**:

1. **Given** the app has just loaded, **When** the rates are available, **Then** the converter
   shows a default send amount of 1,000, send currency USD, receive currency EUR, the converted
   amount, and a rate line in the form `1 USD = 0.8530 EUR`.
2. **Given** the converter shows a pair, **When** the user types or edits the send amount,
   **Then** the received amount updates on every keystroke without the user submitting anything.
3. **Given** the user opens the send or receive currency picker, **When** they type part of a
   currency code or name (e.g., "yen" or "JP"), **Then** the list filters to the matching
   currencies, ignoring case.
4. **Given** the picker is open with no search text, **When** the user views it, **Then** currencies
   are grouped under "Popular" and "Other currencies", each group shows its count, each row shows
   flag, code, and name, and the currently selected currency is marked with a check.
5. **Given** the user selects a currency in the picker, **When** the selection is made, **Then** the
   picker closes, the button shows the new flag and code, and the conversion and rate update.
6. **Given** a pair such as USD→EUR, **When** the user activates the swap button, **Then** the pair
   becomes EUR→USD, the send amount is kept, and the received amount and rate are recalculated.
7. **Given** the receive currency is EUR, **When** the user picks EUR as the send currency, **Then**
   the two currencies swap instead of producing a same-currency pair.

---

### User Story 2 - Pin favorite pairs and reload them (Priority: P2)

A user who regularly checks certain pairs pins the active pair from the converter. The Favorites
tab lists the pinned pairs with their current rate and daily change. Selecting a row loads that pair
back into the converter, and the pairs are still there on the next visit.

**Why this priority**: Returning users get a lot of value from it, and the compare and ticker views
depend on the favorite model. It is testable without history or compare.

**Independent Test**: Pin two pairs, reload the browser, open Favorites, select a row, and unpin
the other one.

**Acceptance Scenarios**:

1. **Given** the active pair is not pinned, **When** the user activates the Favorite toggle, **Then**
   the toggle reads "Favorited", the pair appears in the Favorites tab, the Favorites badge count
   goes up by one, and a screen reader announces the change.
2. **Given** the active pair is pinned, **When** the user activates the toggle again, **Then** the
   pair is removed and the toggle reads "Favorite".
3. **Given** the Favorites tab lists pinned pairs, **When** the user views it, **Then** each row
   shows the pair (e.g., "USD → EUR"), its current rate, and its daily change percentage with an
   up/down indicator, and the header shows the count (e.g., "10 favorites").
4. **Given** a pinned pair row, **When** the user selects the row, **Then** that pair becomes the
   active pair in the converter.
5. **Given** a pinned pair row, **When** the user activates its filled star, **Then** the pair is
   unpinned and removed from the list.
6. **Given** nothing is pinned, **When** the user opens Favorites, **Then** they see "No pinned pairs
   yet" and the prompt to pin a pair instead of an empty list.
7. **Given** pairs were pinned, **When** the user closes and reopens the app, **Then** the same
   pairs are listed in the same order.

---

### User Story 3 - Log conversions and review the log (Priority: P2)

A user logs a conversion they care about. The Log tab shows every logged conversion with its
relative time, pair, and sent and received amounts. The user can delete one entry or clear the whole
log, and the log survives closing the browser.

**Why this priority**: This is a key feature from the design, and it is independent of rates history
and compare.

**Independent Test**: Log three conversions, delete one, reload the browser, confirm two remain,
then clear all and confirm the empty state.

**Acceptance Scenarios**:

1. **Given** a valid send amount, **When** the user activates "Log conversion", **Then** a new entry
   with the current time, pair, send amount, and received amount appears at the top of the log,
   the Log badge count goes up by one, and a screen reader announces the change.
2. **Given** logged entries, **When** the user views the Log tab, **Then** each entry shows its
   relative time ("now" for under a minute, then "20m", "1h", and a date such as "13 May" for
   entries older than 24 hours), and the header shows the count (e.g., "8 logged").
3. **Given** logged entries, **When** the user activates an entry's delete button, **Then** only
   that entry is removed.
4. **Given** logged entries, **When** the user activates "Clear all", **Then** every entry is
   removed, the empty state is shown, an "Undo" control appears for 5 seconds, and a screen reader
   announces that the log was cleared and can be undone.
5. **Given** the log was just cleared, **When** the user activates "Undo" within 5 seconds,
   **Then** every entry is restored in its original order and the count badge is restored.
6. **Given** no conversions have been logged, **When** the user opens the Log tab, **Then** they
   see "No conversions logged yet" and the explanation that conversions are recorded when they tap
   Log conversion and stay private to this browser.
7. **Given** the send amount is empty or zero, **When** the user views the converter, **Then** "Log
   conversion" is unavailable.

---

### User Story 4 - View the rate history of the active pair (Priority: P2)

A user wants to see how the active pair has moved. The History tab (the default tab) shows a line
and area chart of the pair's rate over a selectable range, with summary statistics.

**Why this priority**: It gives context to the conversion, but the converter works without it.

**Independent Test**: With a pair selected, switch through all six ranges and confirm the chart and
the open/last/change/% change values match the reference data for each range.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** no tab was previously remembered, **Then** the History tab is
   active and shows the chart for the active pair over the default range (1M).
2. **Given** the History tab, **When** the user selects 1D, 1W, 1M, 3M, 1Y, or 5Y, **Then** the
   chart redraws for that range and the selected range is visibly and programmatically marked.
3. **Given** a range is shown, **When** the user reads the summary, **Then** they see Open (first
   rate in range), Last (latest rate), Change (Last − Open, signed), and % change (signed, with
   ▲/▼). Positive values are shown in the "up" color and negative values in the "down" color.
   For 1D, Open is the previous published rate (see FR-020).
4. **Given** the chart, **When** the user reads it, **Then** it shows the pair label (e.g.,
   "USD/EUR"), the latest rate with its timestamp (e.g., "0.8530 · May 14 16:00 CET"), a high/mid/low
   value axis, and date labels along the time axis.
5. **Given** the active pair changes (picker, swap, or loading a favorite), **When** the History tab
   is visible, **Then** the chart and summary update to the new pair.
6. **Given** the history for the pair cannot be loaded, **When** the History tab is shown, **Then**
   the chart area shows "No chart data available" and "We couldn't load rate history for [pair]
   right now. This usually clears up in a minute." instead of a broken or empty chart.

---

### User Story 5 - Compare the send amount across many currencies (Priority: P3)

A user wants to know what their send amount is worth in several currencies at once. The Compare tab
lists the amount converted into a set of other currencies, each with its reference rate, and lets
them pin any row as a favorite pair.

**Why this priority**: It adds breadth to the converter's answer but is not essential.

**Independent Test**: Enter 1,000 USD, open Compare, check each row's converted amount against its
rate, pin one row, and confirm it appears in Favorites.

**Acceptance Scenarios**:

1. **Given** a send amount and currency, **When** the user opens Compare, **Then** a header shows the
   amount and base (e.g., "1,000 from USD") and the number of rows (e.g., "8 pairs"), and each row
   shows flag, code, name, converted amount, and reference rate (e.g., "@ 0.7366").
2. **Given** the Compare list, **When** the send amount or send currency changes, **Then** every row
   updates to match.
3. **Given** a Compare row, **When** the user activates its star, **Then** the pair (send currency →
   row currency) is pinned or unpinned, the star state reflects it, and a screen reader announces the
   change.
4. **Given** the send amount is empty, **When** the user opens Compare, **Then** they see "No
   comparison available" and the prompt to enter an amount in Send.
5. **Given** the send currency is one of the comparison currencies, **When** the list is shown,
   **Then** that currency is left out of the list.

---

### User Story 6 - Scan live markets at a glance (Priority: P3)

A user glances at a continuously scrolling ticker of currency pairs, each with its current rate and
daily change, to get a quick sense of the market.

**Why this priority**: It is ambient information and does not affect the core tasks.

**Independent Test**: Load the app, confirm the ticker scrolls, shows correct rates and up/down
changes, and pauses on hover and keyboard focus.

**Acceptance Scenarios**:

1. **Given** rates are available, **When** the page loads, **Then** the "Live markets" ticker
   scrolls continuously across the page, showing for each pair its rate and daily change with an up
   (▲) or down (▼) indicator and matching color.
2. **Given** the ticker is scrolling, **When** the user hovers over it or moves keyboard focus into
   it, **Then** it pauses, and it resumes when the pointer or focus leaves.
3. **Given** the user has asked their system to reduce motion, **When** the ticker renders, **Then**
   it does not auto-scroll and all pairs stay reachable.
4. **Given** the header, **When** the page loads, **Then** it shows the number of available
   currencies (e.g., "55 Currencies · EOD · ECB data").

---

### User Story 7 - Use the app comfortably on any device and with any input (Priority: P2)

Users on phones, tablets, and desktops, including keyboard-only and screen-reader users, can reach
and operate every feature. The layout adapts to the screen, and the app remembers the last tab they
had open.

**Why this priority**: Accessibility and responsiveness are explicit requirements and apply to every
other story.

**Independent Test**: Complete Stories 1–6 using only a keyboard at 375px, 768px, and 1440px widths,
and again with a screen reader, confirming that the layout matches the design and that changes are
announced.

**Acceptance Scenarios**:

1. **Given** a viewport from 320px wide up to large desktops, **When** the app is displayed,
   **Then** content fits without horizontal scrolling and follows the mobile, tablet, or desktop
   layout from the design.
2. **Given** a mobile-width viewport, **When** the user views the tabs, **Then** they appear as a
   dropdown selector instead of a tab row.
3. **Given** keyboard-only use, **When** the user tabs through the page, **Then** every interactive
   element (currency pickers, picker list, swap, favorite toggle, log button, tabs, range controls,
   stars, delete and clear buttons) can be reached and operated, and the focus indicator is clearly
   visible against the dark background.
4. **Given** the currency picker is open, **When** the user presses Escape or makes a selection,
   **Then** it closes and focus returns to the button that opened it. Arrow keys move through the
   list.
5. **Given** the tab set, **When** the user uses the arrow keys on a focused tab, **Then** focus moves
   between tabs, following the standard tab pattern.
6. **Given** the user switches to a tab and later reopens the app, **When** it loads, **Then** that
   tab is active.
7. **Given** any interactive element, **When** it is hovered or focused, **Then** it shows the hover
   or focus state from the design.

---

### User Story 8 - Keep working when rates are unavailable (Priority: P4)

If the rate service is unreachable, the user still sees the last rates that loaded successfully,
with a banner saying they are out of date.

**Why this priority**: This is a resilience enhancement from the "other features" list.

**Independent Test**: Load the app once online, go offline, reload, and confirm that cached rates
are shown with the out-of-date banner.

**Acceptance Scenarios**:

1. **Given** rates loaded successfully before, **When** the rate service can't be reached, **Then**
   the converter, ticker, compare, and favorites use the last successful rates and a banner says
   the rates are out of date, including their date.
2. **Given** no rates were ever loaded successfully, **When** the service can't be reached, **Then**
   a friendly message explains that rates are unavailable. Raw error text is never shown.
3. **Given** the banner is showing, **When** fresh rates load successfully, **Then** the banner
   disappears.

---

### User Story 9 - Personalize the theme and share a pair (Priority: P4)

A user switches between the dark-first design and a light theme, and can bookmark or share a link
that opens the app with a specific currency pair.

**Why this priority**: This is an enhancement from the "other features" list.

**Independent Test**: Toggle the theme and reload, then copy the URL after choosing GBP→JPY, open it
in a new tab, and confirm the pair loads.

**Acceptance Scenarios**:

1. **Given** the dark theme (default), **When** the user activates the theme switch, **Then** the
   whole interface changes to the light theme, and the choice is remembered on later visits.
2. **Given** the user changes the active pair, **When** the change happens, **Then** the page URL
   is updated to show the pair without adding a history entry for each change.
3. **Given** a URL that names a valid pair, **When** the app is opened with it, **Then** that pair
   is the active pair. **Given** a URL with an invalid or unknown currency, **Then** the app falls
   back to the default pair without showing an error.

---

### User Story 10 - Power-user tools (Priority: P4)

A power user works faster with keyboard shortcuts, exports their conversion log, and inspects exact
chart values with a hover crosshair.

**Why this priority**: These are enhancements from the "other features" list.

**Independent Test**: Use each shortcut, export a log with three entries and open the file in a
spreadsheet, and hover over the chart to read the date and rate.

**Acceptance Scenarios**:

1. **Given** focus is not in a text field, **When** the user presses the documented shortcuts,
   **Then** they can focus the currency search, swap currencies, and switch the chart range without
   a mouse, and the shortcuts are listed where users can find them.
2. **Given** focus is in a text field, **When** the user types characters that match shortcuts,
   **Then** the characters are typed normally and no shortcut runs.
3. **Given** the log has entries, **When** the user chooses to export, **Then** a CSV file downloads
   with one row per entry (date and time, from currency, to currency, send amount, received amount,
   rate) plus a header row. **Given** the log is empty, **Then** export is unavailable.
4. **Given** the history chart, **When** the user hovers over or moves the pointer across it,
   **Then** a crosshair follows the nearest data point and shows its exact date and rate.

---

### Edge Cases

- **Empty, zero, or invalid amount**: If the amount is empty, the received amount is blank, Compare
  shows its empty state, and "Log conversion" is unavailable. Characters that are not numbers are
  rejected. Negative values are not allowed. Decimals are accepted, and amounts are shown with
  thousands separators.
- **Very large amounts**: Amounts up to at least 999,999,999,999 convert and display without the
  layout overflowing.
- **Same currency on both sides**: Picking the currency that is already on the other side swaps
  the two (US1 scenario 7).
- **Search with no matches**: The picker shows a "no currencies found" message instead of an empty
  list.
- **Flag image fails to load**: The row shows a neutral placeholder with the currency code instead
  of a broken image.
- **Full log**: With 100 entries logged, logging another removes the oldest entry without any
  prompt, and the count stays at 100.
- **Duplicate favorites**: A pair can be pinned only once. Pairs have a direction (USD→EUR and
  EUR→USD are different favorites).
- **Stored data that is corrupt or unreadable**: The app starts with empty favorites and log
  instead of failing.
- **Browser storage unavailable** (for example, private mode): The app still works for the session.
  Favorites and log just won't persist.
- **History range with too few points**: If a range returns fewer than two data points, the chart
  error or empty state is shown.
- **Slow network**: Areas waiting for rates or history show a loading state instead of blank or
  stale values.
- **Days without a publication**: The source may or may not publish on weekends and holidays. The
  app always uses the most recent published rate and shows its date.

## Requirements *(mandatory)*

### Functional Requirements

**Converter**

- **FR-001**: The system MUST convert the send amount into the receive currency using the latest
  published reference rate and update the result on every change to the amount, either currency, or
  a swap.
- **FR-002**: The system MUST show the rate for the active pair as `1 {SEND} = {rate} {RECEIVE}`,
  formatted by the rate rule: 4 decimals below 10, 3 decimals from 10 to under 100, and 2 decimals
  at 100 and above (e.g., "0.8530", "94.910", "157.91"). The same rule applies to ticker, Compare,
  Favorites, and chart rates.
- **FR-003**: The system MUST default to a send amount of 1,000, USD as send currency, and EUR as
  receive currency when no other pair is given (by URL, see FR-046).
- **FR-004**: Users MUST be able to swap send and receive currencies with a single control.
- **FR-005**: Users MUST be able to pin or unpin the active pair from the converter with a toggle
  labeled "Favorite" when unpinned and "Favorited" when pinned.
- **FR-006**: Users MUST be able to log the current conversion with a "Log conversion" control. It is
  unavailable when the amount is empty or zero.
- **FR-007**: Amounts MUST use thousands separators, with 2 decimal places below 100,000 and no
  decimals at 100,000 and above (per the design's Compare rows, e.g., "736.65", "94,910.00",
  "157,910").

**Currency picker**

- **FR-008**: The picker MUST list the currencies that the rate source returns and that have a
  bundled flag image (the design's set of about 55), each with flag, code, and name. Currencies the
  source returns without a bundled flag are not listed. The header count (FR-013) is this same list.
- **FR-009**: With no search text, the picker MUST group currencies into "Popular" (USD, EUR, GBP,
  as in the design) and "Other currencies" (the rest, in alphabetical order by code), each with a count.
- **FR-010**: The picker MUST filter by code or name, ignoring case, as the user types.
- **FR-011**: The picker MUST mark the currently selected currency with a check.
- **FR-012**: The picker MUST open as a popover from either currency button and close on selection,
  on Escape, or on clicking outside, returning focus to the button that opened it.

**Live markets ticker**

- **FR-013**: The header MUST show the number of available currencies with the data source label
  ("Currencies · EOD · ECB data").
- **FR-014**: The ticker MUST show the currency pairs in the design, each with its latest rate and
  its change since the previous published rate, with direction indicator and color.
- **FR-015**: The ticker MUST scroll automatically, pause on hover and keyboard focus, and not
  auto-scroll when the user has asked to reduce motion.

**Tabs**

- **FR-016**: The system MUST provide History, Compare, Favorites, and Log tabs. Favorites and Log
  show a count badge.
- **FR-017**: On mobile-width viewports, the tabs MUST collapse into a dropdown selector.
- **FR-018**: The system MUST remember the last active tab across sessions. It defaults to History.

**Rate history**

- **FR-019**: The History tab MUST show a line and area chart of the active pair's rate over the
  selected range.
- **FR-020**: Users MUST be able to select 1D, 1W, 1M, 3M, 1Y, or 5Y. The default is 1M. Because
  rates are published once per publication day, 1D MUST chart the last 5 published rates, and its
  Open/Last/Change/% change MUST compare the latest published rate with the previous one. Every
  other range charts and summarizes all rates within it.
- **FR-021**: The system MUST show Open, Last, Change (signed), and % change (signed, with ▲/▼) for
  the selected range, colored by direction. Open, Last and Change use the rate precision rule from FR-002.
- **FR-022**: The chart MUST show the pair label, the latest rate with its publication date and the
  reference time "16:00 CET" (e.g., "0.8530 · May 14 16:00 CET"), high/mid/low value axis labels,
  and date labels on the time axis. The time is a fixed label because the source provides dates
  only.
- **FR-023**: If history cannot be loaded or has fewer than two points, the system MUST show the
  "No chart data available" message with the pair name instead of the chart.

**Compare**

- **FR-024**: The Compare tab MUST convert the send amount into the design's set of comparison
  currencies, leaving out the send currency, and show flag, code, name, converted amount, and
  reference rate ("@ {rate}") per row.
- **FR-025**: The Compare header MUST show the amount and base currency and the number of rows.
- **FR-026**: Users MUST be able to pin or unpin each Compare row as the pair send currency → row
  currency.
- **FR-027**: When the send amount is empty, Compare MUST show "No comparison available" and the
  prompt to enter an amount.

**Favorites**

- **FR-028**: The Favorites tab MUST list pinned pairs in the order they were pinned (most recent
  first), each with pair, latest rate, and daily change %, and a header count ("N favorites").
- **FR-029**: Selecting a favorite row MUST make that pair the active converter pair.
- **FR-030**: Users MUST be able to unpin a favorite from its row.
- **FR-031**: When no pairs are pinned, Favorites MUST show "No pinned pairs yet" and the prompt to
  pin a pair.
- **FR-032**: A pair (with direction) MUST NOT be pinned more than once.

**Conversion log**

- **FR-033**: Each log entry MUST record the date and time, pair, send amount, received amount, and
  rate used at the moment it was logged. Later rate changes do not change the entry. The log MUST
  keep at most the 100 most recent entries; logging a 101st entry automatically removes the oldest.
- **FR-034**: The log MUST list entries newest first, each with relative time, pair, send amount,
  received amount, and a delete control, plus a header count ("N logged").
- **FR-035**: Relative time MUST display as "now" (under 1 minute), "{n}m" (under 1 hour), "{n}h"
  (under 24 hours), and "{day} {month}" (e.g., "13 May") after that.
- **FR-036**: Users MUST be able to delete a single entry and to clear all entries. Clearing takes
  effect immediately and MUST be followed by an "Undo" control shown for 5 seconds that restores
  the whole log. The 5-second countdown MUST pause while the Undo control is hovered or focused.
  Once the window ends (or the app is closed), the clear is final. Logging a new conversion or
  deleting an entry while Undo is available ends the Undo window immediately, and the clear becomes
  final.
- **FR-037**: When the log is empty, the Log tab MUST show "No conversions logged yet" and the
  explanation text from the design.

**Persistence**

- **FR-038**: Favorites, the conversion log, the last active tab, and the theme choice MUST persist
  in the user's browser across sessions without an account.
- **FR-039**: If stored data is missing, corrupt, or storage is unavailable, the app MUST start with
  defaults and keep working.

**Accessibility and responsiveness**

- **FR-040**: Every interactive element MUST be operable by keyboard, and focus order MUST follow
  the visual order.
- **FR-041**: Every interactive element MUST have visible hover and focus styles as in the design.
  Focus indicators MUST meet WCAG 2.2 AA contrast against the dark and light backgrounds.
- **FR-042**: Tabs, the currency list, the conversion list, and the picker popover MUST use the
  appropriate semantic structures and roles. The page MUST have exactly one main region and exactly
  one top-level heading, and no two links may share identical text with different destinations.
- **FR-043**: Changes to the converted amount, pinning or unpinning, logging, deleting, and clearing
  MUST be announced to screen readers without moving focus.
- **FR-044**: The layout MUST follow the design at mobile (375px), tablet, and desktop (1440px)
  sizes and stay usable without horizontal scrolling from 320px up.
- **FR-045**: Text labels that appear uppercase in the design MUST be written in normal case and
  styled uppercase, so screen readers read them naturally. Acronyms and currency codes stay as they
  are.

**Enhancements (other features)**

- **FR-046**: The active pair MUST be reflected in the page URL, and opening a URL with a valid pair
  MUST load that pair. Invalid pairs fall back to the default silently.
- **FR-047**: Users MUST be able to switch between the dark theme (default) and a light theme.
- **FR-048**: The system MUST provide keyboard shortcuts to focus the currency search, swap
  currencies, and change the chart range. Shortcuts MUST NOT fire while typing in a text field, and
  MUST be discoverable in the interface.
- **FR-049**: Users MUST be able to export the conversion log as a CSV file with a header row and
  one row per entry (date-time, from, to, send amount, received amount, rate).
- **FR-050**: The history chart MUST show a hover crosshair with the exact date and rate of the
  nearest data point.
- **FR-051**: The system MUST keep the last successful rates and, when fresh rates can't be loaded,
  use them and show an out-of-date banner with their date.

**Error handling**

- **FR-052**: Technical errors MUST NEVER be shown raw to users. Every failure MUST be shown as a
  friendly message.
- **FR-053**: Areas waiting for data MUST show a loading state.

### Key Entities

- **Currency**: A currency the rate source supports. It has a code (e.g., USD), a name (e.g., "US
  Dollar"), a flag image, and whether it belongs to the "Popular" group.
- **Exchange Rate**: The reference rate between a base currency and a target currency on a published
  date. It also includes the previous published rate, used for the daily change.
- **Currency Pair**: A directional combination of send (base) and receive (target) currency. The
  active pair drives the converter, history, and URL.
- **Rate History Series**: The ordered (date, rate) points for a pair over a selected range (1D–5Y),
  with the derived Open, Last, Change, % change, high, and low.
- **Favorite**: A pinned currency pair with the time it was pinned. It is unique by direction.
- **Conversion Log Entry**: A snapshot of a logged conversion: id, timestamp, send currency, receive
  currency, send amount, received amount, and rate used. At most 100 are kept, newest first.
- **User Preferences**: Last active tab, theme choice, and the cached last successful rates with
  their date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The received amount updates within 100 ms of each keystroke, so it feels instant.
- **SC-002**: On a typical broadband connection, the converter shows a real converted amount within
  3 seconds of opening the app.
- **SC-003**: A first-time user can change the pair, enter an amount, and log the conversion in
  under 30 seconds without instructions.
- **SC-004**: 100% of interactive elements can be reached and operated with the keyboard alone.
- **SC-005**: An automated accessibility audit reports zero critical or serious violations.
- **SC-006**: At widths from 320px to 1920px, no view scrolls horizontally, and at 375px and 1440px
  the layout visually matches the design.
- **SC-007**: 100% of favorites and log entries are still there after closing and reopening the
  browser.
- **SC-008**: In every failure scenario tested (network down, history unavailable, corrupt storage),
  users see a friendly message or a working fallback and never raw error text.
- **SC-009**: Converted amounts match the published reference rate × amount at the precision
  defined in FR-007.

## Assumptions

- **Rate source**: Rates, the currency list, and history come from the Frankfurter service, as the
  spec draft recommends. Its default rates combine reference rates from several central banks,
  including the ECB. The ECB-only feed has 30 currencies and doesn't cover the design's set (e.g.,
  BDT). This is the only data source (Constitution Principle III). It needs no account or key. The
  header label "EOD · ECB data" is kept as the design's static copy.
- **"Live" means latest published**: The source publishes end-of-day reference rates once per
  publication day, so "live" means the most recent publication. There is no intraday refresh, and rates load
  when the app opens.
- **Daily change**: The "24-hour change" in the ticker and Favorites is the change between the
  latest published rate and the previous one.
- **1D range**: With end-of-day data, 1D charts the last 5 published rates, and its stats compare
  the latest two (FR-020). If fewer than two points are available, the empty/error state applies
  (FR-023).
- **UI not in the design**: The light theme, theme toggle, keyboard-shortcuts help, out-of-date
  banner, and Undo bar have no Figma frames. They are built only from the design system's existing
  variables and component styles. The light theme reuses the same scale, reversed. Their icons are
  simple inline SVGs drawn in the icon set's stroke style. No new fonts, accent colors, or
  third-party icons are added.
- **Design sets**: These are fixed sets from the Figma design, not chosen by the user:
  - Popular: USD, EUR, GBP
  - Ticker (7 pairs): EUR/USD, USD/JPY, GBP/USD, USD/CHF, EUR/GBP, AUD/USD, USD/CAD
  - Compare (8 rows): GBP, JPY, CHF, CAD, AUD, INR, CNY, BDT
- **Log trigger**: Conversions are logged only when the user activates "Log conversion", not on every
  keystroke. The log is capped at the 100 most recent entries (FR-033).
- **Clear all**: Clearing the log happens immediately with no confirmation dialog, and a 5-second
  Undo is the safety net (FR-036). Deleting a single entry has no undo.
- **Single user, single browser**: There are no accounts, sign-in, or sync across devices. The
  full-stack accounts idea from the original challenge is out of scope.
- **Design source**: The Figma file (design system node 100-53; desktop, tablet, and mobile screens
  node 54-2) is authoritative for visual details (Constitution Principle II). The static copy in
  the starter page is authoritative for text.
- **Not covered by this spec**: The draft's architecture, tooling, testing approach, documentation
  and README, screenshots, deployment, and post-implementation steps (Frontend Mentor submission,
  portfolio update, report fixes) are delivery concerns. They are carried into `/speckit-plan` and
  `/speckit-tasks` and are not user-facing requirements here.
