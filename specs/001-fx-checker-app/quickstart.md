# Quickstart & Validation Guide: FX Checker

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node 26+ and npm 12+
- Network access to `https://api.frankfurter.dev`
- The Figma desktop app with the design file open (only for visual comparison)

## Setup & run

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # type-check + production build to dist/
npm run preview      # serve the production build
npm run lint         # ESLint
npm test             # Vitest (run once)
npx vitest run src/utils/rates.test.ts        # single test file
npx vitest run -t "swaps when same currency"  # single test by name
```

## Validation scenarios

Each scenario maps to a spec user story. Run them at **375px, 768px, and 1440px**, then repeat
the keyboard-only run with a screen reader (VoiceOver).

| # | Story | Steps | Expected |
|---|-------|-------|----------|
| V1 | US1 | Load the app | 1,000 USD → EUR, rate line `1 USD = x.xxxx EUR`, header shows the currency count |
| V2 | US1 | Type `2500.5`, open the Send picker, search "yen", pick JPY, then press swap | The result updates on each keystroke, the search filters, and after the swap the pair is JPY→USD |
| V3 | US1 | In the Receive picker choose USD while Send = USD | The pair swaps (no same-currency pair) |
| V4 | US2 | Favorite USD→EUR, pin GBP from Compare, reload, open Favorites, select a row, unpin the other | Both persist, the row loads the pair, unpin removes it, and the empty state shows when none are left |
| V5 | US3 | Log 3 conversions, delete 1, reload, Clear all, then Undo within 5s; Clear all again and wait | 2 remain after reload, Undo restores both, and after 5s the empty state stays |
| V6 | US4 | Cycle 1D→5Y | The chart and stats update. 1D shows 5 points and its stats compare the last two |
| V7 | US4 | Block `api.frankfurter.dev/v2/rates?*quotes=*` history requests in DevTools | "No chart data available" message with the pair |
| V8 | US5 | Clear the Send amount, open Compare | "No comparison available" prompt |
| V9 | US6 | Hover the ticker, tab into it, enable reduced motion | It pauses on hover and focus, and doesn't animate with reduced motion |
| V10 | US7 | Keyboard only: Tab through everything, arrow keys through tabs and the picker, Escape the picker | Everything is reachable, focus is visible, focus returns to the trigger |
| V11 | US8 | Load once, go offline in DevTools, reload | Cached rates plus the out-of-date banner with the date |
| V12 | US9 | Toggle the theme and reload. Open `/?from=GBP&to=JPY`, then `/?from=XXX&to=EUR` | The theme persists, GBP→JPY loads, and the invalid URL falls back to USD→EUR |
| V13 | US10 | Press `/`, `s`, `1`–`6`, `?`. Export the CSV. Hover the chart | Shortcuts work (not while typing), the CSV matches [ui-contract](./contracts/ui-contract.md), and the crosshair shows date and rate |

## Quality gates

- `npm test`, `npm run lint`, and `npm run build` pass with no errors.
- The Lighthouse accessibility audit (Chrome DevTools) scores 100, and the vitest-axe checks
  report no violations (SC-005).
- No horizontal scroll from 320px to 1920px (SC-006).
- A visual comparison against the Figma frames at 375 and 1440 (Principle II).
