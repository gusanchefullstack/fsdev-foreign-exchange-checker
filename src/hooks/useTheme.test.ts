import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTheme } from './useTheme'

describe('useTheme (US9)', () => {
  it('defaults to dark and persists the toggle to <html data-theme>', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    act(() => result.current.toggle())
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('fx:v1:theme')).toBe('"light"')
  })

  it('restores the saved theme', () => {
    localStorage.setItem('fx:v1:theme', '"light"')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })
})
