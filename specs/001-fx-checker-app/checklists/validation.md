# Validation Record: FX Checker

**Date**: 2026-09-24 | **Build**: production (`npm run build` + `vite preview`) and dev server
**Tools**: Vitest suite (121 tests), Chrome DevTools (Lighthouse, scripted checks), Figma desktop MCP

## Quality gates (T085)

| Gate | Result |
|------|--------|
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm test` | ✅ 121/121 passed |
| `npm run build` | ✅ JS 84.8 KB gzipped (budget 100 KB), CSS 5.6 KB gzipped |

## Performance (T088: SC-001, SC-002)

| Check | Result |
|-------|--------|
| First converted amount on screen (production build, local, no throttling) | ✅ 720 ms (target ≤ 3 s) |
| Keystroke → next paint, 30 keystrokes | ✅ median 16.6 ms, max 17.8 ms (target < 100 ms). One 150 ms outlier on the very first keystroke of a cold page |

## Accessibility (T087: SC-005)

| Check | Result |
|-------|--------|
| Lighthouse accessibility: desktop and mobile (navigation, History tab, dark) | ✅ 100 / 100 |
| Lighthouse accessibility: snapshot, Favorites tab, light theme | ✅ 100 |
| vitest-axe on every tab, the open picker and each panel | ✅ 0 violations |
| Fixed during the audit | Tab badge accessible-name mismatch (label-content-name-mismatch); `<output>` implicit live region double-announcing each keystroke; focus lost to `<body>` after Clear all / delete / unpin (now moves to Undo, the next row, or the empty state); mobile currency picker clipped 9px off-screen (now spans the panel, Figma 332:6918) |
| Manual VoiceOver pass | ⚠️ Not performed in this session. Recommended before submission |

## Quickstart scenarios (T089)

| # | Scenario | How verified | Result |
|---|----------|--------------|--------|
| V1 | Default 1,000 USD → EUR, rate line, header count | Tests + browser (375/768/1440) | ✅ |
| V2 | Typing, picker search, swap | Tests (`Converter.test`, `CurrencyPicker.test`) | ✅ |
| V3 | Same-currency pick swaps | Test | ✅ |
| V4 | Favorites pin, persist, load, unpin, empty state | Tests + browser | ✅ |
| V5 | Log, delete, reload, Clear all + Undo, cap 100 | Tests (fake timers) | ✅ |
| V6 | Ranges 1D–5Y, 1D = 5 points / last-two stats | Tests + browser | ✅ |
| V7 | History error state copy | Test | ✅ |
| V8 | Compare empty state | Test | ✅ |
| V9 | Ticker pause on hover/focus; no motion when reduced | Browser (hover) + CSS review | ✅ hover/focus pause. ⚠️ reduced-motion checked by CSS review only |
| V10 | Keyboard-only operation, visible focus, picker focus return | Tests (tab order, arrows, Escape) + browser | ✅ |
| V11 | Offline with cache → stale banner; no cache → friendly copy | Tests | ✅ |
| V12 | Theme persists; `?from=GBP&to=JPY`; invalid URL fallback | Tests + browser | ✅ |
| V13 | Shortcuts `/ s 1–6 ?`, CSV format, crosshair | Tests + browser | ✅ |

## Responsive (SC-006)

| Width | Horizontal overflow | Matches Figma frame |
|-------|---------------------|---------------------|
| 320 | ✅ none | n/a (amounts scale down, actions stay on one line) |
| 375 | ✅ none | ✅ Mobile – History (237:1337) |
| 768 | ✅ none | ✅ Tablet – History (237:1176) |
| 1440 | ✅ none | ✅ Desktop – History (75:175), Compare (151:2490) |
