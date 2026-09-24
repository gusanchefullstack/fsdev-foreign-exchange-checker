import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Full-app renders can be slow when the suite runs in parallel.
configure({ asyncUtilTimeout: 4000 })

// jsdom has no matchMedia; default to "desktop, motion allowed". Tests override per case.
export function setMatchMedia(matches: (query: string) => boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: matches(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

if (!globalThis.crypto?.randomUUID) {
  let n = 0
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { ...globalThis.crypto, randomUUID: () => `uuid-${++n}` },
  })
}

// The build-time rate bundle (FR-054) is off by default so tests control first paint;
// bundle-specific tests call setBootstrapForTests().
vi.mock('../src/data/bootstrap', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/data/bootstrap')>()
  return { ...actual, getBootstrap: () => testBootstrap.current }
})
export const testBootstrap: { current: import('../src/data/bootstrap').Bootstrap | null } = { current: null }

beforeEach(() => {
  testBootstrap.current = null
  setMatchMedia(() => false)
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

type Route = { match: RegExp; body?: unknown; status?: number; error?: boolean }

/** Stubs global fetch: the first route whose regex matches the URL answers with its JSON body. */
export function mockFetch(routes: Route[]) {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    const route = routes.find((r) => r.match.test(url))
    if (!route || route.error) throw new TypeError('Failed to fetch')
    const status = route.status ?? 200
    return new Response(JSON.stringify(route.body ?? {}), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fn)
  return fn
}
