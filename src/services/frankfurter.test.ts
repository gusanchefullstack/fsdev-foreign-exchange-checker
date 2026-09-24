import { describe, expect, it } from 'vitest'
import { mockFetch } from '../../tests/setup'
import { RatesError, fetchCurrencies, fetchHistory, fetchLatestSnapshot, historyQuery } from './frankfurter'

describe('fetchCurrencies', () => {
  it('keeps only catalog currencies, Popular first, then alphabetical, with design names', async () => {
    mockFetch([
      {
        match: /\/v2\/currencies$/,
        body: [
          { iso_code: 'ZAR', name: 'South African Rand' },
          { iso_code: 'EUR', name: 'Euro' },
          { iso_code: 'XYZ', name: 'Not in catalog' },
          { iso_code: 'USD', name: 'United States Dollar' },
          { iso_code: 'AED', name: 'United Arab Emirates Dirham' },
        ],
      },
    ])
    const list = await fetchCurrencies()
    expect(list.map((c) => c.code)).toEqual(['USD', 'EUR', 'AED', 'ZAR'])
    expect(list[0]).toMatchObject({ name: 'US Dollar', popular: true, flagSrc: '/assets/images/flags/us.webp' })
    expect(list[2]).toMatchObject({ name: 'UAE Dirham', popular: false })
  })
})

describe('fetchLatestSnapshot', () => {
  it('takes the last two dates per quote as latest and previous', async () => {
    const fetchFn = mockFetch([
      {
        match: /\/v2\/rates\?base=USD/,
        body: [
          { date: '2026-09-22', base: 'USD', quote: 'EUR', rate: 0.87 },
          { date: '2026-09-23', base: 'USD', quote: 'EUR', rate: 0.872 },
          { date: '2026-09-24', base: 'USD', quote: 'EUR', rate: 0.876 },
          { date: '2026-09-24', base: 'USD', quote: 'GBP', rate: 0.75 },
          { date: '2026-09-23', base: 'USD', quote: 'GBP', rate: 0.74 },
        ],
      },
    ])
    const snap = await fetchLatestSnapshot(['USD', 'EUR', 'GBP'])
    expect(String(fetchFn.mock.calls[0]![0])).toContain('quotes=EUR,GBP')
    expect(snap).toMatchObject({
      date: '2026-09-24',
      latest: { USD: 1, EUR: 0.876, GBP: 0.75 },
      previous: { USD: 1, EUR: 0.872, GBP: 0.74 },
      stale: false,
    })
  })
})

describe('error mapping', () => {
  it.each([
    [{ status: 404 }, 'not-found'],
    [{ status: 422 }, 'invalid'],
    [{ status: 500 }, 'unknown'],
    [{ error: true }, 'network'],
  ] as const)('%o → %s', async (route, code) => {
    mockFetch([{ match: /.*/, ...route }])
    await expect(fetchCurrencies()).rejects.toEqual(new RatesError(code))
  })
})

describe('history', () => {
  it('builds range queries per research R5', () => {
    const now = new Date('2026-09-24T12:00:00Z')
    expect(historyQuery('1D', now)).toEqual({ from: '2026-09-14' })
    expect(historyQuery('1W', now)).toEqual({ from: '2026-09-17' })
    expect(historyQuery('1M', now)).toEqual({ from: '2026-08-24' })
    expect(historyQuery('3M', now)).toEqual({ from: '2026-06-24' })
    expect(historyQuery('1Y', now)).toEqual({ from: '2025-09-24', group: 'week' })
    expect(historyQuery('5Y', now)).toEqual({ from: '2021-09-24', group: 'month' })
  })

  it('requests the direct pair and returns ascending points', async () => {
    const fetchFn = mockFetch([
      {
        match: /base=GBP&quotes=JPY/,
        body: [
          { date: '2026-09-24', base: 'GBP', quote: 'JPY', rate: 210 },
          { date: '2026-09-23', base: 'GBP', quote: 'JPY', rate: 209 },
        ],
      },
    ])
    const pts = await fetchHistory({ from: 'GBP', to: 'JPY' }, '5Y')
    expect(String(fetchFn.mock.calls[0]![0])).toContain('group=month')
    expect(pts).toEqual([
      { date: '2026-09-23', rate: 209 },
      { date: '2026-09-24', rate: 210 },
    ])
  })
})
