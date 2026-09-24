import { render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { USD_RATES } from '../../../tests/fixtures'
import { changePct, crossRate } from '../../utils/rates'
import { LiveTicker } from './LiveTicker'

const latest = Object.fromEntries(Object.entries(USD_RATES).map(([k, [, v]]) => [k, v]))
const previous = Object.fromEntries(Object.entries(USD_RATES).map(([k, [v]]) => [k, v]))
const rate = (a: string, b: string) => crossRate(latest, a, b)
const change = (a: string, b: string) => changePct(crossRate(latest, a, b)!, crossRate(previous, a, b)!)

describe('LiveTicker (US6)', () => {
  it('renders the 7 design pairs with rate and colored change in a labelled region', () => {
    render(<LiveTicker rate={rate} change={change} />)
    const region = screen.getByRole('region', { name: 'Live markets' })
    const items = within(within(region).getAllByRole('list')[0]!).getAllByRole('listitem')
    expect(items).toHaveLength(7)
    expect(items[0]).toHaveTextContent('EUR/USD')
    expect(items[0]).toHaveTextContent('1.1410')
    expect(items[1]).toHaveTextContent('USD/JPY')
    expect(items[1]).toHaveTextContent('158.15')
    expect(items[1]).toHaveTextContent('▲ +0.41%')
    expect(items[1]!.querySelector('.up')).not.toBeNull()
    expect(items[0]!.querySelector('.down')).not.toBeNull()
  })

  it('hides the duplicated loop copy from assistive tech', () => {
    const { container } = render(<LiveTicker rate={rate} change={change} />)
    const lists = container.querySelectorAll('ul')
    expect(lists).toHaveLength(2)
    expect(lists[1]).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations', async () => {
    const { container } = render(<LiveTicker rate={rate} change={change} />)
    expect((await axe(container)).violations).toEqual([])
  })
})
