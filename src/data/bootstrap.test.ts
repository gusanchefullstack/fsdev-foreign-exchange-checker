import { describe, expect, it } from 'vitest'
import raw from './bootstrap.json'
import { parseBootstrap } from './bootstrap'

const rows = [
  { date: '2026-09-23', quote: 'EUR', rate: 0.87 },
  { date: '2026-09-24', quote: 'EUR', rate: 0.8764 },
  { date: '2026-09-23', quote: 'GBP', rate: 0.74 },
  { date: '2026-09-24', quote: 'GBP', rate: 0.75 },
]
const base = {
  generatedAt: '2026-09-24T19:00:00.000Z',
  currencies: [
    { iso_code: 'USD', name: 'United States Dollar' },
    { iso_code: 'EUR', name: 'Euro' },
    { iso_code: 'GBP', name: 'British Pound' },
  ],
  rows,
  history: [
    { date: '2026-09-23', rate: 0.87 },
    { date: '2026-09-24', rate: 0.8764 },
  ],
}

describe('build-time bundle (FR-054)', () => {
  it('parses into currencies, a snapshot and history', () => {
    const b = parseBootstrap(base, new Date('2026-09-25T12:00:00Z'))!
    expect(b.currencies.map((c) => c.code)).toEqual(['USD', 'EUR', 'GBP'])
    expect(b.currencies[0]!.name).toBe('US Dollar')
    expect(b.snapshot).toMatchObject({ date: '2026-09-24', latest: { USD: 1, EUR: 0.8764 }, previous: { EUR: 0.87 } })
    expect(b.history).toHaveLength(2)
  })

  it('is stale only when the publication is more than 4 days old', () => {
    expect(parseBootstrap(base, new Date('2026-09-28T12:00:00Z'))!.snapshot.stale).toBe(false)
    expect(parseBootstrap(base, new Date('2026-09-29T12:00:00Z'))!.snapshot.stale).toBe(true)
  })

  it('rejects malformed data', () => {
    expect(parseBootstrap({ rows: 'x' })).toBeNull()
    expect(parseBootstrap({ ...base, rows: [] })).toBeNull()
    expect(parseBootstrap(null)).toBeNull()
  })

  it('the committed bootstrap.json is valid', () => {
    const b = parseBootstrap(raw)
    expect(b).not.toBeNull()
    expect(b!.currencies.length).toBeGreaterThan(40)
    expect(b!.snapshot.latest.EUR).toBeGreaterThan(0)
    expect(b!.history.length).toBeGreaterThan(10)
  })
})
