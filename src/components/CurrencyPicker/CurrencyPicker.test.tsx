import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../tests/fixtures'
import App from '../../App'

async function openSendPicker() {
  const user = userEvent.setup()
  mockApi()
  const view = render(<App />)
  await screen.findByText('1 USD = 0.8764 EUR')
  const trigger = screen.getByRole('button', { name: /Send currency: USD/ })
  await user.click(trigger)
  return { user, trigger, view }
}

describe('CurrencyPicker (US1)', () => {
  it('groups currencies into Popular and Other with counts, and checks the selected one', async () => {
    await openSendPicker()
    const listbox = screen.getByRole('listbox')
    const popular = within(listbox).getByRole('group', { name: /Popular/ })
    const other = within(listbox).getByRole('group', { name: /Other currencies/ })
    expect(within(popular).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'USDUS Dollar',
      'EUREuro',
      'GBPBritish Pound',
    ])
    expect(within(other).getAllByRole('option')).toHaveLength(8)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(within(popular).getByRole('option', { name: /USD/ })).toHaveAttribute('aria-selected', 'true')
  })

  it('filters by code or name ignoring case', async () => {
    const { user } = await openSendPicker()
    const search = screen.getByRole('combobox', { name: 'Search currencies' })
    expect(search).toHaveFocus()
    await user.type(search, 'yen')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['JPYJapanese Yen'])
    await user.clear(search)
    await user.type(search, 'jP')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['JPYJapanese Yen'])
    await user.clear(search)
    await user.type(search, 'sWiSS')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['CHFSwiss Franc'])
  })

  it('shows a message when nothing matches', async () => {
    const { user } = await openSendPicker()
    await user.type(screen.getByRole('combobox'), 'zzz')
    expect(screen.getByText('No currencies found')).toBeInTheDocument()
  })

  it('selects with arrow keys + Enter and returns focus to the trigger', async () => {
    const { user } = await openSendPicker()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    const trigger = screen.getByRole('button', { name: /Send currency: GBP/ })
    expect(trigger).toHaveFocus()
    expect(screen.getByText('1 GBP = 1.1685 EUR')).toBeInTheDocument()
  })

  it('closes on Escape and on outside click', async () => {
    const { user, trigger } = await openSendPicker()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    await user.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.click(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('swaps the pair when choosing the currency on the other side', async () => {
    const { user } = await openSendPicker()
    await user.click(screen.getByRole('option', { name: /EUR/ }))
    expect(screen.getByText('1 EUR = 1.1410 USD')).toBeInTheDocument()
  })

  it('has no axe violations while open', async () => {
    const { view } = await openSendPicker()
    const results = await axe(view.container)
    expect(results.violations).toEqual([])
  })
})
