import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../tests/fixtures'
import App from '../../App'
import { StaleBanner } from './StaleBanner'

describe('StaleBanner (US8)', () => {
  it('explains that saved rates are shown, as a status message', () => {
    render(<StaleBanner date="2026-09-20" />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing saved rates from Sep 20, 2026. Live rates are unavailable.',
    )
  })

  it('appears in the app when offline with a cache, and never shows raw errors', async () => {
    localStorage.setItem(
      'fx:v1:rates',
      JSON.stringify({ date: '2026-09-20', latest: { USD: 1, EUR: 0.9 }, previous: { USD: 1, EUR: 0.9 }, fetchedAt: 1 }),
    )
    mockApi({ rates: 'error', history: 'error' })
    render(<App />)
    expect(await screen.findByText(/Showing saved rates from Sep 20, 2026/)).toBeInTheDocument()
    expect(screen.getByText('1 USD = 0.9000 EUR')).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Failed to fetch|TypeError|network/i)
  })

  it('shows friendly copy when offline without a cache', async () => {
    mockApi({ rates: 'error' })
    render(<App />)
    expect(await screen.findByText('Live rates are unavailable right now. Please try again in a minute.')).toBeInTheDocument()
  })
})
