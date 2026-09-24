# Implementation Plan: FX Checker Currency App

**Branch**: `001-fx-checker-app` (spec directory; work happens on `main`) | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-fx-checker-app/spec.md`

## Summary

Build the Frontend Mentor "FX Checker" as a single-page, frontend-only React + TypeScript app
(Vite). It converts currencies with the Frankfurter v2 API and has these pieces:

- A searchable currency picker
- A live-markets ticker
- A hand-drawn SVG rate-history chart
- Multi-currency Compare
- Favorites and a conversion log stored in the browser

One request on load for USD-based latest rates (with the previous publication) feeds every live
view through cross rates. History is fetched for each pair and range. The visuals follow the Figma
design tokens exactly, with CSS Modules. Accessibility follows WAI-ARIA patterns (tabs, a
listbox-based picker, a live region) to meet the spec's keyboard and screen-reader requirements.

## Technical Context

**Language/Version**: TypeScript 6 (strict), targeting ES2022 browsers

**Primary Dependencies**: React 19.3, Vite 8 (+ `@vitejs/plugin-react`). There's no chart, state,
or UI library (research R7, R8).

**Storage**: Browser `localStorage` (`fx:v1:*` keys, see [contracts/storage.md](./contracts/storage.md)).
No backend or database.

**Testing**: Vitest 5 + @testing-library/react + @testing-library/user-event + jsdom + vitest-axe.
The Frankfurter service is mocked at the `fetch` boundary.

**Target Platform**: Evergreen browsers (latest Chrome, Firefox, Safari, Edge), mobile and
desktop. Deployed as a static site on Vercel.

**Project Type**: Single frontend web application (SPA)

**Performance Goals**: The received amount updates in under 100 ms per keystroke (SC-001). The
first converted amount shows in 3 s or less on broadband (SC-002). The JS bundle is under 100 KB
gzipped.

**Constraints**: Works from 320px up with no horizontal scroll. WCAG 2.2 AA. There's no API key,
only the public Frankfurter API. If the network fails, it falls back to cached rates. The log is
capped at 100 entries.

**Scale/Scope**: 1 screen with 4 tabs. About 57 currencies, 7 ticker pairs, and 8 Compare rows.
Single user per browser.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle / Section | Gate | Pre-research | Post-design |
|---|---------------------|------|--------------|-------------|
| I | Spec-Driven (Zero Shadow Code) | Every planned module maps to spec FRs; no extra features | ✅ | ✅ Keyboard shortcut `?` and the help panel satisfy FR-048 "discoverable". The CSV and URL formats are the minimum needed for FR-046/049 |
| I | Stop on conflict | Conflicts are raised before code | ✅ | ✅ The API/design currency-count conflict was found and resolved with the user. Spec Q2 was revised and FR-008 updated |
| II | Figma source of truth | Tokens, sets, and layouts come from Figma through the MCP | ✅ | ✅ Tokens (R11) and design facts (R12) were extracted from Figma variables and frames |
| III | Specified data sources only | Only Frankfurter (named in the spec) | ✅ | ✅ One service module. The endpoints were updated to the live v2 shape (R1), which is the same service |
| IV | Friendly errors | No raw errors in the UI | ✅ | ✅ `RatesError` codes are mapped to design copy (contracts/frankfurter-api.md) |
| V | Simplicity & conventions | Flat structure, function components, camelCase/PascalCase | ✅ | ✅ No state or chart library. Hooks plus pure utils |
| Stack | React + TS + CSS Modules + tokens file; separate repos | ✅ | ✅ `src/styles/tokens.css`. Single frontend repo (no backend needed) |
| Repo | `fsdev-` prefix, repo created first, design files ignored | ✅ | ✅ `fsdev-foreign-exchange-checker`. `.gitignore` already excludes `*.fig` |

**Result**: PASS. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-fx-checker-app/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── frankfurter-api.md
│   ├── storage.md
│   └── ui-contract.md
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
index.html                     # Vite entry (starter copy becomes the React app mount + meta)
public/
└── assets/                    # the existing /assets moved here so Vite serves the flags, icons, and font as-is
src/
├── main.tsx                   # React root, global CSS imports
├── App.tsx                    # Layout shell: header, ticker, converter, tabs; owns top-level state
├── App.module.css
├── styles/
│   ├── tokens.css             # Figma variables: colors, spacing, radius, type presets; light theme
│   ├── fonts.css              # @font-face JetBrains Mono (self-hosted variable font)
│   └── global.css             # reset, body, focus-visible ring, .visually-hidden
├── types/                     # Currency, CurrencyPair, RatesSnapshot, HistorySeries, Favorite, LogEntry…
├── data/
│   └── currencyCatalog.ts     # code → iso2 flag + design name; POPULAR, TICKER_PAIRS, COMPARE_CODES
├── services/
│   └── frankfurter.ts         # fetchCurrencies, fetchLatestSnapshot, fetchHistory → typed results / RatesError
├── hooks/
│   ├── useRates.ts            # currencies + snapshot + cache fallback (FR-051)
│   ├── useHistory.ts          # pair+range series with in-memory cache
│   ├── usePersistentState.ts  # safe localStorage wrapper (FR-039)
│   ├── useFavorites.ts
│   ├── useConversionLog.ts    # cap 100, clear + undo timer
│   ├── useUrlPair.ts          # FR-046
│   ├── useTheme.ts            # FR-047
│   └── useShortcuts.ts        # FR-048
├── utils/
│   ├── rates.ts               # cross rate, change %, history stats
│   ├── format.ts              # amount/rate/percent formatting, amount parsing
│   ├── relativeTime.ts        # FR-035
│   └── csv.ts                 # FR-049
└── components/
    ├── Header/                # logo, currency count, theme toggle, shortcuts button
    ├── LiveTicker/
    ├── Converter/             # AmountField, swap, rate line, Favorite + Log buttons
    ├── CurrencyPicker/        # popover, search, grouped listbox
    ├── Flag/                  # image with code placeholder fallback
    ├── Tabs/                  # tablist ↔ mobile select
    ├── HistoryPanel/          # StatCards, RangeSelector, RateChart (SVG + crosshair)
    ├── ComparePanel/
    ├── FavoritesPanel/
    ├── LogPanel/              # list, delete, clear + undo, CSV export
    ├── EmptyState/
    ├── StaleBanner/
    ├── ShortcutsHelp/
    └── LiveAnnouncer/         # aria-live context + provider
# Each component folder: Component.tsx, Component.module.css, Component.test.tsx

tests/
└── setup.ts                   # jsdom, vitest-axe matchers, fetch mock helpers
```

**Structure Decision**: A single Vite React project at the repo root, as the spec draft asks
(`index.html` at the root, all source under `src/`, components in `src/components/`). Unit tests
sit next to the code they test. `tests/` holds only the shared setup. The existing `/assets`
folder moves to `public/assets/` so the static asset paths (`/assets/images/flags/us.webp`) keep
working unchanged in dev and build.

## Phase Outputs

- **Phase 0**: [research.md](./research.md). All unknowns are resolved (API shape, provider scope,
  currency set, fetching strategy, ranges, stack, chart, state, persistence, a11y, tokens, design
  facts).
- **Phase 1**: [data-model.md](./data-model.md), [contracts/](./contracts/), and
  [quickstart.md](./quickstart.md).
- **Delivery items carried from the spec draft into tasks** (not user-facing requirements):
  - Create the GitHub repo `fsdev-foreign-exchange-checker` first (constitution).
  - Write the README from `README-template.md` with the author badge row and screenshots at 375px
    (40% width) and 1440px in `/screenshots`.
  - Deploy to Vercel.
  - Frontend Mentor submission, portfolio update, and report fixes. Each of these needs the user's
    confirmation first.

## Complexity Tracking

No constitution violations, so nothing to justify.
