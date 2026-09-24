import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockApi } from '../../../tests/fixtures'
import { clearHistoryCache } from '../../hooks/useHistory'
import type { HistoryRange } from '../../types'
import { HistoryPanel } from './HistoryPanel'

const pair = { from: 'USD', to: 'EUR' }

describe('HistoryPanel (US4)', () => {
  beforeEach(() => clearHistoryCache())

  it('shows stats, the range group with 1M checked and an accessible chart', async () => {
    mockApi()
    render(<HistoryPanel pair={pair} range="1M" onRangeChange={() => {}} />)
    const chart = await screen.findByRole('img', { name: /USD to EUR rate over 1 month/ })
    expect(chart).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '1M' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Open').nextSibling).toHaveTextContent('0.8500')
    expect(screen.getByText('Last').nextSibling).toHaveTextContent('0.8645')
    expect(screen.getByText('Change').nextSibling).toHaveTextContent('+0.0145')
    expect(screen.getByText('% change').nextSibling).toHaveTextContent('▲ +1.71%')
    expect(screen.getByText('% change').nextSibling).toHaveClass('up')
    expect(screen.getByText('USD/EUR')).toBeInTheDocument()
    expect(screen.getByText(/0\.8645 · Aug 30 16:00 CET/)).toBeInTheDocument()
  })

  it('moves through ranges with the arrow keys', async () => {
    const user = userEvent.setup()
    mockApi()
    const onRangeChange = vi.fn()
    render(<HistoryPanel pair={pair} range="1M" onRangeChange={onRangeChange} />)
    await screen.findByRole('img')
    screen.getByRole('radio', { name: '1M' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onRangeChange).toHaveBeenLastCalledWith<[HistoryRange]>('3M')
    await user.keyboard('{ArrowLeft}')
    expect(onRangeChange).toHaveBeenLastCalledWith('1M')
  })

  it('shows the friendly error state when history fails', async () => {
    mockApi({ history: 'error' })
    render(<HistoryPanel pair={pair} range="1M" onRangeChange={() => {}} />)
    expect(await screen.findByText('No chart data available')).toBeInTheDocument()
    expect(
      screen.getByText("We couldn't load rate history for USD/EUR right now. This usually clears up in a minute."),
    ).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    mockApi()
    const { container } = render(<HistoryPanel pair={pair} range="1M" onRangeChange={() => {}} />)
    await screen.findByRole('img')
    expect((await axe(container)).violations).toEqual([])
  })
})
