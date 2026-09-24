import { mockFetch } from './setup'

/** USD-based rates used across tests: [previous, latest]. */
export const USD_RATES: Record<string, [number, number]> = {
  EUR: [0.87, 0.8764],
  GBP: [0.74, 0.75],
  JPY: [157.5, 158.15],
  CHF: [0.79, 0.8],
  CAD: [1.37, 1.38],
  AUD: [1.42, 1.4178],
  INR: [94.5, 94.91],
  CNY: [7.2, 7.21],
  BDT: [122.5, 122.92],
  AED: [3.6725, 3.6725],
}

export const API_CURRENCIES = [
  { iso_code: 'USD', name: 'United States Dollar' },
  { iso_code: 'EUR', name: 'Euro' },
  { iso_code: 'GBP', name: 'British Pound' },
  { iso_code: 'JPY', name: 'Japanese Yen' },
  { iso_code: 'CHF', name: 'Swiss Franc' },
  { iso_code: 'CAD', name: 'Canadian Dollar' },
  { iso_code: 'AUD', name: 'Australian Dollar' },
  { iso_code: 'INR', name: 'Indian Rupee' },
  { iso_code: 'CNY', name: 'Chinese Renminbi Yuan' },
  { iso_code: 'BDT', name: 'Bangladeshi Taka' },
  { iso_code: 'AED', name: 'United Arab Emirates Dirham' },
]

const snapshotRows = Object.entries(USD_RATES).flatMap(([quote, [prev, latest]]) => [
  { date: '2026-09-23', base: 'USD', quote, rate: prev },
  { date: '2026-09-24', base: 'USD', quote, rate: latest },
])

/** 30 days of history points for any pair, rising slightly. */
export function historyRows(base: string, quote: string, count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-08-${String(i + 1).padStart(2, '0')}`,
    base,
    quote,
    rate: 0.85 + i * 0.0005,
  }))
}

/** Mocks the whole Frankfurter API; pass `history: 'error'` to fail history requests. */
export function mockApi(options: { history?: 'ok' | 'error' | 'short'; rates?: 'ok' | 'error' } = {}) {
  return mockFetch([
    { match: /\/v2\/currencies/, body: API_CURRENCIES, error: options.rates === 'error' },
    {
      match: /\/v2\/rates\?base=USD&quotes=[A-Z,]{10,}/,
      body: snapshotRows,
      error: options.rates === 'error',
    },
    {
      match: /\/v2\/rates\?base=[A-Z]{3}&quotes=[A-Z]{3}&/,
      error: options.history === 'error',
      body: options.history === 'short' ? historyRows('USD', 'EUR', 1) : historyRows('USD', 'EUR'),
    },
  ])
}
