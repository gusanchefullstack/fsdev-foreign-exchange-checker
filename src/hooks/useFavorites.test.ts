import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFavorites } from './useFavorites'

describe('useFavorites', () => {
  it('pins newest first and persists', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle({ from: 'USD', to: 'EUR' }))
    act(() => result.current.toggle({ from: 'GBP', to: 'USD' }))
    expect(result.current.favorites.map((f) => `${f.from}-${f.to}`)).toEqual(['GBP-USD', 'USD-EUR'])
    expect(JSON.parse(localStorage.getItem('fx:v1:favorites')!)).toHaveLength(2)
  })

  it('treats direction as part of identity and never duplicates a pair (FR-032)', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.pin({ from: 'USD', to: 'EUR' }))
    act(() => result.current.pin({ from: 'USD', to: 'EUR' }))
    act(() => result.current.pin({ from: 'EUR', to: 'USD' }))
    expect(result.current.favorites).toHaveLength(2)
    expect(result.current.isPinned({ from: 'EUR', to: 'USD' })).toBe(true)
  })

  it('unpins with toggle and remove', () => {
    const { result } = renderHook(() => useFavorites())
    act(() => result.current.toggle({ from: 'USD', to: 'EUR' }))
    act(() => result.current.toggle({ from: 'USD', to: 'EUR' }))
    expect(result.current.favorites).toEqual([])
    act(() => result.current.pin({ from: 'USD', to: 'JPY' }))
    act(() => result.current.remove({ from: 'USD', to: 'JPY' }))
    expect(result.current.favorites).toEqual([])
  })

  it('reloads stored favorites and drops invalid entries individually', () => {
    localStorage.setItem(
      'fx:v1:favorites',
      JSON.stringify([{ from: 'USD', to: 'EUR', pinnedAt: 1 }, { from: 'usd', to: 'EUR', pinnedAt: 2 }, 'junk']),
    )
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([{ from: 'USD', to: 'EUR', pinnedAt: 1 }])
  })
})
