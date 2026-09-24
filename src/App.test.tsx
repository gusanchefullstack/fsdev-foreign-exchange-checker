import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../tests/fixtures'
import App from './App'

async function renderApp() {
  mockApi()
  const view = render(<App />)
  await screen.findByText('1 USD = 0.8764 EUR')
  await screen.findByRole('img', { name: /USD to EUR rate/ })
  return view
}

describe('App-level accessibility (US7)', () => {
  it('has exactly one main and one h1, and the header shows the currency count', async () => {
    const { container } = await renderApp()
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(within(screen.getByRole('banner')).getByText(/11 Currencies · EOD · ECB data/i)).toBeInTheDocument()
  })

  it('has no duplicate link text', async () => {
    await renderApp()
    const names = screen.queryAllByRole('link').map((l) => l.textContent)
    expect(new Set(names).size).toBe(names.length)
  })

  it('reaches the converter controls and tabs by keyboard in visual order', async () => {
    const user = userEvent.setup()
    await renderApp()
    const order: string[] = []
    for (let i = 0; i < 12; i++) {
      await user.tab()
      const el = document.activeElement as HTMLElement
      order.push(el.getAttribute('aria-label') ?? el.textContent ?? '')
    }
    const pos = (label: string | RegExp) => order.findIndex((o) => (typeof label === 'string' ? o === label : label.test(o)))
    expect(pos('Amount to send')).toBeGreaterThan(-1)
    expect(pos(/Send currency/)).toBeGreaterThan(pos('Amount to send'))
    expect(pos('Swap currencies')).toBeGreaterThan(pos(/Send currency/))
    expect(pos(/Receive currency/)).toBeGreaterThan(pos('Swap currencies'))
    expect(pos('Favorite')).toBeGreaterThan(pos(/Receive currency/))
    expect(pos('Log conversion')).toBeGreaterThan(pos('Favorite'))
    expect(pos('History')).toBeGreaterThan(pos('Log conversion'))
  })

  it.each(['History', 'Compare', 'Favorites', 'Log'])('has no axe violations on the %s tab', async (tab) => {
    const user = userEvent.setup()
    const { container } = await renderApp()
    await user.click(screen.getByRole('tab', { name: tab }))
    expect((await axe(container)).violations).toEqual([])
  })
})
