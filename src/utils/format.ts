// Number formatting rules from the spec (FR-002, FR-007) and the design.

const grouped = (min: number, max: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: min, maximumFractionDigits: max })

const AMOUNT_2 = grouped(2, 2)
const AMOUNT_0 = grouped(0, 0)
const RATE = [grouped(4, 4), grouped(3, 3), grouped(2, 2)] as const

export const MAX_AMOUNT = 999_999_999_999

/** Amounts: grouping; 2 decimals below 100,000, none at 100,000 and above (FR-007). */
export function formatAmount(n: number): string {
  return Math.abs(n) >= 100_000 ? AMOUNT_0.format(n) : AMOUNT_2.format(n)
}

/** Decimals for a rate: 4 below 10, 3 from 10 to under 100, 2 at 100+ (FR-002). */
export function rateDecimals(n: number): 4 | 3 | 2 {
  const abs = Math.abs(n)
  // Round first so e.g. 9.99996 (shown as "10.000") uses the 10+ bucket.
  if (Number(abs.toFixed(4)) < 10) return 4
  if (Number(abs.toFixed(3)) < 100) return 3
  return 2
}

export function formatRate(n: number): string {
  const d = rateDecimals(n)
  return RATE[d === 4 ? 0 : d === 3 ? 1 : 2].format(n)
}

/** Signed rate difference, e.g. "+0.0014" (uses the rate precision rule). */
export function formatSigned(n: number): string {
  const s = formatRate(Math.abs(n))
  return `${n < 0 ? '−' : '+'}${s}`
}

/** Signed percentage with direction arrow, e.g. "▲ +0.16%". */
export function formatPct(n: number): string {
  const s = Math.abs(n).toFixed(2)
  return n < 0 ? `▼ −${s}%` : `▲ +${s}%`
}

/** Plain number for input display: grouping, up to the decimals the user typed. */
export function formatInputDisplay(text: string): string {
  if (text === '') return ''
  const [int = '', dec] = text.split('.')
  const intPart = int === '' ? '0' : new Intl.NumberFormat('en-US').format(Number(int))
  return dec === undefined ? intPart : `${intPart}.${dec}`
}

/**
 * Cleans raw amount input: keeps digits and a single decimal point (commas are
 * accepted and dropped as grouping), caps at 2 decimals and MAX_AMOUNT.
 * Returns the cleaned text and its numeric value (null when empty).
 */
export function parseAmountInput(raw: string): { text: string; value: number | null } {
  let text = ''
  let seenDot = false
  for (const ch of raw.replace(/,/g, '')) {
    if (ch >= '0' && ch <= '9') text += ch
    else if (ch === '.' && !seenDot) {
      seenDot = true
      text += ch
    }
  }
  const [int = '', dec] = text.split('.')
  const cleanInt = int.replace(/^0+(?=\d)/, '')
  text = dec === undefined ? cleanInt : `${cleanInt}.${dec.slice(0, 2)}`
  if (text === '' || text === '.') return { text: text === '.' ? '0.' : '', value: text === '.' ? 0 : null }

  let value = Number(text)
  if (value > MAX_AMOUNT) {
    value = MAX_AMOUNT
    text = String(MAX_AMOUNT)
  }
  return { text, value }
}

const DATE_SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })

/** "2026-05-14" → "May 14" (dates from the API are calendar dates, so format in UTC). */
export function formatShortDate(isoDate: string): string {
  return DATE_SHORT.format(new Date(`${isoDate}T00:00:00Z`))
}
