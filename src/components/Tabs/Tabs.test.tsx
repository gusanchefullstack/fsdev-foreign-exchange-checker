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
    expect(screen.getByRole('tab', { name: /^Favorites\s*10\s*items$/ })).toHaveAttribute('tabindex', '-1')
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

describe('Tabs on mobile (US7)', () => {
  it('renders a labelled native select with badge counts and switches panels', async () => {
    const { setMatchMedia } = await import('../../../tests/setup')
    setMatchMedia((q) => q.includes('max-width: 767px'))
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Tabs tabs={tabs} active="history" onChange={onChange}>
        <p>History content</p>
      </Tabs>,
    )
    const select = screen.getByRole('combobox', { name: 'View' })
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Favorites (10)' })).toBeInTheDocument()
    await user.selectOptions(select, 'log')
    expect(onChange).toHaveBeenCalledWith('log')
    expect(screen.getByRole('region', { name: 'History' })).toHaveTextContent('History content')
  })
})

describe('Active tab persistence (US7)', () => {
  it('remembers the last tab across reloads', async () => {
    const { mockApi } = await import('../../../tests/fixtures')
    const { default: App } = await import('../../App')
    const user = userEvent.setup()
    mockApi()
    const first = render(<App />)
    await screen.findByText('1 USD = 0.8764 EUR')
    await user.click(screen.getByRole('tab', { name: 'Compare' }))
    expect(localStorage.getItem('fx:v1:activeTab')).toBe('"compare"')
    first.unmount()
    render(<App />)
    await screen.findByText('1 USD = 0.8764 EUR')
    expect(screen.getByRole('tab', { name: 'Compare' })).toHaveAttribute('aria-selected', 'true')
  })
})
