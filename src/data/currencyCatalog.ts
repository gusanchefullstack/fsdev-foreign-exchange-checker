import type { CurrencyCode, CurrencyPair } from '../types'

/**
 * Currencies the app can show: one per bundled flag in public/assets/images/flags.
 * At runtime this list is intersected with what the rate API returns (research R3).
 * `name` overrides the API name where the design uses a shorter label.
 */
export const CURRENCY_CATALOG: Record<CurrencyCode, { iso2: string; name?: string }> = {
  AED: { iso2: 'ae', name: 'UAE Dirham' },
  ARS: { iso2: 'ar' },
  AUD: { iso2: 'au' },
  BDT: { iso2: 'bd' },
  BHD: { iso2: 'bh' },
  BRL: { iso2: 'br' },
  CAD: { iso2: 'ca' },
  CHF: { iso2: 'ch' },
  CLP: { iso2: 'cl' },
  CNY: { iso2: 'cn', name: 'Chinese Yuan' },
  COP: { iso2: 'co' },
  CZK: { iso2: 'cz' },
  DKK: { iso2: 'dk' },
  EGP: { iso2: 'eg' },
  EUR: { iso2: 'eu', name: 'Euro' },
  GBP: { iso2: 'gb', name: 'British Pound' },
  HKD: { iso2: 'hk' },
  HNL: { iso2: 'hn' },
  HTG: { iso2: 'ht' },
  HUF: { iso2: 'hu' },
  IDR: { iso2: 'id' },
  INR: { iso2: 'in' },
  ISK: { iso2: 'is' },
  JOD: { iso2: 'jo' },
  JPY: { iso2: 'jp' },
  KES: { iso2: 'ke' },
  KRW: { iso2: 'kr' },
  KWD: { iso2: 'kw' },
  LBP: { iso2: 'lb' },
  LKR: { iso2: 'lk' },
  MAD: { iso2: 'ma' },
  MXN: { iso2: 'mx' },
  MYR: { iso2: 'my' },
  NGN: { iso2: 'ng' },
  NOK: { iso2: 'no' },
  NPR: { iso2: 'np' },
  NZD: { iso2: 'nz' },
  OMR: { iso2: 'om' },
  PEN: { iso2: 'pe' },
  PHP: { iso2: 'ph' },
  PKR: { iso2: 'pk' },
  PLN: { iso2: 'pl' },
  QAR: { iso2: 'qa' },
  RON: { iso2: 'ro' },
  RUB: { iso2: 'ru' },
  SAR: { iso2: 'sa' },
  SEK: { iso2: 'se' },
  SGD: { iso2: 'sg' },
  THB: { iso2: 'th' },
  TRY: { iso2: 'tr' },
  TWD: { iso2: 'tw' },
  UAH: { iso2: 'ua' },
  USD: { iso2: 'us', name: 'US Dollar' },
  VND: { iso2: 'vn' },
  XCD: { iso2: 'lc' },
  ZAR: { iso2: 'za' },
}

export const CATALOG_CODES: CurrencyCode[] = Object.keys(CURRENCY_CATALOG)

export const flagSrc = (code: CurrencyCode) =>
  `/assets/images/flags/${CURRENCY_CATALOG[code]?.iso2 ?? 'unknown'}.webp`

export const POPULAR_CODES: CurrencyCode[] = ['USD', 'EUR', 'GBP']

export const TICKER_PAIRS: CurrencyPair[] = [
  { from: 'EUR', to: 'USD' },
  { from: 'USD', to: 'JPY' },
  { from: 'GBP', to: 'USD' },
  { from: 'USD', to: 'CHF' },
  { from: 'EUR', to: 'GBP' },
  { from: 'AUD', to: 'USD' },
  { from: 'USD', to: 'CAD' },
]

export const COMPARE_CODES: CurrencyCode[] = ['GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'INR', 'CNY', 'BDT']

export const DEFAULT_PAIR: CurrencyPair = { from: 'USD', to: 'EUR' }
export const DEFAULT_AMOUNT = 1000
