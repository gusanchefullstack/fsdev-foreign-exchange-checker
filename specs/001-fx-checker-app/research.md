# Phase 0 Research: FX Checker Currency App

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-09-24

All findings were checked against the live API and the Figma file on 2026-09-24.

## R1. Rate API endpoints (Frankfurter v2)

- **Decision**: Use the current Frankfurter v2 endpoints at `https://api.frankfurter.dev`:
  `GET /v2/currencies`, `GET /v2/rates?base=&quotes=&from=&to=&group=`, and
  `GET /v2/rate/{base}/{quote}`. See [contracts/frankfurter-api.md](./contracts/frankfurter-api.md).
- **Rationale**: The endpoints listed in the challenge README (`/v2/latest`,
  `/v2/{start}..{end}`) now return `404 {"status":404,"message":"not found"}`. The live API returns
  flat arrays of `{date, base, quote, rate}` and is CORS-enabled
  (`access-control-allow-origin: *`). Responses are cacheable (`cache-control: public, max-age≈7h`).
  Invalid codes return `422 {"message":"invalid currency: XXX"}`.
- **Alternatives considered**: The v1 API (`/v1/latest`) is ECB-only and has 30 currencies, which
  doesn't cover the design's set. Another provider would need a spec amendment (Constitution III).

## R2. Data provider scope (blended vs ECB-only)

- **Decision**: Use Frankfurter's default blended rates (no `providers` filter).
- **Rationale**: `providers=ecb` returns only 30 quote currencies, missing design currencies such
  as BDT, AED, and INR pairs from other banks. The blended default covers all the design's
  currencies. The header copy "EOD · ECB data" is kept as static design text (spec Assumptions).
- **Alternatives considered**: ECB-only, rejected because it can't render the Compare list from
  the design.

## R3. Currency list (which currencies appear)

- **Decision**: Keep a bundled currency catalog (code → flag file and display name) built from the
  60 files in `assets/images/flags/`. At runtime, show the intersection of the catalog and
  `/v2/currencies`. The header count is the size of that intersection.
- **Rationale**: This is spec clarification Q2 as revised. `/v2/currencies` returns 166 codes. The
  flag set maps to 57 live codes: `bg`/BGN, `cy`/CYP, and `hr`/HRK are no longer returned, and `hm`
  duplicates AUD. The design shows 55, so the count stays within a couple of the design value and
  follows the live API. Display names follow the design where it differs from the API (e.g.,
  "US Dollar", "UAE Dirham", "Chinese Yuan"). Otherwise the API name is used.
- **Alternatives considered**: Hard-coding exactly 55 codes breaks when the API drops a currency.
  Using all 166 was rejected by the user.

## R4. Getting latest rates, daily change, and cross rates in one request

- **Decision**: On load, make one request:
  `GET /v2/rates?base=USD&quotes={catalog codes}&from={today−10 days}`. For each quote, take the
  last two dates as *latest* and *previous*. Compute any pair A→B as cross rate `r(B)/r(A)` with
  `r(USD)=1`.
- **Rationale**: This one request feeds the converter, ticker (mixed bases such as EUR/GBP and
  AUD/USD), Compare, and Favorites, including the daily change, for about 57 × ~8 rows (about 30 KB).
  A 10-day window always contains at least two publications, even across long holidays. Cross
  rates through USD match what the API returns for a direct pair to ~5 significant digits, which is
  enough for 4-decimal display (FR-002).
- **Alternatives considered**: One request per pair (N+1 requests, slow). `/v2/rate/{b}/{q}` for
  each ticker pair (7 extra requests, no previous day).

## R5. Rate history ranges

- **Decision**: `GET /v2/rates?base={send}&quotes={receive}&from={start}` where:

  | Range | from | group | Chart points | Stats |
  |-------|------|-------|--------------|-------|
  | 1D | today − 10d | – | last 5 published | latest vs previous (spec FR-020) |
  | 1W | today − 7d | – | all | first vs last |
  | 1M | today − 1 month | – | all | first vs last |
  | 3M | today − 3 months | – | all | first vs last |
  | 1Y | today − 1 year | `week` | ~52 | first vs last |
  | 5Y | today − 5 years | `month` | ~61 | first vs last |

  The history is fetched directly for the pair (not as a cross rate) so it's exact. Results are
  cached in memory per `pair+range` for the session.
- **Rationale**: Grouping keeps long ranges to a readable number of points. The Figma 1M chart
  shows a dense daily line. The API publishes blended data on weekends too, so 1W and 1M have a
  point for every day.
- **Alternatives considered**: Daily 5Y data (~1,800 points, needless payload).

## R6. Frontend stack and versions

- **Decision**: React 19.3 + TypeScript 6 (strict) + Vite 8, with CSS Modules and a
  `src/styles/tokens.css` custom-properties file. Tests use Vitest 5 + Testing Library + jsdom,
  with `vitest-axe` for accessibility assertions. Node 26 / npm 12 (local).
- **Rationale**: This follows the constitution's stack (React, TypeScript, CSS Modules, tokens in a
  separate file) and the spec draft (Vite, Vitest). These are the latest stable versions from the
  npm registry on 2026-09-24.
- **Alternatives considered**: Next.js adds SSR and routing the app doesn't need (Principle V).

## R7. Chart implementation

- **Decision**: A hand-written SVG line+area chart component. It uses linear scales, a gradient
  fill, 3 Y labels (high/mid/low), about 5 X date labels, and a pointer crosshair for the nearest
  point (FR-050).
