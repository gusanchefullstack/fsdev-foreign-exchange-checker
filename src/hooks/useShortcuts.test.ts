import { renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useShortcuts } from './useShortcuts'

function setup() {
  const handlers = { openSearch: vi.fn(), swap: vi.fn(), setRange: vi.fn(), toggleHelp: vi.fn() }
  renderHook(() => useShortcuts(handlers))
  return handlers
}

describe('useShortcuts (US10)', () => {
  it('maps each documented key to its action', async () => {
    const user = userEvent.setup()
    const h = setup()
    await user.keyboard('/')
    expect(h.openSearch).toHaveBeenCalled()
    await user.keyboard('s')
    expect(h.swap).toHaveBeenCalled()
    await user.keyboard('1')
    expect(h.setRange).toHaveBeenLastCalledWith('1D')
    await user.keyboard('6')
    expect(h.setRange).toHaveBeenLastCalledWith('5Y')
    await user.keyboard('?')
    expect(h.toggleHelp).toHaveBeenCalled()
  })

  it('does nothing while typing in a field or with modifier keys', async () => {
    const user = userEvent.setup()
    const h = setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    await user.keyboard('s1/')
    expect(h.swap).not.toHaveBeenCalled()
    expect(h.setRange).not.toHaveBeenCalled()
    expect(h.openSearch).not.toHaveBeenCalled()
    input.remove()
    await user.keyboard('{Control>}s{/Control}{Meta>}1{/Meta}{Alt>}s{/Alt}')
    expect(h.swap).not.toHaveBeenCalled()
    expect(h.setRange).not.toHaveBeenCalled()
  })
})
