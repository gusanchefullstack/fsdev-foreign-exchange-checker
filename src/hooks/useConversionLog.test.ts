import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UNDO_MS, useConversionLog } from './useConversionLog'

const entry = (n: number) => ({ from: 'USD', to: 'EUR', sendAmount: n, rate: 0.8764 })

describe('useConversionLog', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('adds newest first with rounded received amount and frozen rate', () => {
    const { result } = renderHook(() => useConversionLog())
    act(() => result.current.add(entry(1000)))
    act(() => result.current.add(entry(1.005)))
    const [latest, older] = result.current.entries
    expect(latest).toMatchObject({ sendAmount: 1.005, receivedAmount: 0.88, rate: 0.8764 })
    expect(older).toMatchObject({ sendAmount: 1000, receivedAmount: 876.4 })
    expect(typeof latest!.id).toBe('string')
  })

  it('is capped at 100 entries, dropping the oldest', () => {
    const { result } = renderHook(() => useConversionLog())
    act(() => {
      for (let i = 1; i <= 101; i++) result.current.add(entry(i))
    })
    expect(result.current.entries).toHaveLength(100)
    expect(result.current.entries[0]!.sendAmount).toBe(101)
    expect(result.current.entries.at(-1)!.sendAmount).toBe(2)
  })

  it('removes a single entry', () => {
    const { result } = renderHook(() => useConversionLog())
    act(() => result.current.add(entry(1)))
    act(() => result.current.add(entry(2)))
    act(() => result.current.remove(result.current.entries[0]!.id))
    expect(result.current.entries.map((e) => e.sendAmount)).toEqual([1])
  })

  it('clears immediately (persisted) and undo within 5 s restores in order', () => {
    const { result } = renderHook(() => useConversionLog())
    act(() => result.current.add(entry(1)))
    act(() => result.current.add(entry(2)))
    act(() => result.current.clearAll())
    expect(result.current.entries).toEqual([])
    expect(localStorage.getItem('fx:v1:log')).toBe('[]')
    expect(result.current.canUndo).toBe(true)
    act(() => vi.advanceTimersByTime(UNDO_MS - 100))
    act(() => result.current.undo())
    expect(result.current.entries.map((e) => e.sendAmount)).toEqual([2, 1])
    expect(result.current.canUndo).toBe(false)
  })

  it('pauses the undo countdown while paused, and expires after 5 s otherwise', () => {
    const { result } = renderHook(() => useConversionLog())
    act(() => result.current.add(entry(1)))
    act(() => result.current.clearAll())
    act(() => result.current.pauseUndo(true))
    act(() => vi.advanceTimersByTime(UNDO_MS * 3))
    expect(result.current.canUndo).toBe(true)
    act(() => result.current.pauseUndo(false))
    act(() => vi.advanceTimersByTime(UNDO_MS))
    expect(result.current.canUndo).toBe(false)
  })

  it('logging during the undo window ends it and keeps only the new entry', () => {
    const { result } = renderHook(() => useConversionLog())
    act(() => result.current.add(entry(1)))
    act(() => result.current.clearAll())
    act(() => result.current.add(entry(5)))
    expect(result.current.canUndo).toBe(false)
    expect(result.current.entries.map((e) => e.sendAmount)).toEqual([5])
  })
})
