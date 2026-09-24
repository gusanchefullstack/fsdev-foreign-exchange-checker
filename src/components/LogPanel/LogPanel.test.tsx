import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { mockApi } from '../../../tests/fixtures'
import App from '../../App'
import { LogPanel } from './LogPanel'

const now = Date.now()
const entries = [
  { id: 'a', timestamp: now - 20 * 60_000, from: 'USD', to: 'EUR', sendAmount: 1000, receivedAmount: 853.02, rate: 0.85302 },
  { id: 'b', timestamp: now - 2 * 3_600_000, from: 'BDT', to: 'USD', sendAmount: 150000, receivedAmount: 1220.3, rate: 0.0081 },
]

const noop = () => {}

describe('LogPanel (US3)', () => {
  it('lists entries with relative time, pair and amounts', () => {
    render(<LogPanel entries={entries} canUndo={false} onDelete={noop} onClearAll={noop} onUndo={noop} onPauseUndo={noop} />)
    expect(screen.getByRole('heading', { name: 'Conversion log' })).toBeInTheDocument()
    expect(screen.getByText('2 logged')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('20m')
    expect(items[0]).toHaveTextContent('1,000.00')
    expect(items[0]).toHaveTextContent('853.02')
    expect(items[1]).toHaveTextContent('2h')
    expect(items[1]).toHaveTextContent('150,000')
  })

  it('deletes an entry and clears all', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onClearAll = vi.fn()
    render(
      <LogPanel entries={entries} canUndo={false} onDelete={onDelete} onClearAll={onClearAll} onUndo={noop} onPauseUndo={noop} />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete conversion USD to EUR, 1,000.00' }))
    expect(onDelete).toHaveBeenCalledWith('a')
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClearAll).toHaveBeenCalled()
  })

  it('shows the empty state with an Undo bar after clearing', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    render(<LogPanel entries={[]} canUndo onDelete={noop} onClearAll={noop} onUndo={onUndo} onPauseUndo={noop} />)
    expect(screen.getByText('No conversions logged yet')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <LogPanel entries={entries} canUndo={false} onDelete={noop} onClearAll={noop} onUndo={noop} onPauseUndo={noop} />,
    )
    expect((await axe(container)).violations).toEqual([])
  })
})

describe('Logging from the converter (US3)', () => {
  it('logs a conversion, and disables logging for an empty or zero amount', async () => {
    const user = userEvent.setup()
    mockApi()
    render(<App />)
    await screen.findByText('1 USD = 0.8764 EUR')
    await user.click(screen.getByRole('button', { name: 'Log conversion' }))
    await user.click(screen.getByRole('tab', { name: /Log/ }))
    expect(screen.getByText('1 logged')).toBeInTheDocument()
    expect(within(screen.getByRole('tabpanel')).getByRole('listitem')).toHaveTextContent('876.40')

    const input = screen.getByRole('textbox', { name: 'Amount to send' })
    await user.clear(input)
    expect(screen.getByRole('button', { name: 'Log conversion' })).toBeDisabled()
    await user.type(input, '0')
    expect(screen.getByRole('button', { name: 'Log conversion' })).toBeDisabled()
  })
})
