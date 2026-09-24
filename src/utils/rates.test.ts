import { describe, expect, it } from 'vitest'
import { changePct, crossRate, historyStats } from './rates'

const usd = { EUR: 0.87638, GBP: 0.75296, JPY: 158.15, AUD: 1.4178 }

describe('crossRate', () => {
  it('returns direct USD rates', () => {
    expect(crossRate(usd, 'USD', 'EUR')).toBe(0.87638)
    expect(crossRate(usd, 'EUR', 'USD')).toBeCloseTo(1 / 0.87638, 10)
  })

  it('computes cross rates through USD (matches the API to 5 digits)', () => {
    expect(crossRate(usd, 'EUR', 'GBP')).toBeCloseTo(0.85917, 5)
    expect(crossRate(usd, 'AUD', 'JPY')).toBeCloseTo(111.546, 2)
  })

  it('returns null for unknown currencies', () => {
    expect(crossRate(usd, 'USD', 'XXX')).toBeNull()
  })
})

describe('changePct', () => {
  it('computes signed percentage change', () => {
    expect(changePct(110, 100)).toBeCloseTo(10)
    expect(changePct(90, 100)).toBeCloseTo(-10)
    expect(changePct(1, 0)).toBe(0)
  })
})

describe('historyStats', () => {
  const pts = [0.84, 0.85, 0.86, 0.855, 0.851, 0.853].map((rate, i) => ({ date: `2026-05-0${i + 1}`, rate }))

  it('uses first vs last for normal ranges', () => {
    const r = historyStats(pts, '1M')!
    expect(r.points).toHaveLength(6)
    expect(r.stats.open).toBe(0.84)
    expect(r.stats.last).toBe(0.853)
    expect(r.stats.change).toBeCloseTo(0.013)
    expect(r.stats.high).toBe(0.86)
    expect(r.stats.low).toBe(0.84)
    expect(r.stats.mid).toBeCloseTo(0.85)
  })

  it('1D charts the last 5 points and compares the last two', () => {
    const r = historyStats(pts, '1D')!
    expect(r.points).toHaveLength(5)
    expect(r.stats.open).toBe(0.851)
    expect(r.stats.last).toBe(0.853)
  })

  it('returns null with fewer than two points', () => {
    expect(historyStats(pts.slice(0, 1), '1W')).toBeNull()
    expect(historyStats([], '1D')).toBeNull()
  })
})
