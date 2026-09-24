# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FX Checker**, the Frontend Mentor challenge: a currency converter with live rates, a rate-history chart, multi-currency compare, favorites, and a conversion log. It's a frontend-only React + TypeScript + Vite single-page app. There's no backend; rates come from a public API and user data lives in `localStorage`. GitHub: `gusanchefullstack/fsdev-foreign-exchange-checker`.

## Commands

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # tsc -b + production build to dist/
npm run preview      # serve dist/
npm run lint         # ESLint (typescript-eslint, react-hooks, jsx-a11y)
npm test             # Vitest, run once (jsdom)
npx vitest run src/utils/format.test.ts   # single file
npx vitest run -t "swaps currencies"      # single test by name
```

## Spec-driven workflow (Spec Kit)

The feature is specified in `specs/001-fx-checker-app/`: `spec.md` (FR-/SC- ids), `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`, and `checklists/validation.md`. The constitution is `.specify/memory/constitution.md`.

- **Build only what `spec.md` documents** ("zero shadow code", Constitution I). If a request contradicts the spec or constitution, stop and ask for the spec to be updated before changing code.
- UI that isn't in Figma (light theme, theme toggle, shortcuts help, stale banner, undo bar) follows the spec Assumption "UI not in the design": only existing tokens and styles are used.

## Architecture

- `src/App.tsx`: `FxChecker` owns the top-level state: the active pair, amount text, tab (persisted), range, and help panel. It wires the hooks into the components. The pair starts as `null` meaning "take it from the URL or the default", so no effect is needed.
- `src/services/frankfurter.ts`: the **only** module that calls `fetch`. It maps every failure to `RatesError` codes; the UI shows friendly copy and never raw errors (Constitution IV).
- **Rates**: `useRates` makes one request on load: `/v2/rates?base=USD&quotes=<catalog>&from=<today-10d>`. The last two dates per quote become `latest` and `previous`. Every pair is a **cross rate through USD** (`utils/rates.ts crossRate`), which feeds the converter, ticker, compare, and favorites. On failure it falls back to the cached snapshot (`fx:v1:rates`) with `stale: true`.
- **Build-time bundle (FR-054)**: `npm run build` first runs `prebuild` → `scripts/fetch-rates.mjs`, which refreshes `src/data/bootstrap.json` (currencies, the latest two publications, and USD→EUR 1M history). If the API is unreachable, the committed file is kept. `useRates` and `useHistory` render the bundle on first paint and replace it with live data. In tests the bundle is off by default (`tests/setup.ts` → `testBootstrap`).
- **History**: `useHistory` fetches the pair directly (`base=A&quotes=B`, with `group=week|month` for 1Y and 5Y) and caches per `pair-range` in memory. `historyStats`: 1D charts the last 5 points but compares the last two (FR-020).
- **Currencies**: `data/currencyCatalog.ts` (code → flag and design name) intersected with `/v2/currencies`. The fixed design sets are here too: Popular, ticker pairs, compare codes.
- **Persistence**: `usePersistentState(key, default, validate)` uses `fx:v1:*` keys. Bad or missing data falls back to the default, and storage errors are swallowed (`contracts/storage.md`).
- **Formatting** (`utils/format.ts`): rates use 4, 3 or 2 decimals depending on whether they're below 10, below 100, or 100+ (FR-002). Amounts use 2 decimals below 100,000 and none from 100,000 up (FR-007).
- **Accessibility**: WAI-ARIA tabs (a native `<select>` on mobile), a combobox + grouped listbox picker using `aria-activedescendant`, a radiogroup for ranges, one polite live region (`LiveAnnouncer`, `useAnnounce`), and a debounced converted-amount announcement. Exactly one `<main>` and one `<h1>`.
- **Styling**: CSS Modules per component plus `src/styles/tokens.css` (Figma variables and semantic aliases; light theme under `:root[data-theme='light']`). Icons are inlined from `public/assets/images/*.svg` (`components/Icon`) so they follow `currentColor`.
- **Tests** live next to their code. `tests/setup.ts` provides `mockFetch` and `setMatchMedia`; `tests/fixtures.ts` provides `mockApi()`, fixture rates, and history.

## Data source

[Frankfurter API](https://frankfurter.dev/) v2 at `https://api.frankfurter.dev`. **The challenge README's `/v2/latest` and `/v2/{start}..{end}` endpoints return 404.** Use `/v2/currencies`, `/v2/rates`, and `/v2/rate/{b}/{q}` (see `contracts/frankfurter-api.md`).

## Design source of truth

The Figma file (`figma-design/*.fig`, git-ignored) is read through the **figma-desktop MCP**. Design system: node `100:53`. Screens: `54:2` (desktop `75:175`, tablet `237:1176`, mobile `237:1337`). Check layouts at 375, 768 and 1440 px, with no horizontal scroll from 320 px up. Keep labels in normal case in the JSX and uppercase them with CSS; acronyms and currency codes stay as they are.

## Constraints

- **Never commit design files.** `.gitignore` excludes `*.fig`, `*.sketch`, `*.xd`; don't change those entries.
- GitHub repos use the `fsdev-` prefix.

## Post-implementation pipeline (each step needs the user's confirmation)

1. Deploy to Vercel.
2. Take screenshots at exactly 375 px and 1440 px into `screenshots/`. Write `README.md` from `README-template.md` with the `create-readme` skill; the 375 px shot is 40% of the 1440 px width, and the author links from `my-sdd-docs/spec-draft.md` go in as an inline row of badges.
3. Submit with the `frontendmentor-submitter` agent (`foreign-exchange-currency-converter`). Then add the solution URL and live URL to the README and the repo homepage.
4. Update the portfolio with `landing-page-portfolio-updater`.
5. Fix the quality report with `frontend-mentor-issue-fixer` / the `frontendmentor-report` skill.
