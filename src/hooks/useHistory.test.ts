import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { historyRows, mockApi } from '../../tests/fixtures'
import { mockFetch } from '../../tests/setup'
import { clearHistoryCache, useHistory } from './useHistory'

describe('useHistory', () => {
  it('loads the series with stats for the pair and range', async () => {
    clearHistoryCache()
    const fetchFn = mockApi()
    const { result } = renderHook(() => useHistory({ from: 'USD', to: 'EUR' }, '1Y'))
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(String(fetchFn.mock.calls.at(-1)![0])).toMatch(/base=USD&quotes=EUR&from=.*&group=week/)
    expect(result.current.series!.points).toHaveLength(30)
    expect(result.current.series!.open).toBe(0.85)
  })

  it('uses the in-memory cache for a repeated pair and range', async () => {
    clearHistoryCache()
    const fetchFn = mockApi()
    const first = renderHook(() => useHistory({ from: 'USD', to: 'EUR' }, '1M'))
    await waitFor(() => expect(first.result.current.status).toBe('ready'))
    const calls = fetchFn.mock.calls.length
    const second = renderHook(() => useHistory({ from: 'USD', to: 'EUR' }, '1M'))
    expect(second.result.current.status).toBe('ready')
    expect(fetchFn.mock.calls.length).toBe(calls)
  })

  it('reports an error for fewer than two points or a failed request', async () => {
    clearHistoryCache()
    mockApi({ history: 'short' })
    const short = renderHook(() => useHistory({ from: 'USD', to: 'EUR' }, '1W'))
    await waitFor(() => expect(short.result.current.status).toBe('error'))
    clearHistoryCache()
    mockApi({ history: 'error' })
    const failed = renderHook(() => useHistory({ from: 'USD', to: 'EUR' }, '1W'))
    await waitFor(() => expect(failed.result.current.status).toBe('error'))
  })

  it('refetches when the pair changes', async () => {
    clearHistoryCache()
    const fetchFn = mockFetch([{ match: /base=GBP&quotes=JPY/, body: historyRows('GBP', 'JPY') }, { match: /.*/, body: historyRows('USD', 'EUR') }])
    const { result, rerender } = renderHook(({ pair }) => useHistory(pair, '1M'), {
      initialProps: { pair: { from: 'USD', to: 'EUR' } },
    })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    rerender({ pair: { from: 'GBP', to: 'JPY' } })
    await waitFor(() => expect(String(fetchFn.mock.calls.at(-1)![0])).toContain('base=GBP&quotes=JPY'))
  })
})
