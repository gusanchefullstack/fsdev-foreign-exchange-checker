import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePersistentState, validList } from './usePersistentState'

const isNumberList = (raw: unknown) => validList(raw, (v): v is number => typeof v === 'number')

describe('usePersistentState', () => {
  it('uses the default when nothing is stored and persists changes', () => {
    const { result } = renderHook(() => usePersistentState('nums', [1], isNumberList))
    expect(result.current[0]).toEqual([1])
    act(() => result.current[1]([1, 2]))
    expect(JSON.parse(localStorage.getItem('fx:v1:nums')!)).toEqual([1, 2])
  })

  it('restores stored values', () => {
    localStorage.setItem('fx:v1:nums', '[4,5]')
    const { result } = renderHook(() => usePersistentState('nums', [], isNumberList))
    expect(result.current[0]).toEqual([4, 5])
  })

  it('falls back to the default on corrupt JSON or an invalid shape', () => {
    localStorage.setItem('fx:v1:nums', '{not json')
    expect(renderHook(() => usePersistentState('nums', [9], isNumberList)).result.current[0]).toEqual([9])
    localStorage.setItem('fx:v1:nums', '{"a":1}')
    expect(renderHook(() => usePersistentState('nums', [9], isNumberList)).result.current[0]).toEqual([9])
  })

  it('drops invalid entries individually', () => {
    localStorage.setItem('fx:v1:nums', '[1,"x",3]')
    expect(renderHook(() => usePersistentState('nums', [], isNumberList)).result.current[0]).toEqual([1, 3])
  })

  it('keeps working in memory when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const { result } = renderHook(() => usePersistentState('nums', [7], isNumberList))
    expect(result.current[0]).toEqual([7])
    act(() => result.current[1]([8]))
    expect(result.current[0]).toEqual([8])
  })
})
