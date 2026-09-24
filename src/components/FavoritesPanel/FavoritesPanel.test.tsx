import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { FavoritesPanel } from './FavoritesPanel'

const rate = (from: string, to: string) => (from === 'USD' && to === 'EUR' ? 0.853 : from === 'GBP' ? 1.3575 : null)
const change = (from: string) => (from === 'USD' ? 0.16 : -0.22)
const favorites = [
  { from: 'USD', to: 'EUR', pinnedAt: 2 },
  { from: 'GBP', to: 'USD', pinnedAt: 1 },
]

describe('FavoritesPanel (US2)', () => {
  it('lists pairs with rate and change, and a count header', () => {
    render(
      <FavoritesPanel favorites={favorites} rate={rate} change={change} onSelect={() => {}} onUnpin={() => {}} />,
    )
    expect(screen.getByRole('heading', { name: 'Pinned pairs' })).toBeInTheDocument()
    expect(screen.getByText('2 favorites')).toBeInTheDocument()
    const load = screen.getByRole('button', { name: /Load USD to EUR/ })
    expect(load).toHaveTextContent('USD')
    expect(load).toHaveTextContent('0.8530')
    expect(load).toHaveTextContent('▲ +0.16%')
    expect(screen.getByRole('button', { name: /Load GBP to USD/ })).toHaveTextContent('▼ −0.22%')
  })

  it('selects a row and unpins with the star', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onUnpin = vi.fn()
    render(<FavoritesPanel favorites={favorites} rate={rate} change={change} onSelect={onSelect} onUnpin={onUnpin} />)
    await user.click(screen.getByRole('button', { name: /Load GBP to USD/ }))
    expect(onSelect).toHaveBeenCalledWith({ from: 'GBP', to: 'USD' })
    await user.click(screen.getByRole('button', { name: 'Unpin USD to EUR' }))
    expect(onUnpin).toHaveBeenCalledWith({ from: 'USD', to: 'EUR' })
  })

  it('shows the empty state when nothing is pinned', () => {
    render(<FavoritesPanel favorites={[]} rate={rate} change={change} onSelect={() => {}} onUnpin={() => {}} />)
    expect(screen.getByText('No pinned pairs yet')).toBeInTheDocument()
    expect(screen.getByText(/Pin a pair to track its rate here/)).toBeInTheDocument()
  })

  it('hides favorites whose currency has no rate', () => {
    render(
      <FavoritesPanel
        favorites={[{ from: 'USD', to: 'XYZ', pinnedAt: 1 }]}
        rate={rate}
        change={change}
        onSelect={() => {}}
        onUnpin={() => {}}
      />,
    )
    expect(screen.getByText('No pinned pairs yet')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FavoritesPanel favorites={favorites} rate={rate} change={change} onSelect={() => {}} onUnpin={() => {}} />,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('Favorites in the app (US2)', () => {
  it('pins the active pair from the converter, persists it, and loads a row back', async () => {
    const { mockApi } = await import('../../../tests/fixtures')
    const { default: App } = await import('../../App')
    const user = userEvent.setup()
    mockApi()
    const first = render(<App />)
    await screen.findByText('1 USD = 0.8764 EUR')
    const toggle = screen.getByRole('button', { name: 'Favorite' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Favorited' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('tab', { name: /^Favorites\s*1\s*items$/ })).toBeInTheDocument()
    first.unmount()

    // Reload: still pinned; swap to EUR→USD, then load USD→EUR from the Favorites tab.
    render(<App />)
    await screen.findByText('1 USD = 0.8764 EUR')
    await user.click(screen.getByRole('button', { name: 'Swap currencies' }))
    await user.click(screen.getByRole('tab', { name: /Favorites/ }))
    await user.click(screen.getByRole('button', { name: /Load USD to EUR/ }))
    expect(screen.getByText('1 USD = 0.8764 EUR')).toBeInTheDocument()
  })
})
