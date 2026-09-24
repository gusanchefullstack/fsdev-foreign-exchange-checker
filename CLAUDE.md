# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is the **FX Checker** Frontend Mentor challenge (currency converter with live rates, rate-history chart, multi-currency compare, favorites, conversion log). The repo is still at the **pre-implementation / spec-driven-development stage**: it holds only the Frontend Mentor starter (`index.html` with static copy, `assets/`), the Figma file, and Spec Kit scaffolding. The current feature is `specs/001-fx-checker-app/` (spec, plan, research, data model, contracts, quickstart). Until implementation begins there's no `package.json` or `src/`. The planned commands are `npm run dev`, `npm run build`, `npm run lint`, `npm test`, and for a single test `npx vitest run <file>` or `npx vitest run -t "<name>"`.

## Spec-driven workflow (Spec Kit)

Work follows GitHub Spec Kit (v1.0.11, `.specify/`) via the `speckit-*` skills in `.claude/skills/`:

`speckit-constitution` → `speckit-specify` → `speckit-clarify` → `speckit-plan` → `speckit-tasks` → `speckit-analyze` → `speckit-implement` (plus `speckit-checklist`, `speckit-converge`, `speckit-taskstoissues`).

- `.specify/memory/constitution.md` is still the unfilled template. The author's intended content lives in `my-sdd-docs/constitution-draft.md`; the feature spec draft is `my-sdd-docs/spec-draft.md`. Use these drafts as input to the constitution/specify steps.
- Feature numbering is sequential; helper scripts are in `.specify/scripts/bash/` (sh).
- **Build only what the spec documents** ("zero shadow code"). If a user instruction contradicts the constitution or the spec looks logically wrong, stop, flag it, and ask for the spec to be updated before touching source code.

## Intended architecture (from the drafts)

- **Frontend only** (no backend/database is needed: rates come from a public API, user data lives in `localStorage`). If a backend is ever added, it goes in a separate repo (Node + Express + TypeScript, Prisma Postgres), not a monorepo.
- React + TypeScript + Vite; Vitest for tests. `index.html` stays at the project root as Vite's entry and loads the app from `src/`. Components go in a components folder under `src/`, with styles and TS in their own subfolders.
- Styling with CSS Modules. Colors, fonts, gradients, and typography must be tokens in a separate variables file.
- Naming: `camelCase` for functions/variables, `PascalCase` for components, types, interfaces, and classes. Keep the structure flat; avoid over-engineering.
- Never show raw errors or stack traces in the UI; map failures to friendly messages (for example, the chart error state).

### Data

[Frankfurter API](https://frankfurter.dev/) v2 at `https://api.frankfurter.dev` (no key, CORS-enabled). **The endpoints in the challenge README (`/v2/latest`, `/v2/{start}..{end}`) now return 404.** Use the live shape in `specs/001-fx-checker-app/contracts/frankfurter-api.md`:
- `GET /v2/currencies`: currency list (166 codes; the app shows only those with a bundled flag, about 57)
- `GET /v2/rates?base=USD&quotes=…&from=…`: one call on load gives the latest and previous rates; every pair is a cross rate through USD
- `GET /v2/rates?base=A&quotes=B&from=…[&group=week|month]`: rate history for each range

Persist favorites, conversion log, and the last-open tab in `localStorage`.

### Design source of truth

- The Figma file (`figma-design/*.fig`) is authoritative for colors, spacing, fonts, and responsive layouts. Read it through the **figma-desktop MCP**. System design: node `100-53`; Desktop/Tablet/Mobile screens: node `54-2` (file key `oXwjhmoIUfQyxx7Gy6HS16`).
- Design widths are 375px (mobile) and 1440px (desktop), with tablet in between. The layout must work from 320px up. Tabs collapse into a dropdown on mobile.
- The starter `index.html` holds all static copy, with `Dynamic:` comments marking data-driven content. Keep labels in normal case in the markup and uppercase them with CSS (`text-transform`); acronyms and codes stay as they are. Logo `alt="FX Checker"`.
- The font is JetBrains Mono (local variable font in `assets/fonts/`). Icons and flags (`assets/images/flags/<iso>.webp`) are already optimized.

### Accessibility requirements (scored by Frontend Mentor)

Exactly one `<main>` and one `<h1>`; semantic landmarks; full keyboard support (currency picker popover, swap, tabs, chart range, star toggles); strong visible focus rings on the dark UI; live-region announcements for converted amount, pin/unpin, and log events; no repeated identical link text.

## Constraints

- **Never commit design files.** `.gitignore` excludes `*.fig`, `*.sketch`, `*.xd`; don't modify those entries.
- GitHub repos must use the `fsdev-` prefix.
- Test at 375px, 768px, and 1440px viewports.

## Post-implementation pipeline (only when the user confirms)

1. Deploy the frontend to Vercel.
2. Take screenshots at exactly 375px and 1440px into `/screenshots`, then write `README.md` from `README-template.md` (use the `create-readme` skill). Show 375px shots at 40% of the width of the 1440px ones. Put the author's social links from `spec-draft.md` in the Author section as inline badges.
3. Submit with the `frontendmentor-submitter` agent (challenge: `foreign-exchange-currency-converter`). Then add the solution URL and live URL to the README and the GitHub repo page.
4. Ask first, then update the portfolio with `landing-page-portfolio-updater`.
5. Ask first, then fix the quality report with `frontend-mentor-issue-fixer` / the `frontendmentor-report` skill.
