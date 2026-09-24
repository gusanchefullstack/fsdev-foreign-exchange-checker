import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { HistorySeries } from '../../types'
import { RateChart } from './RateChart'

const points = [0.85, 0.86, 0.853].map((rate, i) => ({ date: `2026-05-0${i + 1}`, rate }))
const series: HistorySeries = {
  pair: { from: 'USD', to: 'EUR' },
  range: '1M',
  points,
  open: 0.85,
  last: 0.853,
  change: 0.003,
  changePct: 0.35,
  high: 0.86,
  low: 0.85,
  mid: 0.855,
}

describe('RateChart crosshair (US10)', () => {
  it('shows the nearest point on pointer move and hides it on leave', () => {
    render(<RateChart series={series} />)
    const plot = screen.getByTestId('chart-plot')
    plot.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 272, right: 300, bottom: 272, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerMove(plot, { clientX: 160, clientY: 50 })
    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('May 02 · 0.8600')
    fireEvent.pointerMove(plot, { clientX: 290, clientY: 50 })
    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('May 03 · 0.8530')
    fireEvent.pointerLeave(plot)
    expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument()
  })
})