- **Rationale**: The design is a single simple series with custom styling. A small SVG component
  (~150 lines) gives pixel control and full accessibility (the chart has a text summary via
  `role="img"` + `aria-label`, with the stats as the accessible data) without adding a dependency
  (Principle V).
- **Alternatives considered**: Recharts or Chart.js (heavy, harder to match the design, the canvas
  is inaccessible).

## R8. State management

- **Decision**: React state in `App` plus a few custom hooks: `useRates`, `useHistory`,
  `useFavorites`, `useConversionLog`, `usePersistentState`, `useUrlPair`, and `useTheme`. There is
  no global store library. The live-region announcer is a tiny context.
- **Rationale**: The app has one screen with shallow state. Hooks keep each concern testable
  (Principle V).
- **Alternatives considered**: Redux/Zustand, which is not needed at this scale.

## R9. Persistence

- **Decision**: `localStorage` with versioned keys (`fx:v1:*`). Every read goes through a
  try/catch plus shape validation, and falls back to defaults (FR-039). See
  [contracts/storage.md](./contracts/storage.md).
- **Rationale**: This is the spec's persistence requirement, with no accounts. A version prefix lets
  the schema change later.

## R10. Accessibility patterns

- **Decision**:
  - Tabs: WAI-ARIA Tabs with manual activation and arrow/Home/End keys. On mobile they collapse to
    a native `<select>` labeled "View" (FR-017).
  - Currency picker: a button with `aria-haspopup="listbox"` + `aria-expanded` that opens a popover
    with a search `input` (combobox with `aria-activedescendant`) and a grouped `listbox`
    (`role="group"` per section). Escape closes it, and focus returns to the trigger (FR-012).
  - Ticker: a `<ul>` of pairs, duplicated visually for a seamless loop, with the copy
    `aria-hidden`. CSS animation pauses on `:hover` / `:focus-within`, and `prefers-reduced-motion`
    stops it.
  - Announcements: a single polite `aria-live` region. Converted-amount updates are debounced
    (~500 ms) so screen readers aren't flooded.
  - Focus ring: 2px lime (`--color-lime-500`) outline plus a 2px offset, which is at least 3:1
    against both themes.
- **Rationale**: This meets spec FR-040 to FR-045 and Frontend Mentor's report checks.

## R11. Design tokens (from Figma variables)

- **Decision**: Put the Figma variables in `src/styles/tokens.css`:
  - Colors: lime 500 `#cef739`, lime 800 `#283300`, green 500 `#42eb05`, red 500 `#ff4141`, and
    neutral 50/100/200/400/500/600/700/900 = `#fff/#c6c6c6/#9d9d9d/#3d3d3d/#2e2e2e/#202022/#171719/#0a0a0a`.
  - Spacing: 025–600 = 2, 6, 8, 10, 12, 16, 20, 24, 32, 48 px.
  - Radius: 8, 16, 20, 999.
  - Type: JetBrains Mono presets 1–6 (40/20/16/14/12/10px).
  - The light theme (FR-047) redefines the neutral and semantic color tokens under
    `[data-theme="light"]`.
- **Rationale**: This is the constitution's tokens-in-a-separate-file rule, and the values come
  straight from Figma (Principle II).

## R12. Design facts extracted

- Default state: 1,000 USD → EUR, History tab, 1M range selected.
- Popular: USD, EUR, GBP.
- Ticker (7): EUR/USD, USD/JPY, GBP/USD, USD/CHF, EUR/GBP, AUD/USD, USD/CAD. EUR/USD is the first item,
  confirmed through Figma (node 75:408: "EUR/USD 1.1723 ▼ −0.14%").
- Compare (8): GBP, JPY, CHF, CAD, AUD, INR, CNY, BDT.
- Breakpoints: mobile 375 (mobile header, tabs become a dropdown), tablet 768, desktop 1440
  (1100px content column).
- Font: JetBrains Mono variable, self-hosted from `assets/fonts/`.

## R14. Build-time rate bundle (FR-054, amendment)

- **Decision**: A `prebuild` npm script (`scripts/fetch-rates.mjs`) calls the same endpoints as the
  app: `/v2/currencies`, the 10-day USD snapshot, and USD→EUR 1M history. It writes
  `src/data/bootstrap.json`, which is committed so that dev and offline builds work.
  - `useRates` starts in `ready` from this bundle, with `stale` = publication older than 4 days, and
    swaps in the live snapshot.
  - `useHistory` seeds its cache with the bundled series marked provisional. It renders it
    immediately but still fetches, and replaces it with the live series.
- **Rationale**: Frontend Mentor's screenshot bot captured "Loading live rates…". Bundling makes the
  first paint complete without waiting on the network, and adds about 6 KB to the bundle.
- **Alternatives considered**:
  - Preconnect hints only: still races the bot.
  - Server-side rendering: a new runtime, which conflicts with Principle V.
  - Asking Frontend Mentor to recapture: doesn't fix the loading flash for real users.

## R13. Repository and deployment (deferred intents from the constitution)

- **Decision**: A single frontend repo named `fsdev-foreign-exchange-checker`. No backend repo,
  since the spec has no server needs. Deploy with Vercel (static Vite build).
- **Rationale**: Constitution "Versioning & Repository Policy". The backend and database clauses
  only apply "if required by the spec", and they aren't.
