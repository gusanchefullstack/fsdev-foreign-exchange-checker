import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, type TabItem } from './Tabs'

const tabs: TabItem[] = [
  { id: 'history', label: 'History' },
  { id: 'compare', label: 'Compare' },
  { id: 'favorites', label: 'Favorites', badge: 10 },
  { id: 'log', label: 'Log', badge: 8 },
]

describe('Tabs', () => {
  it('exposes a tablist with the active tab selected and its panel labelled', () => {
    render(
      <Tabs tabs={tabs} active="history" onChange={() => {}}>
        <p>History content</p>
      </Tabs>,
    )
    const history = screen.getByRole('tab', { name: 'History' })
    expect(history).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'History' })).toHaveTextContent('History content')
    expect(screen.getByRole('tab', { name: 'Favorites, 10 items' })).toHaveAttribute('tabindex', '-1')
  })

  it('moves focus with arrow/Home/End keys and activates with Enter (manual activation)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Tabs tabs={tabs} active="history" onChange={onChange}>
        <p />
      </Tabs>,
    )
    await user.tab()
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Compare' })).toHaveFocus()
    expect(onChange).not.toHaveBeenCalled()
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: /Log/ })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'History' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}{Enter}')
    expect(onChange).toHaveBeenCalledWith('log')
  })
})
