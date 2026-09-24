import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { USD_RATES, mockApi } from '../../../tests/fixtures'
import App from '../../App'
import type { Currency } from '../../types'
import { crossRate } from '../../utils/rates'
import { ComparePanel } from './ComparePanel'

const latest = Object.fromEntries(Object.entries(USD_RATES).map(([k, [, v]]) => [k, v]))
const rate = (a: string, b: string) => crossRate(latest, a, b)
const currencies: Currency[] = ['GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'INR', 'CNY', 'BDT', 'USD'].map((code) => ({
  code,
  name: code === 'GBP' ? 'British Pound' : `${code} name`,
  flagSrc: '',
  popular: false,
}))

const props = { currencies, rate, isPinned: () => false, onTogglePin: () => {} }

describe('ComparePanel (US5)', () => {
  it('converts the amount into the 8 design currencies with the reference rate', () => {
    render(<ComparePanel amount={1000} from="USD" {...props} />)
    expect(screen.getByText('1,000 from USD')).toBeInTheDocument()
    expect(screen.getByText('8 pairs')).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(rows.map((r) => within(r).getByText(/^[A-Z]{3}$/).textContent)).toEqual([
      'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'INR', 'CNY', 'BDT',
    ])
    expect(rows[0]).toHaveTextContent('British Pound')
    expect(rows[0]).toHaveTextContent('750.00')
    expect(rows[0]).toHaveTextContent('@ 0.7500')
    expect(rows[1]).toHaveTextContent('158,150')
    expect(rows[1]).toHaveTextContent('@ 158.15')
  })

  it('leaves out the send currency', () => {
    render(<ComparePanel amount={100} from="GBP" {...props} />)
    expect(screen.getByText('7 pairs')).toBeInTheDocument()
    expect(screen.queryByText('British Pound')).not.toBeInTheDocument()
  })

  it('toggles a pin for send → row currency', async () => {
    const user = userEvent.setup()
    const onTogglePin = vi.fn()
    render(
      <ComparePanel
        amount={1000}
        from="USD"
        {...props}
        isPinned={(p) => p.to === 'JPY'}
        onTogglePin={onTogglePin}
      />,
    )
    expect(screen.getByRole('button', { name: 'Pin USD to JPY' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Pin USD to GBP' }))
    expect(onTogglePin).toHaveBeenCalledWith({ from: 'USD', to: 'GBP' })
  })

  it('shows the empty state when the amount is empty', () => {
    render(<ComparePanel amount={null} from="USD" {...props} />)
    expect(screen.getByText('No comparison available')).toBeInTheDocument()
    expect(screen.getByText(/Enter an amount in/)).toHaveTextContent(
      'Enter an amount in Send above to see what your money is worth in other currencies.',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(<ComparePanel amount={1000} from="USD" {...props} />)
    expect((await axe(container)).violations).toEqual([])
  })

  it('pinning from Compare adds the pair to Favorites in the app', async () => {
    const user = userEvent.setup()
    mockApi()
    render(<App />)
    await screen.findByText('1 USD = 0.8764 EUR')
    await user.click(screen.getByRole('tab', { name: 'Compare' }))
    await user.click(screen.getByRole('button', { name: 'Pin USD to GBP' }))
    await user.click(screen.getByRole('tab', { name: /Favorites/ }))
    expect(screen.getByRole('button', { name: /Load USD to GBP/ })).toBeInTheDocument()
  })
})
