import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../tests/fixtures'
import { useRates } from './useRates'

const cached = { date: '2026-09-20', latest: { USD: 1, EUR: 0.9, GBP: 0.8 }, previous: { USD: 1, EUR: 0.89, GBP: 0.8 }, fetchedAt: 1 }

describe('useRates (US8)', () => {
  it('caches a successful snapshot and is not stale', async () => {
    mockApi()
    const { result } = renderHook(() => useRates())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.snapshot!.stale).toBe(false)
    expect(JSON.parse(localStorage.getItem('fx:v1:rates')!).date).toBe('2026-09-24')
    expect(result.current.rate('USD', 'EUR')).toBe(0.8764)
  })

  it('falls back to the cached snapshot, flagged stale, when the network fails', async () => {
    localStorage.setItem('fx:v1:rates', JSON.stringify(cached))
    mockApi({ rates: 'error' })
    const { result } = renderHook(() => useRates())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.snapshot).toMatchObject({ stale: true, date: '2026-09-20' })
    expect(result.current.currencies.map((c) => c.code)).toEqual(['USD', 'EUR', 'GBP'])
    expect(result.current.rate('EUR', 'GBP')).toBeCloseTo(0.8 / 0.9)
  })

  it('errors when there is no cache', async () => {
    mockApi({ rates: 'error' })
    const { result } = renderHook(() => useRates())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.errorCode).toBe('network')
  })

  it('ignores a corrupt cache', async () => {
    localStorage.setItem('fx:v1:rates', '{"date":5}')
    mockApi({ rates: 'error' })
    const { result } = renderHook(() => useRates())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })
})
