import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { pairFromUrl, useUrlPairSync } from './useUrlPair'

const known = ['USD', 'EUR', 'GBP', 'JPY']

describe('URL pair (US9)', () => {
  it('parses a valid pair', () => {
    expect(pairFromUrl('?from=GBP&to=JPY', known)).toEqual({ from: 'GBP', to: 'JPY' })
    expect(pairFromUrl('?from=gbp&to=jpy', known)).toEqual({ from: 'GBP', to: 'JPY' })
  })

  it('falls back to null for unknown, identical or missing codes', () => {
    expect(pairFromUrl('?from=XXX&to=EUR', known)).toBeNull()
    expect(pairFromUrl('?from=EUR&to=EUR', known)).toBeNull()
    expect(pairFromUrl('?from=EUR', known)).toBeNull()
    expect(pairFromUrl('', known)).toBeNull()
  })

  it('writes pair changes with replaceState, not pushState', () => {
    const replace = vi.spyOn(window.history, 'replaceState')
    const push = vi.spyOn(window.history, 'pushState')
    const { rerender } = renderHook(({ pair }) => useUrlPairSync(pair, true), {
      initialProps: { pair: { from: 'USD', to: 'EUR' } },
    })
    rerender({ pair: { from: 'GBP', to: 'JPY' } })
    expect(window.location.search).toBe('?from=GBP&to=JPY')
    expect(replace).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})

describe('URL pair in the app (US9)', () => {
  it('loads the pair from the URL and falls back silently when invalid', async () => {
    const { render, screen } = await import('@testing-library/react')
    const { mockApi } = await import('../../tests/fixtures')
    const { default: App } = await import('../App')
    const { createElement } = await import('react')
    mockApi()
    window.history.replaceState(null, '', '/?from=GBP&to=JPY')
    const first = render(createElement(App))
    expect(await screen.findByText('1 GBP = 210.87 JPY')).toBeInTheDocument()
    first.unmount()
    window.history.replaceState(null, '', '/?from=XXX&to=EUR')
    render(createElement(App))
    expect(await screen.findByText('1 USD = 0.8764 EUR')).toBeInTheDocument()
    expect(window.location.search).toBe('?from=USD&to=EUR')
  })
})
