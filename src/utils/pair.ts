import type { CurrencyCode, CurrencyPair } from '../types'

/** Choosing the currency already on the other side swaps the pair instead (spec US1 scenario 7). */
export function withFrom(pair: CurrencyPair, code: CurrencyCode): CurrencyPair {
  return code === pair.to ? { from: pair.to, to: pair.from } : { ...pair, from: code }
}

export function withTo(pair: CurrencyPair, code: CurrencyCode): CurrencyPair {
  return code === pair.from ? { from: pair.to, to: pair.from } : { ...pair, to: code }
}

export const swapPair = (pair: CurrencyPair): CurrencyPair => ({ from: pair.to, to: pair.from })

export const samePair = (a: CurrencyPair, b: CurrencyPair) => a.from === b.from && a.to === b.to
